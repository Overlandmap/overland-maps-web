/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { signInAnonymous, signInWithEmail, signOut, onAuthChange } from '../lib/firebase-client'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAnonymous: boolean
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setLoading(false)
      } else {
        // No user signed in, sign in anonymously
        try {
          const anonUser = await signInAnonymous()
          setUser(anonUser)
        } catch (error) {
          console.error('Failed to sign in anonymously:', error)
        } finally {
          setLoading(false)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      const user = await signInWithEmail(email, password)
      setUser(user)
    } catch (error) {
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      // After sign out, sign in anonymously
      const anonUser = await signInAnonymous()
      setUser(anonUser)
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAnonymous: user?.isAnonymous || false,
    signInWithEmailAndPassword: handleSignInWithEmail,
    logout: handleLogout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
