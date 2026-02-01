import { Navigate } from 'react-router-dom'
import { User, Mail, LogOut, Package, MapPin, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'

export default function Account() {
  const { user, isLoading, logout } = useAuth()
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse bg-gray-200 rounded-xl h-48" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-l from-teal-700 to-teal-600 text-white px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-teal-100 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-4">{t('myProfile')}</h2>

          <Link
            to="/cart"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">سلة المشتريات</p>
              <p className="text-sm text-gray-500">عرض الطلبات والمشتريات</p>
            </div>
          </Link>

          <Link
            to="/favorites"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{t('favorites')}</p>
              <p className="text-sm text-gray-500">{t('favoritesDesc')}</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{t('deliveryAddresses')}</p>
              <p className="text-sm text-gray-500">{t('comingSoon')}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full p-4 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
