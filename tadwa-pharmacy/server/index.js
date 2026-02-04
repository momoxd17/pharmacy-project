import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import * as XLSX from 'xlsx'
import initSqlJs from 'sql.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'tadwa.db')
const productsJsonPath = path.join(__dirname, '..', 'public', 'products.json')

const JWT_SECRET = process.env.JWT_SECRET || 'tadwa-pharmacy-secret-change-in-production'
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'moaazsamehzeedan@gmail.com').toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'momoxd17'
const SALT_ROUNDS = 10

const app = express()
let db = null

async function initDb() {
  const SQL = await initSqlJs()
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS medical_advice_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      age TEXT NOT NULL,
      gender TEXT NOT NULL,
      condition TEXT,
      medications TEXT,
      question TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS chatbot_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS user_cards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      last4 TEXT NOT NULL,
      brand TEXT,
      expiry TEXT NOT NULL,
      cardholder_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  const ADMIN_EMAIL_2 = 'zeedanpharama@gmail.com'
  const ADMIN_PASSWORD_2 = 'mynameisnottotallysecret'

  function ensureAdmin(email, password, label) {
    const stmt = db.prepare('SELECT id FROM users WHERE email = ?')
    stmt.bind([email.toLowerCase()])
    if (!stmt.step()) {
      const hashed = bcrypt.hashSync(password, SALT_ROUNDS)
      db.run(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID?.() || crypto.randomBytes(16).toString('hex'), 'مدير النظام', email.toLowerCase(), hashed, 'admin']
      )
      console.log(label + ' admin created')
    }
    stmt.free()
  }

  ensureAdmin(ADMIN_EMAIL, ADMIN_PASSWORD, 'Primary')
  ensureAdmin(ADMIN_EMAIL_2, ADMIN_PASSWORD_2, 'Second')
  saveDb()
  console.log('Database ready')
}

function saveDb() {
  if (db) {
    const data = db.export()
    fs.writeFileSync(dbPath, Buffer.from(data))
  }
}

function verifyPassword(stored, plain) {
  if (stored.startsWith('$2')) return bcrypt.compareSync(plain, stored)
  return stored === plain
}

function hashPassword(plain) {
  return bcrypt.hashSync(plain, SALT_ROUNDS)
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = auth.slice(7)
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

function sanitizeStr(val, maxLen = 500) {
  if (val == null) return ''
  const s = String(val).trim()
  return s.length > maxLen ? s.slice(0, maxLen) : s
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname || '').toLowerCase()
    if (ext.endsWith('.xlsx') || ext.endsWith('.xls') || ext.endsWith('.csv')) cb(null, true)
    else cb(new Error('Only .xlsx, .xls, and .csv files are allowed'))
  },
})

function readProductsJson() {
  try {
    if (fs.existsSync(productsJsonPath)) {
      const raw = fs.readFileSync(productsJsonPath, 'utf8')
      return JSON.parse(raw)
    }
  } catch {}
  return { categories: [], products: [] }
}

function writeProductsJson(data) {
  const dir = path.dirname(productsJsonPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(productsJsonPath, JSON.stringify(data), 'utf8')
}

function slugify(v) {
  return (v || '').toString().trim().toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\//g, ' ')
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/\s+/g, '-') || 'miscellaneous'
}

function col(obj, ...keys) {
  const k = Object.keys(obj || {}).find((k) =>
    keys.some((key) => String(k).toLowerCase().includes(String(key).toLowerCase()))
  )
  return k ? obj[k] : undefined
}

function parseExcelOrCsv(buffer, filename) {
  const fn = (filename || '').toLowerCase()
  const isCsv = fn.endsWith('.csv')
  const opts = isCsv ? { type: 'string' } : { type: 'buffer', raw: true }
  const input = isCsv ? buffer.toString('utf8') : buffer
  const wb = XLSX.read(input, opts)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json(sheet)
}

