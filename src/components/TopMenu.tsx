/**
 * Top Menu Component
 * Combines language selector and user authentication menu in a single floating window
 */
'use client'

import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { SUPPORTED_LANGUAGES, getLanguageInfo } from '../lib/i18n'
import LoginPanel from './LoginPanel'

interface TopMenuProps {
  className?: string
}

export default function TopMenu({ className = '' }: TopMenuProps) {
  const { language, setLanguage } = useLanguage()
  const { user, isAnonymous, logout } = useAuth()
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [isUserOpen, setIsUserOpen] = useState(false)
  const [showLoginPanel, setShowLoginPanel] = useState(false)
  
  const currentLanguage = getLanguageInfo(language)

  const handleLogout = async () => {
    try {
      await logout()
      setIsUserOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSignIn = () => {
    setShowLoginPanel(true)
    setIsUserOpen(false)
  }

  return (
    <>
      <div className={`flex items-center bg-white border border-gray-300 rounded-lg shadow-sm ${className}`}>
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setIsLanguageOpen(!isLanguageOpen)
              setIsUserOpen(false)
            }}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors rounded-l-lg"
            aria-label="Select language"
          >
            <span className="text-lg">{currentLanguage?.flag}</span>
            <span className="text-sm font-medium text-gray-700">
              {currentLanguage?.code.toUpperCase()}
            </span>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isLanguageOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsLanguageOpen(false)}
              />
              
              {/* Language Dropdown */}
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                <div className="py-1">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code)
                        setIsLanguageOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 transition-colors ${
                        language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <div className="flex-1">
                        <div className="font-medium">{lang.nativeName}</div>
                        <div className="text-xs text-gray-500">{lang.name}</div>
                      </div>
                      {language === lang.code && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setIsUserOpen(!isUserOpen)
              setIsLanguageOpen(false)
            }}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors rounded-r-lg"
            aria-label="User menu"
          >
            {/* Person outline icon */}
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isUserOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isUserOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsUserOpen(false)}
              />
              
              {/* User Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="py-1">
                  {isAnonymous ? (
                    // Anonymous user - show sign in option
                    <button
                      onClick={handleSignIn}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign In</span>
                    </button>
                  ) : (
                    // Authenticated user - show user info and logout
                    <>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Login Panel Modal */}
      {showLoginPanel && (
        <LoginPanel onClose={() => setShowLoginPanel(false)} />
      )}
    </>
  )
}
