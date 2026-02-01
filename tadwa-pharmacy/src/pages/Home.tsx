import { Link } from 'react-router-dom'
import { Truck, MapPin, CreditCard, Percent } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useLanguage } from '../context/LanguageContext'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const { categories, products } = useProducts()
  const { t, locale } = useLanguage()
  const featuredProducts = products.slice(0, 8)

  const valueProps = [
    { icon: Truck, title: t('freeShipping'), desc: `${t('freeDelivery')} 100 ${t('sar')}` },
    { icon: MapPin, title: t('reachYou'), desc: t('reachYouDesc') },
    { icon: CreditCard, title: t('payOnDelivery'), desc: t('payOnDeliveryDesc') },
    { icon: Percent, title: t('exclusiveOffers'), desc: t('exclusiveOffersDesc') },
  ]

  const deals = [
    { label: `${t('saveUp')} 50%`, slug: 'offers', color: 'bg-red-500' },
    { label: t('womenCare'), slug: 'beauty-skin', color: 'bg-pink-500' },
    { label: t('menCare'), slug: 'personal-care', color: 'bg-blue-500' },
    { label: t('newArrivals'), slug: 'new', color: 'bg-green-500' },
  ]

  return (
    <div>
      <section className="bg-gradient-to-l from-teal-700 to-teal-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('brand')}</h1>
          <p className="text-xl md:text-2xl text-teal-100 mb-6">{t('heroSubtitle')}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {valueProps.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center"
            >
              <Icon className="w-10 h-10 text-teal-600 mb-2" />
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('shopByCategory')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center hover:shadow-md transition-shadow border border-gray-100"
            >
              <span className="text-4xl mb-2">{cat.icon}</span>
              <span className="font-medium text-gray-800 text-center">
                {locale === 'ar' ? cat.nameAr : cat.name}
              </span>
              <span className="text-sm text-teal-600 mt-1">{t('viewAll')}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 bg-gray-50/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('featuredProducts')}</h2>
          <Link to="/category/vitamins" className="text-teal-600 hover:underline">
            {t('viewAll')}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {deals.map(({ label, slug, color }) => (
            <Link
              key={slug}
              to={`/category/${slug}`}
              className={`${color} text-white rounded-xl p-6 text-center font-semibold hover:opacity-90 transition-opacity`}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
