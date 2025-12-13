'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { 
  ColorScheme, 
  ColorDefinition, 
  SchemeDefinition, 
  COLOR_SCHEMES,
  generateColorExpression as generateColorExpressionUtil,
  getColorForValue as getColorForValueUtil,
  getAvailableColorSchemes,
  isValidColorScheme
} from '../lib/color-expressions'

// Context type interface
interface ColorSchemeContextType {
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
  isLoading: boolean
}

// Re-export types and constants for convenience
export type { ColorScheme, ColorDefinition, SchemeDefinition }
export { COLOR_SCHEMES }

// Default color scheme
const DEFAULT_COLOR_SCHEME: ColorScheme = 'overlanding'

// localStorage keys for persistence
const COLOR_SCHEME_STORAGE_KEY = 'worldmap-color-scheme'
const COLOR_SCHEME_VERSION_KEY = 'worldmap-color-scheme-version'
const CURRENT_VERSION = '1.0' // Increment this to force a reset

// Create context
const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined)

// Provider props interface
interface ColorSchemeProviderProps {
  children: ReactNode
}

// Utility functions for localStorage persistence
const getStoredColorScheme = (): ColorScheme => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Check version to see if we need to reset
      const storedVersion = localStorage.getItem(COLOR_SCHEME_VERSION_KEY)
      if (storedVersion !== CURRENT_VERSION) {
        // Version mismatch or no version - reset to default
        localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY)
        localStorage.setItem(COLOR_SCHEME_VERSION_KEY, CURRENT_VERSION)
        return DEFAULT_COLOR_SCHEME
      }
      
      const stored = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)
      if (stored && isValidColorScheme(stored)) {
        return stored as ColorScheme
      }
    }
  } catch (error) {
    console.warn('Failed to read color scheme from localStorage:', error)
  }
  return DEFAULT_COLOR_SCHEME
}

const setStoredColorScheme = (scheme: ColorScheme): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme)
      localStorage.setItem(COLOR_SCHEME_VERSION_KEY, CURRENT_VERSION)
    }
  } catch (error) {
    console.warn('Failed to save color scheme to localStorage:', error)
  }
}

// Provider component
export function ColorSchemeProvider({ children }: ColorSchemeProviderProps) {
  // Simple initialization to overlanding - no useEffect interference
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('overlanding')
  const [isLoading] = useState(false) // Always false, no loading needed

  // Setter function - no localStorage persistence for now
  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme)
    setStoredColorScheme(newScheme)
  }

  const value: ColorSchemeContextType = {
    colorScheme,
    setColorScheme,
    isLoading
  }

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  )
}

// Custom hook with error handling for missing context provider
export function useColorScheme(): ColorSchemeContextType {
  const context = useContext(ColorSchemeContext)
  if (context === undefined) {
    throw new Error(
      'useColorScheme must be used within a ColorSchemeProvider. ' +
      'Make sure to wrap your component tree with <ColorSchemeProvider>.'
    )
  }
  return context
}

// Re-export utility functions from the color expressions module
export const generateColorExpression = generateColorExpressionUtil
export const getColorForValue = getColorForValueUtil
export { getAvailableColorSchemes, isValidColorScheme }