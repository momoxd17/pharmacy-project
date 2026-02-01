import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
  const { categories } = useProducts()
  const { t, locale } = useLanguage()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">{t('brand')}</h3>
            <p className="text-sm mb-4">{t('footerDesc')}</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('shopByCategory')}</h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/category/${cat.slug}`} className="hover:text-teal-400">
                    {locale === 'ar' ? cat.nameAr : cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/category/vitamins" className="hover:text-teal-400">
                  {t('viewAll')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('whyUs')}</h4>
            <ul className="space-y-2 text-sm">
              <li>✓ {t('freeDelivery')} 100 {t('sar')}</li>
              <li>✓ {t('fastDelivery')}</li>
              <li>✓ {t('codAvailable')}</li>
              <li>✓ {t('exclusiveOffers')} {t('exclusiveOffersDesc')}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('contactUs')}</h4>
            <p className="text-sm">{t('contactPhone')}: 0123456789</p>
            <p className="text-sm">{t('contactEmail')}: info@tadwa-pharmacy.com</p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>© 2025 {t('brand')}. {t('rights')}</p>
        </div>
      </div>
    </footer>
  )
}