function rowToProduct(row, idx, existingById) {
  const name = col(row, 'name', 'product', 'name_en') || col(row, 'Name', 'Product') || ''
  const nameAr = col(row, 'name_ar', 'arabic name', 'nameAr') || col(row, 'Arabic Name', 'Name Ar') || name || 'منتج'
  const barcode = col(row, 'barcode') || col(row, 'Barcode') || ''
  const sku = col(row, 'internal reference', 'sku', 'reference') || col(row, 'Internal Reference', 'SKU') || ''
  const price = col(row, 'sales price', 'price', 'list price') ?? col(row, 'Sales Price', 'Price') ?? 0
  const cat = col(row, 'product category', 'category', 'categ') || col(row, 'Product Category', 'Category') || 'Miscellaneous'
  const qty = col(row, 'quantity on hand', 'quantity', 'qty') ?? col(row, 'Quantity On Hand', 'Quantity') ?? 0
  const image = col(row, 'image', 'image url') || col(row, 'Image') || `https://source.unsplash.com/featured/600x600?pharmacy&sig=${idx + 1000}`
  const description = col(row, 'description') || col(row, 'Description') || `${name || 'Product'} - ${cat}.`

  const slug = slugify(cat)
  const id = (barcode || '').toString().trim() || (sku || '').toString().trim() || crypto.randomUUID()

  return {
    id,
    sku: (sku || '').toString().trim() || null,
    barcode: (barcode || '').toString().trim() || null,
    name: (name || 'Product').toString().trim(),
    nameAr: (nameAr || 'منتج').toString().trim(),
    price: Math.round((Number(price) || 0) * 100) / 100,
    originalPrice: null,
    image,
    images: [image],
    category: slug,
    categoryAr: (cat || 'Miscellaneous').toString().trim(),
    inStock: (Number(qty) || 0) > 0,
    quantityOnHand: Number(qty) || 0,
    forecastedQuantity: Number(qty) || 0,
    taxes: null,
    description,
  }
}

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '50kb' }))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, try again later' },
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts' },
})
app.use('/api', apiLimiter)

