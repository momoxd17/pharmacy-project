// import XLSX from 'xlsx'
// import fs from 'fs'
// import path from 'path'

// const productTemplatePath = path.resolve('s:\\Downloads\\Product Template (product.template).xlsx')
// const purchaseOrderPath = path.resolve('s:\\Downloads\\Purchase Order (purchase.order).xlsx')
// const projectProductTemplate = path.resolve(process.cwd(), 'Product Template (product.template).xlsx')
// const outputPath = path.resolve(process.cwd(), 'src', 'data', 'products.js')

// function col(obj, ...keys) {
//   const k = Object.keys(obj || {}).find((k) => keys.some((key) => String(k).toLowerCase().includes(String(key).toLowerCase())))
//   return k ? obj[k] : undefined
// }

// function slugify(v) {
//   return (v || '').toString().trim().toLowerCase().replace(/&/g, 'and').replace(/\//g, ' ').replace(/[^\w\s\u0600-\u06FF-]/g, '').replace(/\s+/g, '-') || 'others'
// }

// function pickIcon(label) {
//   const n = (label || '').toLowerCase()
//   if (n.includes('baby')) return '👶'
//   if (n.includes('milk')) return '🍼'
//   if (n.includes('hair')) return '💇'
//   if (n.includes('beauty') || n.includes('skin')) return '✨'
//   if (n.includes('medical') || n.includes('device')) return '🩺'
//   if (n.includes('personal') || n.includes('care')) return '🧴'
//   if (n.includes('pharma') || n.includes('rx')) return '💊'
//   if (n.includes('food') || n.includes('supplement')) return '🥗'
//   if (n.includes('oral') || n.includes('tooth')) return '🦷'
//   if (n.includes('female') || n.includes('pads')) return '🩸'
//   return '📦'
// }

// function isArabic(s) {
//   if (!s || typeof s !== 'string') return false
//   return /[\u0600-\u06FF]/.test(s)
// }

// function readExcelSheet(filePath) {
//   if (!fs.existsSync(filePath)) return []
//   const wb = XLSX.readFile(filePath)
//   const sheet = wb.Sheets[wb.SheetNames[0]]
//   if (!sheet) return []
//   return XLSX.utils.sheet_to_json(sheet)
// }

// function fromProductTemplate(row, idx) {
//   const name = col(row, 'name', 'product') || row.Name
//   const barcode = col(row, 'barcode') || row.Barcode
//   const price = col(row, 'sales price', 'list price', 'price') ?? row['Sales Price']
//   const cat = col(row, 'product category', 'categ', 'category') || row['Product Category'] || 'Miscellaneous'
//   const qty = col(row, 'quantity on hand', 'qty') ?? row['Quantity On Hand'] ?? row['Forecasted Quantity']
//   const sku = col(row, 'internal reference', 'reference', 'default code') || row['Internal Reference']
//   const slug = slugify(cat)
//   const id = (barcode || '').toString().trim() || (sku || '').toString().trim() || `pt-${idx}`
//   const img = `https://source.unsplash.com/featured/600x600?pharmacy&sig=${idx + 1000}`
//   return {
//     id,
//     sku: (sku || '').toString().trim() || null,
//     barcode: (barcode || '').toString().trim() || null,
//     name: (name || 'Product').toString().trim(),
//     nameAr: (name || 'منتج').toString().trim(),
//     price: Math.round((Number(price) || 0) * 100) / 100,
//     originalPrice: null,
//     image: img,
//     images: [img, `https://source.unsplash.com/featured/600x600?medicine&sig=${idx + 2000}`, `https://source.unsplash.com/featured/600x600?healthcare&sig=${idx + 3000}`],
//     category: slug,
//     categoryAr: (cat || 'Miscellaneous').toString().trim(),
//     inStock: (Number(qty) || 0) > 0,
//     quantityOnHand: Number(qty) || 0,
//     forecastedQuantity: Number(qty) || 0,
//     taxes: (col(row, 'customer taxes', 'taxes') || row['Customer Taxes'] || '').toString().trim() || null,
//     description: `${name || 'Product'} - ${cat || 'Miscellaneous'}. Barcode: ${(barcode || 'N/A')}.`,
//   }
// }

