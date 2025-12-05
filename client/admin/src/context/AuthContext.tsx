import { createContext, useContext, useEffect, useState } from 'react'
import { authApi, AuthResponse } from '../api'

type User = AuthResponse['user'] | null

interface AuthContextValue {
  user: User
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const cached = localStorage.getItem('pc_admin_user')
    return cached ? (JSON.parse(cached) as User) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pc_admin_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((data) => {
        setUser(data)
        localStorage.setItem('pc_admin_user', JSON.stringify(data))
      })
      .catch(() => {
        // keep token and cached user; let user re-auth if needed
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    setUser(res.user)
    localStorage.setItem('pc_admin_user', JSON.stringify(res.user))
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    localStorage.removeItem('pc_admin_user')
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
