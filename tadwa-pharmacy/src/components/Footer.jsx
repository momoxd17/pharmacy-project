import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
  const { categories } = useProducts()
  const { t, locale } = useLanguage()

  return (
    <footer className="bg-[#004180] text-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">{t('brand')}</h3>
            <p className="text-sm mb-4">{t('footerDesc')}</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('shopByCategory')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="text-white hover:opacity-90">
                  {t('blog')}
                </Link>
              </li>
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/category/${cat.slug}`} className="text-white hover:opacity-90">
                    {locale === 'ar' ? cat.nameAr : cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/category/vitamins" className="text-white hover:opacity-90">
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
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/medical-advice" className="text-white hover:opacity-90">
                  {t('medicalAdvice')}
                </Link>
              </li>
              <li>{t('contactPhone')}: 0569177838</li>
              <li>{t('contactEmail')}: zeedanpharama@gmail.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1B98E0]/30 mt-8 pt-8 text-center text-sm">
          <p>© 2025 {t('brand')}. {t('rights')}</p>
        </div>
      </div>
    </footer>
  )
}
