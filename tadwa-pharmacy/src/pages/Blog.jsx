import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Calendar, ArrowLeft } from 'lucide-react'
import { blogPosts, blogSections } from '../data/blog'
import { useLanguage } from '../context/LanguageContext'

export default function Blog() {
  const [searchParams] = useSearchParams()
  const sectionParam = searchParams.get('section') || ''
  const [activeSection, setActiveSection] = useState(sectionParam)
  const { t, locale } = useLanguage()

  const filteredPosts = activeSection
    ? blogPosts.filter((p) => p.section === activeSection)
    : blogPosts

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return locale === 'ar'
      ? d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
      : d.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('blog')}</h1>
        <p className="text-gray-600">{t('blogDesc')}</p>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveSection('')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            !activeSection
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('allArticles')}
        </button>
        {blogSections.map((sec) => (
          <button
            key={sec.slug}
            onClick={() => setActiveSection(sec.slug)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              activeSection === sec.slug
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{sec.icon}</span>
            {locale === 'ar' ? sec.nameAr : sec.name}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">{t('noBlogPosts')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const section = blogSections.find((s) => s.slug === post.section)
            const title = locale === 'ar' ? post.title : post.titleEn
            const excerpt = locale === 'ar' ? post.excerpt : post.excerptEn
            return (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div className="aspect-video bg-gray-100 overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 bg-teal-600/90 text-white text-xs px-2 py-1 rounded-lg">
                    {locale === 'ar' ? section?.nameAr : section?.name}
                  </span>
                </div>
                <div className="p-4">
                  <span className="text-xs text-teal-600 font-medium">
                    {locale === 'ar' ? section?.nameAr : section?.name}
                  </span>
                  <h2 className="font-bold text-gray-800 mt-1 line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{excerpt}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.date)}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
