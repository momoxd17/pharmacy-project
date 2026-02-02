import { createContext, useContext, useState, useEffect } from 'react'
import { apiPost } from '../utils/api'

const STORAGE_KEY = 'tadwa_auth'
const USERS_KEY = 'tadwa_users'
const ADMIN_EMAIL = 'moaazsamehzeedan@gmail.com'
const ADMIN_PASSWORD = 'momoxd17'

const AuthContext = createContext(null)

function loadUsers() {
  try {
    if (typeof localStorage === 'undefined') return []
    const data = localStorage.getItem(USERS_KEY)
    const parsed = data ? JSON.parse(data) : []
    const users = Array.isArray(parsed) ? parsed : []
    return users.map((u) => ({ ...u, role: u.role || 'user' }))
  } catch {
    return []
  }
}

function saveUsers(users) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {}
}

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
    let users = loadUsers()
    const adminExists = users.some((u) => u.email.toLowerCase() === ADMIN_EMAIL)
    if (!adminExists) {
      const defaultAdmin = {
        id: crypto.randomUUID(),
        name: 'مدير النظام',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
      }
      users = [defaultAdmin, ...users]
      saveUsers(users)
    }
    const saved = loadSession()
    if (saved) {
      const fullUser = users.find((u) => u.id === saved.id)
      const role = fullUser?.role ?? saved.role ?? 'user'
      const updated = { ...saved, role }
      setUser(updated)
      saveSession(updated)
    } else {
      setUser(null)
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    const users = loadUsers()
    const normalizedEmail = email.trim().toLowerCase()
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail)

    if (!found || found.password !== password) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
    }

    const { id, email: userEmail, name, role } = found
    const sessionUser = { id, email: userEmail, name, role: role || 'user' }
    setUser(sessionUser)
    saveSession(sessionUser)
    return { success: true }
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

    const users = loadUsers()
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً' }
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      role: 'user',
    }
    users.push(newUser)
    saveUsers(users)

    try {
      await apiPost('/users', {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      })
    } catch {
      // DB offline - user still saved in localStorage
    }

    const sessionUser = { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
    setUser(sessionUser)
    saveSession(sessionUser)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    saveSession(null)
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
