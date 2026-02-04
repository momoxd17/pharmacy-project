import { useState, useEffect } from 'react'
import { MessageCircle, Stethoscope, Mail, Phone, User, Calendar, CheckCircle, Trash2, MessageSquare } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { apiGet, apiDelete } from '../../utils/api'

export default function AdminInbox() {
  const { t, locale } = useLanguage()
  const [medicalRequests, setMedicalRequests] = useState([])
  const [chatbotQuestions, setChatbotQuestions] = useState([])
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('medical')
  const [deletingId, setDeletingId] = useState(null)

  const handleDeleteMedical = async (id) => {
    if (!confirm(t('confirmDeleteRequest'))) return
    setDeletingId(id)
    try {
      await apiDelete(`/medical-advice/${id}`)
      setMedicalRequests((prev) => prev.filter((r) => r.id !== id))
    } catch {
      alert(t('deleteFailed'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteChatbot = async (id) => {
    if (!confirm(t('confirmDeleteQuestion'))) return
    setDeletingId(id)
    try {
      await apiDelete(`/chatbot-questions/${id}`)
      setChatbotQuestions((prev) => prev.filter((q) => q.id !== id))
    } catch {
      alert(t('deleteFailed'))
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      try {
        const [medical, questions, feedback] = await Promise.all([
          apiGet('/medical-advice'),
          apiGet('/chatbot-questions'),
          apiGet('/feedback'),
        ])
        if (mounted) {
          setMedicalRequests(Array.isArray(medical) ? medical : [])
          setChatbotQuestions(Array.isArray(questions) ? questions : [])
          setFeedbackList(Array.isArray(feedback) ? feedback : [])
        }
      } catch {
        if (mounted) {
          setMedicalRequests([])
          setChatbotQuestions([])
          setFeedbackList([])
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
        <div className="animate-spin w-10 h-10 border-2 border-[#1B98E0] border-t-transparent rounded-full" />
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
              ? 'bg-[#1B98E0] text-white'
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
              ? 'bg-[#1B98E0] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          {t('chatbotQuestions')} ({chatbotQuestions.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'bg-[#1B98E0] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          {t('feedback')} ({feedbackList.length})
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
                    className="flex items-center gap-2 text-[#004180] hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {r.email}
                  </a>
                  <a
                    href={`tel:${r.phone}`}
                    className="flex items-center gap-2 text-[#004180] hover:underline"
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
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="font-medium text-gray-700 mb-1">{t('yourQuestion')}:</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{r.question}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${r.email}?subject=رد على استشارتك الطبية`}
                    className="px-4 py-2 bg-[#1B98E0] text-white text-sm rounded-lg hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {t('reply')}
                  </a>
                  <button
                    onClick={() => handleDeleteMedical(r.id)}
                    disabled={deletingId === r.id}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center gap-2 disabled:opacity-50"
                    title={t('markAsDone')}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('markAsDone')}
                  </button>
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
                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={`mailto:zeedanpharama@gmail.com?subject=رد على سؤال: ${encodeURIComponent(q.question)}`}
                    className="px-3 py-1.5 bg-[#1B98E0] text-white text-sm rounded-lg hover:bg-gray-800"
                  >
                    {t('reply')}
                  </a>
                  <button
                    onClick={() => handleDeleteChatbot(q.id)}
                    disabled={deletingId === q.id}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title={t('markAsDone')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-3">
          {feedbackList.length === 0 ? (
            <p className="text-gray-500 py-8">{t('noFeedback')}</p>
          ) : (
            feedbackList.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <a
                    href={`mailto:${f.email}`}
                    className="flex items-center gap-2 text-[#004180] hover:underline font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    {f.email}
                  </a>
                  <p className="text-gray-800 mt-2 whitespace-pre-wrap">{f.message}</p>
                  <p className="text-gray-400 text-sm mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(f.created_at)}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={`mailto:${f.email}?subject=رد على رسالتك`}
                    className="px-3 py-1.5 bg-[#1B98E0] text-white text-sm rounded-lg hover:bg-gray-800"
                  >
                    {t('reply')}
                  </a>
                  <button
                    onClick={() => handleDeleteFeedback(f.id)}
                    disabled={deletingId === f.id}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title={t('markAsDone')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
