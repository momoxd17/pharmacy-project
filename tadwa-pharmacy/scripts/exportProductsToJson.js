import fs from 'fs'
import path from 'path'

const productsJsPath = path.resolve(process.cwd(), 'src', 'data', 'products.js')
const outputPath = path.resolve(process.cwd(), 'public', 'products.json')

const raw = fs.readFileSync(productsJsPath, 'utf8')

function extractArray(str, name) {
  const prefix = `export const ${name} = `
  const start = str.indexOf(prefix)
  if (start === -1) return []
  const arrStart = str.indexOf('[', start)
  if (arrStart === -1) return []
  let depth = 0
  for (let i = arrStart; i < str.length; i++) {
    if (str[i] === '[') depth++
    if (str[i] === ']') {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(str.slice(arrStart, i + 1))
        } catch {
          return []
        }
      }
    }
  }
  return []
}

const categories = extractArray(raw, 'categories')
const products = extractArray(raw, 'products')

const dir = path.dirname(outputPath)
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify({ categories, products }), 'utf8')
console.log(`Exported ${products.length} products, ${categories.length} categories to public/products.json`)
