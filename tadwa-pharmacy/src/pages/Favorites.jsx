import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import { useProducts } from '../context/ProductsContext'
import { useLanguage } from '../context/LanguageContext'
import ProductCard from '../components/ProductCard'

export default function Favorites() {
  const { t } = useLanguage()
  const { favorites } = useFavorites()
  const { products } = useProducts()
  const favoriteProducts = products.filter((p) => favorites.includes(p.id))

  if (favorites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('noFavorites')}</h2>
        <p className="text-gray-500 mb-6">{t('noFavoritesDesc')}</p>
        <Link
          to="/"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
        >
          {t('browseProducts')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('myFavorites')}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {favoriteProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
