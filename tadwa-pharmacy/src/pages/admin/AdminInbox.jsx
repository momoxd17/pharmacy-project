import { useState, useEffect } from 'react'
import { MessageCircle, Stethoscope, Mail, Phone, User, Calendar } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { apiGet } from '../../utils/api'

export default function AdminInbox() {
  const { t, locale } = useLanguage()
  const [medicalRequests, setMedicalRequests] = useState([])
  const [chatbotQuestions, setChatbotQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('medical')

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      try {
        const [medical, questions] = await Promise.all([
          apiGet('/medical-advice'),
          apiGet('/chatbot-questions'),
        ])
        if (mounted) {
          setMedicalRequests(Array.isArray(medical) ? medical : [])
          setChatbotQuestions(Array.isArray(questions) ? questions : [])
        }
      } catch {
        if (mounted) {
          setMedicalRequests([])
          setChatbotQuestions([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const formatDate = (str) => {
    if (!str) return '-'
    try {
      const d = new Date(str)
      const dateStr = d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en')
      const timeStr = d.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en', { hour: '2-digit', minute: '2-digit' })
      return `${dateStr} ${timeStr}`
    } catch {
      return str
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('inbox')}</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('medical')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'medical'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Stethoscope className="w-5 h-5" />
          {t('medicalAdvice')} ({medicalRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('chatbot')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'chatbot'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          {t('chatbotQuestions')} ({chatbotQuestions.length})
        </button>
      </div>

      {activeTab === 'medical' && (
        <div className="space-y-4">
          {medicalRequests.length === 0 ? (
            <p className="text-gray-500 py-8">{t('noMedicalRequests')}</p>
          ) : (
            medicalRequests.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex flex-wrap gap-4 mb-4">
                  <span className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    {r.name}
                  </span>
                  <a
                    href={`mailto:${r.email}`}
                    className="flex items-center gap-2 text-teal-600 hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {r.email}
                  </a>
                  <a
                    href={`tel:${r.phone}`}
                    className="flex items-center gap-2 text-teal-600 hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {r.phone}
                  </a>
                  <span className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(r.created_at)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1 mb-2">
                  <p><strong>{t('age')}:</strong> {r.age} | <strong>{t('gender')}:</strong> {r.gender === 'male' ? t('male') : t('female')}</p>
                  {r.condition && <p><strong>{t('currentCondition')}:</strong> {r.condition}</p>}
                  {r.medications && <p><strong>{t('currentMedications')}:</strong> {r.medications}</p>}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-700 mb-1">{t('yourQuestion')}:</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{r.question}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'chatbot' && (
        <div className="space-y-3">
          {chatbotQuestions.length === 0 ? (
            <p className="text-gray-500 py-8">{t('noChatbotQuestions')}</p>
          ) : (
            chatbotQuestions.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <p className="text-gray-800">{q.question}</p>
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(q.created_at)}
                  </p>
                </div>
                <a
                  href={`mailto:zeedanpharam@gmail.com?subject=رد على سؤال: ${encodeURIComponent(q.question)}`}
                  className="flex-shrink-0 px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
                >
                  {t('reply')}
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
