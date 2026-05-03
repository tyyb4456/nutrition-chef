import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import { userService }  from '../services/userService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('nutrition-ai-token')
    if (!token) { setLoading(false); return }
    try {
      const profile = await userService.getMe()
      setUser(profile)
    } catch {
      localStorage.removeItem('nutrition-ai-token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  const login = async (name, password) => {
    const res = await authService.login(name, password)
    localStorage.setItem('nutrition-ai-token', res.access_token)
    const profile = await userService.getMe()
    setUser(profile)
    return profile
  }

  const register = async (name, email, password) => {
    const res = await authService.register(name, email, password)
    localStorage.setItem('nutrition-ai-token', res.access_token)
    const profile = await userService.getMe()
    setUser(profile)
    return profile
  }

  const logout = () => {
    localStorage.removeItem('nutrition-ai-token')
    setUser(null)
  }

  const refreshUser = async () => {
    const profile = await userService.getMe()
    setUser(profile)
    return profile
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
