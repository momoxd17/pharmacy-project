import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useLanguage } from '../context/LanguageContext'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { t, locale } = useLanguage()
  const fav = isFavorite(product.id)
  const displayName = locale === 'ar' ? product.nameAr : product.name
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      productId: product.id,
      name: product.nameAr,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100 group"
    >
      <div className="aspect-square relative bg-gray-100">
        <img
          src={product.images?.[0] ?? product.image}
          alt={displayName}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite(product.id)
          }}
          className={`absolute top-2 left-2 p-2 rounded-full transition-colors ${
            fav ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'
          }`}
          title={fav ? 'إزالة من المفضلة' : 'أضف للمفضلة'}
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
        </button>
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
            -{discount}%
          </span>
        )}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 left-2 right-2 bg-black text-white py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          {t('addToCart')}
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-800 line-clamp-2 mb-1">{displayName}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[#004180] font-bold">{product.price} {t('sar')}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through">{product.originalPrice} {t('sar')}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default memo(ProductCard)
