import fs from 'fs'
import path from 'path'

const mdPath = path.resolve(process.cwd(), 'products.md')
const outputPath = path.resolve(process.cwd(), 'src', 'data', 'products.js')

function extractArray(raw, marker) {
  const idx = raw.indexOf(marker)
  if (idx === -1) return null
  const start = raw.indexOf('[', idx)
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === '[') depth++
    if (raw[i] === ']') {
      depth--
      if (depth === 0) return JSON.parse(raw.slice(start, i + 1))
    }
  }
  return null
}

function isEmpty(v) {
  if (v == null) return true
  if (typeof v === 'string') return v.trim() === ''
  return false
}

function isArabic(s) {
  if (!s || typeof s !== 'string') return false
  return /[\u0600-\u06FF]/.test(s)
}

function mergeItem(existing, incoming) {
  const out = { ...existing }
  if (isEmpty(out['Internal Reference']) && !isEmpty(incoming['Internal Reference']))
    out['Internal Reference'] = incoming['Internal Reference']
  if (isEmpty(out['Name']) && !isEmpty(incoming['Name'])) out['Name'] = incoming['Name']
  if (isEmpty(out['Product Category']) && !isEmpty(incoming['Product Category']))
    out['Product Category'] = incoming['Product Category']
  if (isEmpty(out['Customer Taxes']) && !isEmpty(incoming['Customer Taxes']))
    out['Customer Taxes'] = incoming['Customer Taxes']
  if (incoming['Quantity On Hand'] != null && (existing['Quantity On Hand'] == null || existing['Quantity On Hand'] < incoming['Quantity On Hand']))
    out['Quantity On Hand'] = incoming['Quantity On Hand']
  if (incoming['Forecasted Quantity'] != null && (existing['Forecasted Quantity'] == null || existing['Forecasted Quantity'] < incoming['Forecasted Quantity']))
    out['Forecasted Quantity'] = incoming['Forecasted Quantity']
  if (incoming['Sales Price'] != null && existing['Sales Price'] == null)
    out['Sales Price'] = incoming['Sales Price']
  if (isEmpty(out['Arabic Name']) && !isEmpty(incoming['Arabic Name']) && isArabic(incoming['Arabic Name']))
    out['Arabic Name'] = incoming['Arabic Name']
  return out
}

function slugify(value) {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\//g, ' ')
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/\s+/g, '-') || 'others'
}

function pickIcon(label) {
  const n = (label || '').toLowerCase()
  if (n.includes('baby')) return '👶'
  if (n.includes('milk')) return '🍼'
  if (n.includes('hair')) return '💇'
  if (n.includes('beauty') || n.includes('skin')) return '✨'
  if (n.includes('medical') || n.includes('device')) return '🩺'
  if (n.includes('personal') || n.includes('care')) return '🧴'
  if (n.includes('pharma') || n.includes('rx')) return '💊'
  if (n.includes('food') || n.includes('supplement')) return '🥗'
  if (n.includes('oral') || n.includes('tooth')) return '🦷'
  if (n.includes('female') || n.includes('pads')) return '🩸'
  return '📦'
}

function formatPrice(v) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}

function sanitizeNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const raw = fs.readFileSync(mdPath, 'utf8')

// 1. Parse PRODUCTS (Format 1)
const rawProducts = extractArray(raw, 'export const PRODUCTS =')
if (!rawProducts) throw new Error('PRODUCTS array not found')

// 2. Parse PURCHASE_ORDERS (Format 2) - may have Arabic names and extra products
const rawOrders = extractArray(raw, 'export const PURCHASE_ORDERS =') || []

// Build lookup by Reference (SKU) and by normalized Name for PURCHASE_ORDERS
const ordersByRef = new Map()
const ordersByName = new Map()
for (const o of rawOrders) {
  const ref = (o['Reference'] || '').toString().trim()
  const name = (o['Name'] || '').toString().trim().toLowerCase()
  if (ref) ordersByRef.set(ref, o)
  if (name) ordersByName.set(name, o)
}

// Deduplicate PRODUCTS by Barcode, merge new info from duplicates
const byBarcode = new Map()
for (const item of rawProducts) {
  const barcode = (item['Barcode'] || '').toString().trim()
  const key = barcode || `no-barcode-${rawProducts.indexOf(item)}`
  if (byBarcode.has(key)) {
    byBarcode.set(key, mergeItem(byBarcode.get(key), item))
  } else {
    byBarcode.set(key, { ...item })
  }
}

