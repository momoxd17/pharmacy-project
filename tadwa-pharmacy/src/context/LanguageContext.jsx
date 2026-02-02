import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

const STORAGE_KEY = 'tadwa_language'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      if (typeof localStorage === 'undefined') return 'ar'
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved === 'en' || saved === 'ar' ? saved : 'ar'
    } catch {
      return 'ar'
    }
  })

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, locale)
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = locale === 'ar' ? 'ar' : 'en'
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
        if (document.body) document.body.dir = locale === 'ar' ? 'rtl' : 'ltr'
      }
    } catch {}
  }, [locale])

  const setLocale = (l) => setLocaleState(l)

  const t = (key) => translations[locale][key] ?? key

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRtl: locale === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
