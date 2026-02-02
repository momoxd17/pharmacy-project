import { createContext, useContext, useState, useEffect } from 'react'
import { categories as defaultCategories, products as defaultProducts } from '../data/products'

const PRODUCTS_KEY = 'tadwa_products'
const CATEGORIES_KEY = 'tadwa_categories'

const ProductsContext = createContext(null)

function loadFromStorage(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') return fallback
    const data = localStorage.getItem(key)
    if (data) return JSON.parse(data)
  } catch {}
  return fallback
}

function saveToStorage(key, data) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => loadFromStorage(PRODUCTS_KEY, defaultProducts))
  const [categories, setCategories] = useState(() => loadFromStorage(CATEGORIES_KEY, defaultCategories))

  useEffect(() => {
    saveToStorage(PRODUCTS_KEY, products)
  }, [products])

  useEffect(() => {
    saveToStorage(CATEGORIES_KEY, categories)
  }, [categories])

  const addProduct = (product) => {
    const newProduct = { ...product, id: crypto.randomUUID() }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const slugify = (name) =>
    name
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]+/g, '')
      .toLowerCase()

  const addCategory = (category) => {
    const slug = category.slug || slugify(category.nameAr)
    const newCat = {
      slug,
      name: category.name ?? category.nameAr,
      nameAr: category.nameAr,
      icon: category.icon ?? '📦',
    }
    setCategories((prev) => [...prev, newCat])
  }

  const updateCategory = (slug, updates) => {
    setCategories((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, ...updates } : c))
    )
  }

  const deleteCategory = (slug) => {
    setCategories((prev) => prev.filter((c) => c.slug !== slug))
    setProducts((prev) => prev.filter((p) => p.category !== slug))
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
