import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { faqs } from '../data/faq'
import { useLanguage } from '../context/LanguageContext'

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState(null)
  const { t, locale } = useLanguage()

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  return (
    <section className="bg-white border-t border-gray-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('faq')}</h2>
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openFaq === faq.id
            const question = locale === 'ar' ? faq.question : faq.questionEn
            const answer = locale === 'ar' ? faq.answer : faq.answerEn
            return (
              <div
                key={faq.id}
                className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-right hover:bg-gray-100/50 transition-colors"
                >
                  <span className="font-medium text-gray-800 flex-1">{question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#1B98E0] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-gray-600 border-t border-gray-100 pt-4">
                    {answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
