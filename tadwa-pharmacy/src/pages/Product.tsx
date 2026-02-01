import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useLanguage } from '../context/LanguageContext'
import type { Product as ProductType } from '../data/products'

function getProductImages(p: ProductType): string[] {
  if (p.images?.length) return p.images
  return [p.image]
}

export default function Product() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { products } = useProducts()
  const { isFavorite, toggleFavorite } = useFavorites()
  const product = products.find((p) => p.id === id)
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">{t('productNotFound')}</p>
        <Link to="/" className="text-teal-600 mt-2 inline-block">{t('backToHome')}</Link>
      </div>
    )
  }

  const displayName = locale === 'ar' ? product.nameAr : product.name
  const images = getProductImages(product)
  const fav = isFavorite(product.id)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = encodeURIComponent(`${displayName} - ${product.price} ${t('sar')} - ${t('brand')}`)

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`,
  }

  const handleShare = async (platform: keyof typeof shareLinks | 'copy') => {
    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrl)
      setShareOpen(false)
      return
    }
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    setShareOpen(false)
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.nameAr,
      price: product.price,
      image: product.image,
    })
  }

  const defaultDesc = t('defaultDesc')
  const defaultStorage = t('defaultStorage')
  const defaultWarnings = t('defaultWarnings')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group">
            <img
              src={images[selectedImageIdx]}
              alt={displayName}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIdx((i) => (i === 0 ? images.length - 1 : i - 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedImageIdx((i) => (i === images.length - 1 ? 0 : i + 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                fav ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
            </button>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIdx(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImageIdx === i ? 'border-teal-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <Link to={`/category/${product.category}`} className="text-teal-600 text-sm mb-2 inline-block">
            {locale === 'ar' ? product.categoryAr : product.category}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{displayName}</h1>
          {product.name && (
            <p className="text-gray-500 text-sm mb-2">{product.name}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-teal-600">{product.price} {t('sar')}</span>
            {product.originalPrice && (
              <>
                <span className="text-gray-400 line-through">{product.originalPrice} {t('sar')}</span>
                {discount > 0 && (
                  <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-sm">
                    وفر {discount}%
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              أضف للسلة
            </button>
            <div className="relative">
              <button
                onClick={() => setShareOpen(!shareOpen)}
                className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                title={t('share')}
              >
                <Share2 className="w-5 h-5" />
              </button>
              {shareOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShareOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 py-2 w-48 bg-white rounded-xl shadow-lg border z-50">
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="text-green-600">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="text-blue-600">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="text-sky-500">X (Twitter)</span>
                    </button>
                    <button
                      onClick={() => handleShare('telegram')}
                      className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="text-sky-400">Telegram</span>
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full text-right px-4 py-2 hover:bg-gray-50"
                    >
                      نسخ الرابط
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('description')}</h3>
              <p>{product.description ?? defaultDesc}</p>
            </div>

            {product.ingredients && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">المكونات</h3>
                <p>{product.ingredients}</p>
              </div>
            )}

            {product.usageInstructions && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('usageInstructions')}</h3>
                <p>{product.usageInstructions}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">ظروف التخزين</h3>
              <p>{product.storageConditions ?? defaultStorage}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('warnings')}</h3>
              <p>{product.warnings ?? defaultWarnings}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