app.get('/', (req, res) => {
  res.json({ message: 'Tadwa Pharmacy API', status: 'running', version: '1.0' })
})

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    const trimmedEmail = sanitizeStr(email, 255).toLowerCase()
    const trimmedPassword = String(password || '')

    if (!trimmedEmail || !trimmedPassword) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const stmt = db.prepare('SELECT id, name, email, password, role FROM users WHERE email = ?')
    stmt.bind([trimmedEmail])
    if (!stmt.step()) {
      stmt.free()
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    }
    const row = stmt.getAsObject()
    stmt.free()

    if (!verifyPassword(row.password, trimmedPassword)) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    }

    if (!row.password.startsWith('$2')) {
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashPassword(trimmedPassword), row.id])
      saveDb()
    }

    const token = jwt.sign(
      { id: row.id, email: row.email, role: row.role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      token,
      user: { id: row.id, name: row.name, email: row.email, role: row.role || 'user' },
    })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/api/users', apiLimiter, async (req, res) => {
  try {
    const { id, name, email, password, role = 'user' } = req.body
    const safeName = sanitizeStr(name, 200)
    const safeEmail = sanitizeStr(email, 255).toLowerCase()
    const safePassword = String(password || '').trim()

    if (!id || !safeName || !safeEmail || !safePassword) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    if (safePassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    if (role !== 'user') return res.status(400).json({ error: 'Invalid role' })

    const hashed = hashPassword(safePassword)
    db.run(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [sanitizeStr(id, 100), safeName, safeEmail, hashed, 'user']
    )
    saveDb()
    res.json({ success: true })
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/medical-advice', apiLimiter, (req, res) => {
  try {
    const { name, email, phone, age, gender, condition, medications, question } = req.body
    const safeName = sanitizeStr(name, 200)
    const safeEmail = sanitizeStr(email, 255)
    const safePhone = sanitizeStr(phone, 50)
    const safeAge = sanitizeStr(age, 20)
    const safeGender = sanitizeStr(gender, 20)
    const safeCondition = sanitizeStr(condition, 1000)
    const safeMeds = sanitizeStr(medications, 1000)
    const safeQuestion = sanitizeStr(question, 2000)

    if (!safeName || !safeEmail || !safePhone || !safeAge || !safeGender || !safeQuestion) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    db.run(
      `INSERT INTO medical_advice_requests (name, email, phone, age, gender, condition, medications, question)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [safeName, safeEmail, safePhone, safeAge, safeGender, safeCondition, safeMeds, safeQuestion]
    )
    saveDb()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

app.get('/api/medical-advice', authMiddleware, adminOnly, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM medical_advice_requests ORDER BY created_at DESC')
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

app.delete('/api/medical-advice/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id < 1) return res.status(400).json({ error: 'Invalid ID' })
    db.run('DELETE FROM medical_advice_requests WHERE id = ?', [id])
    saveDb()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

app.post('/api/chatbot-questions', apiLimiter, (req, res) => {
  try {
    const { question } = req.body
    const safeQuestion = typeof question === 'string' ? sanitizeStr(question, 1000) : ''
    if (!safeQuestion) return res.status(400).json({ error: 'Question required' })
    const userAgent = sanitizeStr(req.headers['user-agent'] || '', 500)
    db.run('INSERT INTO chatbot_questions (question, user_agent) VALUES (?, ?)', [safeQuestion, userAgent])
    saveDb()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

app.get('/api/chatbot-questions', authMiddleware, adminOnly, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM chatbot_questions ORDER BY created_at DESC')
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

app.delete('/api/chatbot-questions/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id < 1) return res.status(400).json({ error: 'Invalid ID' })
    db.run('DELETE FROM chatbot_questions WHERE id = ?', [id])
    saveDb()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

app.post('/api/feedback', apiLimiter, (req, res) => {
  try {
    const { email, message } = req.body
    const safeEmail = sanitizeStr(email, 255)
    const safeMessage = sanitizeStr(message, 2000)
    if (!safeEmail || !safeMessage) {
      return res.status(400).json({ error: 'Email and message required' })
    }
    db.run('INSERT INTO feedback (email, message) VALUES (?, ?)', [safeEmail, safeMessage])
    saveDb()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

app.get('/api/feedback', authMiddleware, adminOnly, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC')
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

app.delete('/api/feedback/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id < 1) return res.status(400).json({ error: 'Invalid ID' })
    db.run('DELETE FROM feedback WHERE id = ?', [id])
    saveDb()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

app.get('/api/users', authMiddleware, adminOnly, (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

// User's saved cards (auth required) - store only last4, brand, expiry, cardholder (never full number or CVV)
app.get('/api/users/me/cards', authMiddleware, (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, last4, brand, expiry, cardholder_name, created_at FROM user_cards WHERE user_id = ? ORDER BY created_at DESC')
    stmt.bind([req.user.id])
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

app.post('/api/users/me/cards', authMiddleware, (req, res) => {
  try {
    const { last4, brand, expiry, cardholderName } = req.body
    const safeLast4 = sanitizeStr(String(last4 || ''), 4).replace(/\D/g, '').slice(-4)
    const safeBrand = sanitizeStr(brand, 20) || 'card'
    const safeExpiry = sanitizeStr(String(expiry || ''), 5)
    const safeName = sanitizeStr(cardholderName, 100)

    if (!safeLast4 || safeLast4.length !== 4) {
      return res.status(400).json({ error: 'Invalid card data' })
    }
    const id = crypto.randomUUID?.() || crypto.randomBytes(16).toString('hex')
    db.run(
      'INSERT INTO user_cards (id, user_id, last4, brand, expiry, cardholder_name) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.user.id, safeLast4, safeBrand, safeExpiry, safeName || null]
    )
    saveDb()
    res.json({ id, last4: safeLast4, brand: safeBrand, expiry: safeExpiry, cardholder_name: safeName || null })
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

app.delete('/api/users/me/cards/:id', authMiddleware, (req, res) => {
  try {
    const id = sanitizeStr(req.params.id, 100)
    db.run('DELETE FROM user_cards WHERE id = ? AND user_id = ?', [id, req.user.id])
    saveDb()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

// Admin: list users with their saved cards (last4, brand only)
app.get('/api/users/:id/cards', authMiddleware, adminOnly, (req, res) => {
  try {
    const userId = sanitizeStr(req.params.id, 100)
    const stmt = db.prepare('SELECT id, last4, brand, expiry, cardholder_name, created_at FROM user_cards WHERE user_id = ? ORDER BY created_at DESC')
    stmt.bind([userId])
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Request failed' })
  }
})

// Products API - public read
app.get('/api/products', (req, res) => {
  try {
    const data = readProductsJson()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' })
  }
})

// Admin: Import products from Excel/CSV
app.post('/api/products/import', authMiddleware, adminOnly, upload.single('file'), (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const rows = parseExcelOrCsv(req.file.buffer, req.file.originalname)
    if (!rows.length) {
      return res.status(400).json({ error: 'File is empty or has no valid rows' })
    }

    const data = readProductsJson()
    const byId = new Map()
    ;(data.products || []).forEach((p) => byId.set(p.id, { ...p }))

    const catBySlug = new Map()
    ;(data.categories || []).forEach((c) => catBySlug.set(c.slug, c))

    function ensureCategory(slug, nameAr) {
      if (!catBySlug.has(slug)) {
        const c = { slug, name: nameAr || slug, nameAr: nameAr || slug, icon: '📦' }
        data.categories = data.categories || []
        data.categories.push(c)
        catBySlug.set(c.slug, c)
      }
    }

    let added = 0
    let updated = 0
    for (let i = 0; i < rows.length; i++) {
      const p = rowToProduct(rows[i], i, byId)
      if (!p.name || p.name === 'Product') continue
      ensureCategory(p.category, p.categoryAr)
      if (!byId.has(p.id)) {
        byId.set(p.id, p)
        added++
      } else {
        const existing = byId.get(p.id)
        Object.assign(existing, p)
        updated++
      }
    }

    data.products = Array.from(byId.values())
    writeProductsJson(data)

    res.json({
      success: true,
      added,
      updated,
      total: data.products.length,
      message: `تم استيراد ${added} منتج جديد وتحديث ${updated} منتج. إجمالي المنتجات: ${data.products.length}`,
    })
  } catch (err) {
    const msg = err.message || 'Import failed'
    res.status(400).json({ error: msg })
  }
})

const PORT = process.env.PORT || 3001

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Tadwa Pharmacy API running on http://localhost:${PORT}`)
  })
}).catch(err => {
  console.error('Failed to start database:', err)
  process.exit(1)
})
