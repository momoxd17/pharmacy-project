import { Package, FolderTree, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext'
import { useLanguage } from '../../context/LanguageContext'

export default function AdminDashboard() {
  const { products, categories } = useProducts()
  const { t } = useLanguage()

  const stats = [
    { label: t('totalProducts'), value: products.length, icon: Package, color: 'bg-teal-500', to: '/admin/products' },
    { label: t('categoryCount'), value: categories.length, icon: FolderTree, color: 'bg-blue-500', to: '/admin/categories' },
    { label: t('availableProducts'), value: products.filter((p) => p.inStock).length, icon: TrendingUp, color: 'bg-green-500', to: '/admin/products' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">{t('dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map(({ label, value, icon: Icon, color, to }) => (
          <Link
            key={label}
            to={to}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">{t('lastProducts')}</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">{t('noProducts')}</p>
        ) : (
          <ul className="space-y-3">
            {products.slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-gray-800">{p.nameAr}</span>
                <span className="text-teal-600 font-medium">{p.price} {t('sar')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
