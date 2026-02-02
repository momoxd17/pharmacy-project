import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { faqs, faqCategories } from '../data/faq'
import { useLanguage } from '../context/LanguageContext'

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const { t, locale } = useLanguage()

  const filteredFaqs = activeCategory
    ? faqs.filter((f) => f.category === activeCategory)
    : faqs

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('faq')}</h1>
        <p className="text-gray-600">{t('faqDesc')}</p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => setActiveCategory('')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            !activeCategory
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('allQuestions')}
        </button>
        {faqCategories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              activeCategory === cat.slug
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            {locale === 'ar' ? cat.nameAr : cat.name}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openFaq === faq.id
          const question = locale === 'ar' ? faq.question : faq.questionEn
          const answer = locale === 'ar' ? faq.answer : faq.answerEn
          return (
            <div
              key={faq.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-right hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-800 flex-1">{question}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-4">
                  {answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
