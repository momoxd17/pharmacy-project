import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Package, Search } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useLanguage } from '../context/LanguageContext'

function getProductImages(p) {
  if (p.images?.length) return p.images
  return [p.image]
}

export default function Product() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { products } = useProducts()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { t, locale } = useLanguage()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)

  // Show all products table when id is "all"
  if (id === 'all') {
    const perPage = 25
    const filtered = products.filter((p) => {
      const q = search.toLowerCase()
      const name = (p.name || '').toLowerCase()
      const nameAr = (p.nameAr || '').toLowerCase()
      const cat = (p.categoryAr || p.category || '').toLowerCase()
      const barcode = (p.barcode || '').toLowerCase()
      return !q || name.includes(q) || nameAr.includes(q) || cat.includes(q) || barcode.includes(q)
    })
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
    const paginated = filtered.slice(page * perPage, (page + 1) * perPage)
    const isRtl = locale === 'ar'

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-7 h-7 text-[#1B98E0]" />
            {t('allProducts')}
          </h1>
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ltr:left-3 rtl:right-3" style={{ [isRtl ? 'right' : 'left']: '0.75rem' }} />
            <input
              type="text"
              placeholder={t('searchPlaceholder') || 'Search products...'}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B98E0] focus:border-transparent ${isRtl ? 'pl-4 pr-10' : ''}`}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#004180] text-white">
                <tr>
                  <th className={`px-4 py-3 text-left font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>#</th>
                  <th className={`px-4 py-3 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{locale === 'ar' ? 'المنتج' : 'Product'}</th>
                  <th className={`px-4 py-3 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{locale === 'ar' ? 'الباركود' : 'Barcode'}</th>
                  <th className={`px-4 py-3 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{locale === 'ar' ? 'الفئة' : 'Category'}</th>
                  <th className={`px-4 py-3 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{t('price')} ({t('sar')})</th>
                  <th className={`px-4 py-3 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{locale === 'ar' ? 'الكمية' : 'Stock'}</th>
                  <th className={`px-4 py-3 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-t border-gray-100 hover:bg-[#DFF2F3]/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500">{page * perPage + i + 1}</td>
                    <td className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <Link to={`/product/${p.id}`} className="text-[#004180] hover:text-[#1E9ED8] font-medium">
                        {locale === 'ar' ? p.nameAr : p.name}
                      </Link>
                    </td>
                    <td className={`px-4 py-3 text-gray-600 ${isRtl ? 'text-right' : 'text-left'}`}>{p.barcode || '-'}</td>
                    <td className={`px-4 py-3 text-gray-600 ${isRtl ? 'text-right' : 'text-left'}`}>{locale === 'ar' ? p.categoryAr : p.category}</td>
                    <td className={`px-4 py-3 font-medium text-[#004180] ${isRtl ? 'text-right' : 'text-left'}`}>{p.price}</td>
                    <td className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <span className={p.inStock ? 'text-green-600' : 'text-red-600'}>
                        {p.quantityOnHand ?? (p.inStock ? '✓' : '0')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/product/${p.id}`}
                        className="text-[#1B98E0] hover:text-[#004180] text-xs font-medium"
                      >
                        {locale === 'ar' ? 'عرض' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-12 text-gray-500">{t('noProductsInCategory')}</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {locale === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <span className="px-4 py-2 text-gray-600">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {locale === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-4">
          {filtered.length} {t('productsInCategory')}
        </p>
      </div>
    )
  }

  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">{t('productNotFound')}</p>
        <Link to="/product/all" className="text-[#004180] hover:text-[#1E9ED8] mt-2 inline-block">{t('viewAll')} {t('productsInCategory')}</Link>
        <br />
        <Link to="/" className="text-[#004180] hover:text-[#1E9ED8] mt-2 inline-block">{t('backToHome')}</Link>
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

  const handleShare = async (platform) => {
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
                    selectedImageIdx === i ? 'border-[#1B98E0]' : 'border-transparent'
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
          <Link to={`/category/${product.category}`} className="text-[#004180] hover:text-[#1E9ED8] text-sm mb-2 inline-block">
            {locale === 'ar' ? product.categoryAr : product.category}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{displayName}</h1>
          {product.name && product.name !== product.nameAr && (
            <p className="text-gray-500 text-sm mb-2">{product.name}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-[#004180] hover:text-[#1E9ED8]">{product.price} {t('sar')}</span>
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

          {product.barcode && (
            <p className="text-sm text-gray-500 mb-2">{locale === 'ar' ? 'الباركود: ' : 'Barcode: '}{product.barcode}</p>
          )}

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {t('addToCart')}
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
                  <div className={`absolute top-full mt-1 py-2 w-48 bg-white rounded-xl shadow-lg border z-50 ${locale === 'ar' ? 'right-0' : 'left-0'}`}>
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
                      {t('copyLink')}
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
                <h3 className="font-semibold text-gray-800 mb-2">{t('ingredients')}</h3>
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
              <h3 className="font-semibold text-gray-800 mb-2">{t('storageConditions')}</h3>
              <p>{product.storageConditions ?? defaultStorage}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('warnings')}</h3>
              <p>{product.warnings ?? defaultWarnings}</p>
            </div>
          </div>

          <Link
            to="/product/all"
            className="inline-flex items-center gap-2 mt-6 text-[#004180] hover:text-[#1E9ED8] text-sm font-medium"
          >
            <Package className="w-4 h-4" />
            {t('viewAll')} {t('productsInCategory')}
          </Link>
        </div>
      </div>
    </div>
  )
}