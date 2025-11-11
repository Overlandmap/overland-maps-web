'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  SupportedLanguage, 
  DEFAULT_LANGUAGE, 
  getLanguagePreference, 
  setLanguagePreference 
} from '../lib/i18n'

interface LanguageContextType {
  language: SupportedLanguage
  setLanguage: (language: SupportedLanguage) => void
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize language from localStorage/browser preference
  useEffect(() => {
    const preferredLanguage = getLanguagePreference()
    setLanguageState(preferredLanguage)
    setIsLoading(false)
  }, [])

  const setLanguage = (newLanguage: SupportedLanguage) => {
    console.log('Language changed to:', newLanguage)
    setLanguageState(newLanguage)
    setLanguagePreference(newLanguage)
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    isLoading
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}