// function fromPurchaseOrder(row, idx) {
//   const name = col(row, 'name', 'product') || row.Name
//   const arabicName = col(row, 'arabic name', 'name_ar') || row['Arabic Name']
//   const ref = col(row, 'reference', 'internal reference') || row.Reference
//   const price = col(row, 'sales price2', 'sales price', 'price') ?? row['Sales Price2'] ?? row['Sales Price']
//   const qty = col(row, 'quantity', 'total quantity') ?? row.Quantity ?? row['Total Quantity']
//   const barcode = /^\d+$/.test(String(arabicName || '').trim()) ? String(arabicName).trim() : null
//   const id = barcode || (ref || '').toString().trim() || `po-${idx}`
//   const slug = 'miscellaneous'
//   const img = `https://source.unsplash.com/featured/600x600?pharmacy&sig=${idx + 5000}`
//   return {
//     id,
//     sku: (ref || '').toString().trim() || null,
//     barcode: barcode || null,
//     name: (name || 'Product').toString().trim(),
//     nameAr: (isArabic(arabicName) ? arabicName : name || 'منتج').toString().trim(),
//     price: Math.round((Number(price) || 0) * 100) / 100,
//     originalPrice: null,
//     image: img,
//     images: [img, `https://source.unsplash.com/featured/600x600?medicine&sig=${idx + 6000}`, `https://source.unsplash.com/featured/600x600?healthcare&sig=${idx + 7000}`],
//     category: slug,
//     categoryAr: 'Miscellaneous',
//     inStock: (Number(qty) || 0) > 0,
//     quantityOnHand: Number(qty) || 0,
//     forecastedQuantity: Number(qty) || 0,
//     taxes: 'Sales VAT 15%',
//     description: `${name || 'Product'} - Miscellaneous.`,
//   }
// }

// // Load existing products
// const existingModule = fs.readFileSync(outputPath, 'utf8')
// const categoriesMatch = existingModule.match(/export const categories = (\[[\s\S]*?\]);/)
// const productsMatch = existingModule.match(/export const products = (\[[\s\S]*\])\s*$/m)
// let categories = []
// let existingProducts = []
// if (categoriesMatch) {
//   try {
//     categories = JSON.parse(categoriesMatch[1])
//   } catch {}
// }
// if (productsMatch) {
//   try {
//     existingProducts = JSON.parse(productsMatch[1])
//   } catch {}
// }

// const byId = new Map()
// existingProducts.forEach((p) => byId.set(p.id, { ...p }))

// // Category map for slug lookup
// const catBySlug = new Map()
// categories.forEach((c) => catBySlug.set(c.slug, c))

// function ensureCategory(slug, name, nameAr) {
//   if (!catBySlug.has(slug)) {
//     const c = { slug, name: name || slug, nameAr: nameAr || name || slug, icon: pickIcon(name || slug) }
//     categories.push(c)
//     catBySlug.set(slug, c)
//   }
// }

// // Read Product Template
// let ptPath = productTemplatePath
// if (!fs.existsSync(ptPath)) ptPath = projectProductTemplate
// if (fs.existsSync(ptPath)) {
//   const rows = readExcelSheet(ptPath)
//   rows.forEach((row, idx) => {
//     const p = fromProductTemplate(row, idx)
//     if (p.name && p.name !== 'Product') {
//       ensureCategory(p.category, p.categoryAr, p.categoryAr)
//       if (!byId.has(p.id)) byId.set(p.id, p)
//       else {
//         const existing = byId.get(p.id)
//         if (!existing.nameAr || existing.nameAr === existing.name) existing.nameAr = p.nameAr
//         if (p.quantityOnHand > (existing.quantityOnHand || 0)) existing.quantityOnHand = p.quantityOnHand
//       }
//     }
//   })
//   console.log(`Product Template: read ${rows.length} rows`)
// } else {
//   console.log('Product Template file not found at', ptPath)
// }

// // Read Purchase Order
// if (fs.existsSync(purchaseOrderPath)) {
//   const rows = readExcelSheet(purchaseOrderPath)
//   rows.forEach((row, idx) => {
//     const p = fromPurchaseOrder(row, idx)
//     if (p.name && p.name !== 'Product') {
//       ensureCategory(p.category, p.categoryAr, p.categoryAr)
//       if (!byId.has(p.id)) byId.set(p.id, p)
//       else {
//         const existing = byId.get(p.id)
//         if (isArabic(p.nameAr) && (!existing.nameAr || existing.nameAr === existing.name)) existing.nameAr = p.nameAr
//       }
//     }
//   })
//   console.log(`Purchase Order: read ${rows.length} rows`)
// } else {
//   console.log('Purchase Order file not found at', purchaseOrderPath)
// }

// const products = Array.from(byId.values())
// const header = `// Updated from Excel imports - ${new Date().toISOString()}\n`
// const out = `${header}export const categories = ${JSON.stringify(categories, null, 2)}\n\nexport const products = ${JSON.stringify(products, null, 2)}\n`
// fs.writeFileSync(outputPath, out, 'utf8')
// const jsonPath = path.resolve(process.cwd(), 'public', 'products.json')
// const jsonDir = path.dirname(jsonPath)
// if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true })
// fs.writeFileSync(jsonPath, JSON.stringify({ categories, products }), 'utf8')
// console.log(`Written ${products.length} products, ${categories.length} categories to ${outputPath} and public/products.json`)
