import { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'tadwa_favorites'

const FavoritesContext = createContext(null)

function loadFavorites() {
  try {
    if (typeof localStorage === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEY)
    const parsed = data ? JSON.parse(data) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveFavorites(ids) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {}
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites)

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const isFavorite = (productId) => favorites.includes(productId)

  const addFavorite = (productId) => {
    setFavorites((prev) => (prev.includes(productId) ? prev : [...prev, productId]))
  }

  const removeFavorite = (productId) => {
    setFavorites((prev) => prev.filter((id) => id !== productId))
  }

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, addFavorite, removeFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
