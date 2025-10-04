'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from './types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<boolean>
  sendMagicLink: (email: string) => Promise<boolean>
  isAuthenticated: boolean
  userIdentity: string | null
  setUserIdentity: (identity: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userIdentity, setUserIdentity] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user) // Extract the user object from the response
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    // Load user identity from onboarding
    const identity = localStorage.getItem('unsent_user_identity')
    if (identity) {
      setUserIdentity(identity)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include'
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return true
      }
      return false
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  const sendMagicLink = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      })

      return response.ok
    } catch (error) {
      console.error('Magic link failed:', error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      
      // Clear local storage
      localStorage.removeItem('unsent_user_identity')
      localStorage.removeItem('unsent_first_recipient')
      localStorage.removeItem('unsent_onboarding_complete')
      
      setUserIdentity(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const updateUserIdentity = (identity: string) => {
    setUserIdentity(identity)
    localStorage.setItem('unsent_user_identity', identity)
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    sendMagicLink,
    isAuthenticated: !!user,
    userIdentity,
    setUserIdentity: updateUserIdentity
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 