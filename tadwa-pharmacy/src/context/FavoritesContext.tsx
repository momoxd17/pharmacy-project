import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const STORAGE_KEY = 'tadwa_favorites'

interface FavoritesContextType {
  favorites: string[]
  isFavorite: (productId: string) => boolean
  toggleFavorite: (productId: string) => void
  addFavorite: (productId: string) => void
  removeFavorite: (productId: string) => void
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

function loadFavorites(): string[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEY)
    const parsed = data ? JSON.parse(data) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveFavorites(ids: string[]) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {}
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites)

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const isFavorite = (productId: string) => favorites.includes(productId)

  const addFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev : [...prev, productId]))
  }

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== productId))
  }

  const toggleFavorite = (productId: string) => {
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
