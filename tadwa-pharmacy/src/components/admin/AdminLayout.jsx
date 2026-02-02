import { NavLink, Link, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, FolderTree, Inbox, ArrowRight } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function AdminLayout() {
  const { t } = useLanguage()
  const navItems = [
    { to: '/admin', icon: LayoutDashboard, labelKey: 'dashboard', end: true },
    { to: '/admin/products', icon: Package, labelKey: 'products', end: false },
    { to: '/admin/categories', icon: FolderTree, labelKey: 'categories', end: false },
    { to: '/admin/inbox', icon: Inbox, labelKey: 'inbox', end: false },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed inset-y-0 right-0">
        <div className="p-6 border-b border-gray-700">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-teal-400">طب ودواء</span>
          </Link>
          <p className="text-gray-400 text-sm mt-1">{t('adminPanel')}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            {t('backToStore')}
          </Link>
        </div>
      </aside>

      <main className="flex-1 mr-64 p-8">
        <Outlet />
      </main>
    </div>
  )
}
