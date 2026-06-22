import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Operator, LoginRequest } from '../types/api'
import * as authApi from '../api/auth'

interface AuthContextType {
  operator: Operator | null
  token: string | null
  loading: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [operator, setOperator] = useState<Operator | null>(() => {
    const stored = localStorage.getItem('operator')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((op) => {
          setOperator(op)
          localStorage.setItem('operator', JSON.stringify(op))
        })
        .catch(() => {
          setOperator(null)
          setToken(null)
          localStorage.removeItem('token')
          localStorage.removeItem('operator')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data)
    localStorage.setItem('token', response.token)
    localStorage.setItem('operator', JSON.stringify(response.operator))
    setToken(response.token)
    setOperator(response.operator)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('operator')
    setToken(null)
    setOperator(null)
  }, [])

  return (
    <AuthContext.Provider value={{ operator, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
