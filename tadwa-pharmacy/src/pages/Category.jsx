import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useLanguage } from '../context/LanguageContext'
import ProductCard from '../components/ProductCard'

export default function Category() {
  const { slug } = useParams()
  const { categories, products } = useProducts()
  const { t, locale } = useLanguage()
  const category = categories.find((c) => c.slug === slug)
  const categoryProducts = slug
    ? products.filter((p) => p.category === slug)
    : products

  if (!category && slug) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">{t('categoryNotFound')}</p>
        <Link to="/" className="text-[#004180] hover:text-[#1E9ED8] mt-2 inline-block">{t('backToHome')}</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {category ? (locale === 'ar' ? category.nameAr : category.name) : t('allProducts')}
        </h1>
        <p className="text-gray-500 mt-1">
          {categoryProducts.length} {t('productsInCategory')}
        </p>
      </div>

      {categoryProducts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">{t('noProductsInCategory')}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
