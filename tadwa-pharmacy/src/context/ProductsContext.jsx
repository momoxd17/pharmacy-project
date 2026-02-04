import { createContext, useContext, useState, useEffect } from 'react'

const PRODUCTS_KEY = 'tadwa_products'
const CATEGORIES_KEY = 'tadwa_categories'

const ProductsContext = createContext(null)

const STORAGE_VERSION = 2

function loadFromStorage(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') return fallback
    const ver = localStorage.getItem('tadwa_products_version')
    if (ver !== String(STORAGE_VERSION)) {
      localStorage.removeItem(PRODUCTS_KEY)
      localStorage.removeItem(CATEGORIES_KEY)
      localStorage.setItem('tadwa_products_version', String(STORAGE_VERSION))
      return fallback
    }
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)

  const refetchProducts = async () => {
    setProductsLoading(true)
    try {
      const res = await fetch('/products.json?t=' + Date.now())
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      if (data.products?.length > 0) setProducts(data.products)
      else {
        const fromStorage = loadFromStorage(PRODUCTS_KEY, [])
        if (fromStorage.length > 0) setProducts(fromStorage)
      }
      if (data.categories?.length > 0) setCategories(data.categories)
      else {
        const fromStorage = loadFromStorage(CATEGORIES_KEY, [])
        if (fromStorage.length > 0) setCategories(fromStorage)
      }
    } catch {
      const p = loadFromStorage(PRODUCTS_KEY, [])
      const c = loadFromStorage(CATEGORIES_KEY, [])
      if (p.length > 0) setProducts(p)
      if (c.length > 0) setCategories(c)
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setProductsLoading(true)
      try {
        const res = await fetch('/products.json?t=' + Date.now(), { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        if (cancelled) return
        if (data.products?.length > 0) {
          setProducts(data.products)
          try {
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data.products))
          } catch {}
        } else {
          const fromStorage = loadFromStorage(PRODUCTS_KEY, [])
          if (fromStorage.length > 0) setProducts(fromStorage)
        }
        if (data.categories?.length > 0) {
          setCategories(data.categories)
          try {
            localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data.categories))
          } catch {}
        } else {
          const fromStorage = loadFromStorage(CATEGORIES_KEY, [])
          if (fromStorage.length > 0) setCategories(fromStorage)
        }
      } catch {
        if (cancelled) return
        const p = loadFromStorage(PRODUCTS_KEY, [])
        const c = loadFromStorage(CATEGORIES_KEY, [])
        if (p.length > 0) setProducts(p)
        if (c.length > 0) setCategories(c)
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      const id = setTimeout(() => {
        try {
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
        } catch {}
      }, 300)
      return () => clearTimeout(id)
    }
  }, [products])

  useEffect(() => {
    if (categories.length > 0) {
      const id = setTimeout(() => {
        try {
          localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
        } catch {}
      }, 300)
      return () => clearTimeout(id)
    }
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
        productsLoading,
        refetchProducts,
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
