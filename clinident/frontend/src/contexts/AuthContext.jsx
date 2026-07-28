import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('clinident_token')
    const savedUser = localStorage.getItem('clinident_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('clinident_token')
        localStorage.removeItem('clinident_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { user: userData, token } = res.data.data
    localStorage.setItem('clinident_token', token)
    localStorage.setItem('clinident_user', JSON.stringify(userData))
    setUser(userData)
    toast.success(`Welcome back, ${userData.name}!`)
    return userData
  }

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData)
    const { user: userData, token } = res.data.data
    localStorage.setItem('clinident_token', token)
    localStorage.setItem('clinident_user', JSON.stringify(userData))
    setUser(userData)
    toast.success(`Account created! Welcome, ${userData.name}!`)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('clinident_token')
    localStorage.removeItem('clinident_user')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const forgotPassword = async (email) => {
    await api.post('/auth/forgot-password', { email })
    toast.success('Password reset link sent to your email')
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('clinident_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
