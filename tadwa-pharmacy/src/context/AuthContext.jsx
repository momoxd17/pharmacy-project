import { createContext, useContext, useState, useEffect } from 'react'
import { apiPost, setAuthToken, getAuthToken } from '../utils/api'

const STORAGE_KEY = 'tadwa_auth'

const AuthContext = createContext(null)

function loadSession() {
  try {
    if (typeof localStorage === 'undefined') return null
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveSession(user) {
  try {
    if (typeof localStorage === 'undefined') return
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = loadSession()
    const token = getAuthToken()
    if (saved && token) {
      setUser(saved)
    } else {
      setUser(null)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      saveSession(null)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await apiPost('/auth/login', { email, password })
      if (res.token && res.user) {
        setAuthToken(res.token)
        saveSession(res.user)
        setUser(res.user)
        return { success: true }
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg === 'NETWORK_ERROR' || err.status === 404 || err.status >= 500) {
        return { success: false, error: 'الخادم غير متاح. تأكد من تشغيل السيرفر (npm run server)' }
      }
      if (err.status === 401 || msg.includes('صحيحة')) {
        return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
      }
      return { success: false, error: msg || 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
    }
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
  }

  const register = async (name, email, password) => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'يرجى ملء جميع الحقول' }
    }
    if (trimmedPassword.length < 6) {
      return { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
    }

    try {
      await apiPost('/users', {
        id: crypto.randomUUID(),
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        role: 'user',
      })
    } catch (err) {
      const msg = err.message || ''
      if (err.status === 409 || msg.toLowerCase().includes('already') || msg.toLowerCase().includes('مسجل')) {
        return { success: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً' }
      }
      if (msg === 'NETWORK_ERROR' || err.status === 404 || err.status >= 500) {
        return { success: false, error: 'الخادم غير متاح. تأكد من تشغيل السيرفر (npm run server)' }
      }
      return { success: false, error: msg || 'فشل التسجيل' }
    }

    const loginRes = await login(trimmedEmail, trimmedPassword)
    return loginRes
  }

  const logout = () => {
    setUser(null)
    saveSession(null)
    setAuthToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
