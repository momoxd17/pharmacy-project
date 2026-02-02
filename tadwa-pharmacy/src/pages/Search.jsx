import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useLanguage } from '../context/LanguageContext'
import ProductCard from '../components/ProductCard'

export default function Search() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const { products } = useProducts()
  const { t } = useLanguage()

  const query = q.trim().toLowerCase()
  const results = query
    ? products.filter(
        (p) =>
          p.nameAr.toLowerCase().includes(query) ||
          p.name.toLowerCase().includes(query) ||
          p.categoryAr.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.ingredients?.toLowerCase().includes(query)
      )
    : products

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {query ? `${t('searchResults')} "${q}"` : t('allProducts')}
      </h1>
      {results.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">{t('noResults')}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
