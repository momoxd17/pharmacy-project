import { useParams, Link } from 'react-router-dom'
import { Calendar, ArrowLeft, Share2 } from 'lucide-react'
import { blogPosts, blogSections } from '../data/blog'
import { useLanguage } from '../context/LanguageContext'

export default function BlogPost() {
  const { slug } = useParams()
  const { t, locale } = useLanguage()
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">{t('postNotFound')}</p>
        <Link to="/blog" className="text-[#004180] hover:text-[#1E9ED8] hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t('backToBlog')}
        </Link>
      </div>
    )
  }

  const section = blogSections.find((s) => s.slug === post.section)
  const title = locale === 'ar' ? post.title : post.titleEn
  const content = locale === 'ar' ? post.content : post.contentEn

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return locale === 'ar'
      ? d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
      : d.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        url: window.location.href,
        text: title,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-[#004180] hover:text-[#1E9ED8]  mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToBlog')}
      </Link>

      <header className="mb-8">
        <span className="inline-block px-3 py-1 bg-[#DFF2F3] text-[#004180] rounded-lg text-sm font-medium mb-4">
          {locale === 'ar' ? section?.nameAr : section?.name}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(post.date)}
          </span>
          <span>{post.author}</span>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 hover:text-[#004180] hover:text-[#1E9ED8] transition-colors"
            title={t('share')}
          >
            <Share2 className="w-4 h-4" />
            {t('share')}
          </button>
        </div>
      </header>

      <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-8">
        <img src={post.image} alt={title} className="w-full h-full object-cover" />
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <p className="whitespace-pre-line">{content}</p>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-[#004180] hover:text-[#1E9ED8]  font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToBlog')}
        </Link>
      </div>
    </article>
  )
}
