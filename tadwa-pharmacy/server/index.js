import express from 'express'
import cors from 'cors'
import initSqlJs from 'sql.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'tadwa.db')

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
  saveDb()
  console.log('Database ready')
}

function saveDb() {
  if (db) {
    const data = db.export()
    fs.writeFileSync(dbPath, Buffer.from(data))
  }
}

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Tadwa Pharmacy API', status: 'running', version: '1.0' })
})

app.post('/api/users', (req, res) => {
  try {
    const { id, name, email, password, role = 'user' } = req.body
    if (!id || !name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    db.run(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, password, role]
    )
    saveDb()
    res.json({ success: true })
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/medical-advice', (req, res) => {
  try {
    const { name, email, phone, age, gender, condition, medications, question } = req.body
    if (!name || !email || !phone || !age || !gender || !question) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    db.run(
      `INSERT INTO medical_advice_requests (name, email, phone, age, gender, condition, medications, question)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, age, gender, condition || '', medications || '', question]
    )
    saveDb()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/medical-advice', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM medical_advice_requests ORDER BY created_at DESC')
    const rows = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject())
    }
    stmt.free()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/chatbot-questions', (req, res) => {
  try {
    const { question } = req.body
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question required' })
    }
    const userAgent = req.headers['user-agent'] || ''
    db.run('INSERT INTO chatbot_questions (question, user_agent) VALUES (?, ?)', [question.trim(), userAgent])
    saveDb()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/chatbot-questions', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM chatbot_questions ORDER BY created_at DESC')
    const rows = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject())
    }
    stmt.free()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/users', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')
    const rows = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject())
    }
    stmt.free()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Tadwa Pharmacy API running on http://localhost:${PORT}`)
    console.log('Open http://localhost:' + PORT + ' in browser to verify')
  })
}).catch(err => {
  console.error('Failed to start database:', err)
  process.exit(1)
})
