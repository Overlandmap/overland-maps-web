'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslatedLabel } from '../lib/i18n'
import { shouldShowGDPRCompliance } from '../lib/geo-utils'

interface DisclaimerPopupProps {
  isOpen: boolean
  onAccept: () => void
}

export default function DisclaimerPopup({ isOpen, onAccept }: DisclaimerPopupProps) {
  const { language } = useLanguage()
  const [showGDPR, setShowGDPR] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowGDPR(shouldShowGDPRCompliance())
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <svg 
                className="w-5 h-5 text-yellow-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getTranslatedLabel('disclaimer_title', language)}
            </h2>
          </div>
          
          {/* Travel Disclaimer Section */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              {getTranslatedLabel('disclaimer_message', language)}
            </p>
          </div>

          {/* GDPR Section (only for European users) */}
          {showGDPR && (
            <div className="mb-6 border-t pt-4">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <svg 
                    className="w-4 h-4 text-blue-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                    />
                  </svg>
                </div>
                <h3 className="text-md font-medium text-gray-900">
                  {getTranslatedLabel('gdpr_title', language)}
                </h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {getTranslatedLabel('gdpr_message', language)}
              </p>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={onAccept}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {getTranslatedLabel('disclaimer_accept', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}