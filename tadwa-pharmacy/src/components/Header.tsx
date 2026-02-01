import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Search, Menu, MapPin, User, LogOut, Heart, X } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useAuth } from '../context/AuthContext'
import { useDelivery } from '../context/DeliveryContext'
import { useLanguage } from '../context/LanguageContext'
import SearchBar from './SearchBar'

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false)
  const [selectedRegionId, setSelectedRegionId] = useState('')
  const { itemCount } = useCart()
  const { user, logout } = useAuth()
  const { categories } = useProducts()
  const { favorites } = useFavorites()
  const { t, locale, setLocale } = useLanguage()
  const { deliveryRegionName, deliveryRegionId, setDeliveryRegion, regions } = useDelivery()

  const handleDeliveryChange = () => {
    if (selectedRegionId) {
      setDeliveryRegion(selectedRegionId)
      setDeliveryModalOpen(false)
    }
  }

  const openDeliveryModal = () => {
    setSelectedRegionId(deliveryRegionId)
    setDeliveryModalOpen(true)
  }

  const getRegionName = (r: { id: string; ar: string; en: string }) =>
    locale === 'ar' ? r.ar : r.en

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-teal-700 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{t('deliveryTo')}: {deliveryRegionName}</span>
            <button onClick={openDeliveryModal} className="underline hover:no-underline">
              {t('change')}
            </button>
          </div>
          <div className="hidden md:flex gap-4 items-center">
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-sm font-medium"
            >
              {locale === 'ar' ? 'EN' : 'ع'}
            </button>
            <Link to="/" className="hover:underline">{t('offers')}</Link>
            <span>{t('freeDelivery')} 100 {t('sar')}</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-teal-700">{t('brand')}</span>
          </Link>

          {/* Search - desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <SearchBar className="w-full" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="md:hidden px-2 py-1 rounded bg-gray-100 text-sm font-medium"
            >
              {locale === 'ar' ? 'EN' : 'ع'}
            </button>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 text-teal-700 hover:text-teal-600"
                >
                  <User className="w-6 h-6" />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className={`absolute top-full mt-1 py-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 ${locale === 'ar' ? 'left-0' : 'right-0'}`}>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-teal-600 hover:bg-teal-50 font-medium"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {t('adminPanel')}
                        </Link>
                      )}
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t('myAccount')}
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setUserMenuOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-teal-700 hover:text-teal-600 font-medium text-sm"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            <Link
              to="/favorites"
              className="relative flex items-center gap-1 text-teal-700 hover:text-teal-600"
              title={t('favorites')}
            >
              <Heart className="w-6 h-6" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -left-1 bg-teal-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="relative flex items-center gap-1 text-teal-700 hover:text-teal-600"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-teal-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
              <span className="hidden sm:inline">{t('cart')}</span>
            </Link>

            <button
              className="md:hidden p-2"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden mt-4">
            <SearchBar onClose={() => setSearchOpen(false)} variant="mobile" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <ul className="hidden md:flex overflow-x-auto py-3 gap-6 px-4">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="text-gray-600 hover:text-teal-600 whitespace-nowrap"
                >
                  {locale === 'ar' ? cat.nameAr : cat.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t py-4 px-4 space-y-2">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block py-2 text-teal-600 font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('adminPanel')}
                    </Link>
                  )}
                  <Link
                    to="/account"
                    className="block py-2 text-gray-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('myAccount')}
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                    }}
                    className="block py-2 text-red-600 w-full text-right"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 text-gray-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 text-teal-600 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('register')}
                  </Link>
                </>
              )}
              <Link
                to="/favorites"
                className="block py-2 text-gray-600"
                onClick={() => setMenuOpen(false)}
              >
                {t('favorites')}
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="block py-2 text-gray-600"
                  onClick={() => setMenuOpen(false)}
                >
                  {locale === 'ar' ? cat.nameAr : cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Delivery location modal */}
      {deliveryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">{t('changeDeliveryArea')}</h3>
              <button onClick={() => setDeliveryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">{t('selectRegion')}</p>
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {getRegionName(r)}
                </option>
              ))}
            </select>
            <button
              onClick={handleDeliveryChange}
              className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700"
            >
              {t('save')}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