// Merge in Arabic names from PURCHASE_ORDERS where we can match
for (const [key, item] of byBarcode) {
  const ref = (item['Internal Reference'] || '').toString().trim()
  const name = (item['Name'] || '').toString().trim().toLowerCase()
  const po = ref ? ordersByRef.get(ref) : ordersByName.get(name)
  if (po) {
    if (isEmpty(item['Arabic Name']) && !isEmpty(po['Arabic Name']) && isArabic(po['Arabic Name']))
      item['Arabic Name'] = po['Arabic Name']
  }
}

// Add products from PURCHASE_ORDERS that are not in PRODUCTS (no Barcode match)
const seenRefs = new Set()
const seenNames = new Set()
for (const [, item] of byBarcode) {
  const r = (item['Internal Reference'] || '').trim()
  const n = (item['Name'] || '').trim().toLowerCase()
  if (r) seenRefs.add(r)
  if (n) seenNames.add(n)
}

for (const po of rawOrders) {
  const ref = (po['Reference'] || '').toString().trim()
  const name = (po['Name'] || '').toString().trim().toLowerCase()
  if (seenRefs.has(ref) || seenNames.has(name)) continue
  const arabicName = (po['Arabic Name'] || '').toString().trim()
  const barcode = /^\d+$/.test(arabicName) ? arabicName : null
  const id = barcode || ref || `po-${rawOrders.indexOf(po)}`
  if (byBarcode.has(id)) continue
  seenRefs.add(ref)
  seenNames.add(name)
  byBarcode.set(id, {
    'Barcode': barcode || '',
    'Internal Reference': ref,
    'Name': po['Name'] || 'Product',
    'Arabic Name': isArabic(arabicName) ? arabicName : '',
    'Product Category': 'Miscellaneous',
    'Quantity On Hand': po['Quantity'] ?? po['Total Quantity'] ?? 0,
    'Forecasted Quantity': po['Quantity'] ?? po['Total Quantity'] ?? 0,
    'Sales Price': po['Sales Price2'] ?? po['Sales Price'] ?? 0,
    'Customer Taxes': 'Sales VAT 15%',
  })
}

const deduped = Array.from(byBarcode.values())
const categoriesMap = new Map()

const products = deduped.map((item, idx) => {
  const catLabel = (item['Product Category'] || 'Miscellaneous').trim()
  const slug = slugify(catLabel) || 'miscellaneous'

  if (!categoriesMap.has(slug)) {
    categoriesMap.set(slug, {
      slug,
      name: catLabel,
      nameAr: catLabel,
      icon: pickIcon(catLabel),
    })
  }

  const qty = sanitizeNum(item['Quantity On Hand'])
  const fc = sanitizeNum(item['Forecasted Quantity'])
  const barcode = (item['Barcode'] || '').toString().trim()
  const id = barcode || (item['Internal Reference'] || '').trim() || `product-${idx + 1}`
  const nameAr = (item['Arabic Name'] || item['Name'] || '').trim()
  const name = (item['Name'] || 'Product').trim()

  const kw = encodeURIComponent(slug.replace(/[^a-z0-9]+/g, '-') || 'pharmacy')
  const img = `https://source.unsplash.com/featured/600x600?${kw}&sig=${idx + 1}`
  const imgs = [
    img,
    `https://source.unsplash.com/featured/600x600?medicine&sig=${idx + deduped.length}`,
    `https://source.unsplash.com/featured/600x600?healthcare&sig=${idx + deduped.length * 2}`,
  ]

  return {
    id,
    sku: (item['Internal Reference'] || '').trim() || null,
    barcode: barcode || null,
    name,
    nameAr: nameAr || name,
    price: formatPrice(item['Sales Price']),
    originalPrice: null,
    image: img,
    images: imgs,
    category: slug,
    categoryAr: catLabel,
    inStock: qty > 0,
    quantityOnHand: qty,
    forecastedQuantity: fc,
    taxes: (item['Customer Taxes'] || '').trim() || null,
    description: `${name} - ${catLabel}. Barcode: ${barcode || 'N/A'}.`,
  }
})

const categories = Array.from(categoriesMap.values())
const header = `// Generated from products.md - ${new Date().toISOString()}\n`
const out = `${header}export const categories = ${JSON.stringify(categories, null, 2)}\n\nexport const products = ${JSON.stringify(products, null, 2)}\n`

fs.writeFileSync(outputPath, out, 'utf8')
const addedFromOrders = products.length - (new Set(rawProducts.map((p) => (p['Barcode'] || '').toString().trim() || `nb-${rawProducts.indexOf(p)}`))).size
console.log(`Built ${products.length} products (${rawProducts.length} from PRODUCTS, ${rawOrders.length} from PURCHASE_ORDERS, ${products.length - rawProducts.length} added from orders), ${categories.length} categories`)
