import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Mic, Camera, X } from 'lucide-react'
import { createWorker } from 'tesseract.js'
import { useLanguage } from '../context/LanguageContext'

export default function SearchBar({ className = '', onClose, variant = 'desktop' }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [voiceListening, setVoiceListening] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const recognitionRef = useRef(null)
  const { t } = useLanguage()

  const performSearch = (q) => {
    const trimmed = q.trim()
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/search')
    }
    onClose?.()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    performSearch(query)
  }

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    if (cameraOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          setCameraStream(stream)
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(() => setCameraOpen(false))
    }
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop())
      setCameraStream(null)
    }
  }, [cameraOpen])

  const startVoiceSearch = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      alert('المتصفح لا يدعم التعرف على الصوت. جرّب Chrome.')
      return
    }
    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'ar-EG'
    recognition.onstart = () => setVoiceListening(true)
    recognition.onend = () => setVoiceListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      performSearch(transcript)
    }
    recognition.onerror = () => setVoiceListening(false)
    recognition.start()
    recognitionRef.current = recognition
  }

  const captureAndSearch = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraStream) return
    setOcrLoading(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      try {
        const worker = await createWorker('ara')
        const { data } = await worker.recognize(canvas)
        await worker.terminate()
        const text = data.text.trim()
        setCameraOpen(false)
        if (text) {
          setQuery(text)
          performSearch(text)
        } else {
          performSearch(query || '')
        }
      } catch {
        setCameraOpen(false)
        performSearch(query || '')
      }
    }
    setOcrLoading(false)
  }

  const closeCamera = () => {
    setCameraOpen(false)
    cameraStream?.getTracks().forEach((tr) => tr.stop())
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pr-10 pl-24 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <div className="absolute left-1 flex gap-1">
          <button
            type="button"
            onClick={startVoiceSearch}
            disabled={voiceListening}
            className={`p-2 rounded-lg ${voiceListening ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
            title={t('voiceSearch')}
          >
            <Mic className={`w-5 h-5 ${voiceListening ? 'animate-pulse' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
            title={t('imageSearch')}
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </form>

      {cameraOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <button
            onClick={closeCamera}
            className="absolute top-4 right-4 text-white p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <p className="text-white mb-4">{t('takePhotoToSearch')}</p>
          <div className="relative w-full max-w-lg aspect-square bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <button
            onClick={captureAndSearch}
            disabled={ocrLoading}
            className="mt-6 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 disabled:opacity-50"
          >
            {ocrLoading ? t('analyzing') : t('searchByImage')}
          </button>
        </div>
      )}
    </>
  )
}
