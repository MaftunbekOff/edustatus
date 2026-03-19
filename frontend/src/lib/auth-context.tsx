"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, ApiError } from './api'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  organizationId?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for stored user session on mount
      const storedUser = sessionStorage.getItem('user')
      if (!storedUser) {
        setIsLoading(false)
        return
      }

      try {
        const userFromServer = await authApi.getMe()
        sessionStorage.setItem('user', JSON.stringify(userFromServer))
        setUser(userFromServer)
        setToken('authenticated')
      } catch {
        // Stored data is stale or tampered, clear local session
        sessionStorage.removeItem('user')
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await authApi.login(email, password)
      const { user: userData } = response

      // Store user info in session storage (not sensitive)
      sessionStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      // Tokens are now stored in httpOnly cookies by the backend
      setToken('authenticated') // Just indicate we're authenticated
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.message || err.message)
      } else {
        setError('Login failed. Please try again.')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (_logoutError) {
      // Ignore logout errors
    }

    // Clear client-side session
    sessionStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}