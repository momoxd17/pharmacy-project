import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface StoredUser extends User {
  password: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const STORAGE_KEY = 'tadwa_auth'
const USERS_KEY = 'tadwa_users'
const ADMIN_EMAIL = 'moaazsamehzeedan@gmail.com'
const ADMIN_PASSWORD = 'momoxd17'

const AuthContext = createContext<AuthContextType | null>(null)

function loadUsers(): StoredUser[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const data = localStorage.getItem(USERS_KEY)
    const parsed = data ? JSON.parse(data) : []
    const users = Array.isArray(parsed) ? parsed : []
    return users.map((u: StoredUser) => ({ ...u, role: (u.role || 'user') as UserRole }))
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {}
}

function loadSession(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveSession(user: User | null) {
  try {
    if (typeof localStorage === 'undefined') return
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let users = loadUsers()
    const adminExists = users.some((u) => u.email.toLowerCase() === ADMIN_EMAIL)
    if (!adminExists) {
      const defaultAdmin: StoredUser = {
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
      const role = fullUser?.role ?? (saved.role || 'user') as UserRole
      const updated = { ...saved, role }
      setUser(updated)
      saveSession(updated)
    } else {
      setUser(null)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
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

  const register = async (name: string, email: string, password: string) => {
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

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      role: 'user',
    }
    users.push(newUser)
    saveUsers(users)

    const sessionUser: User = { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
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
