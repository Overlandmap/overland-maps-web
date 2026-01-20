'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslatedLabel } from '../lib/i18n'

interface ColorSchemeHelpPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function ColorSchemeHelpPopup({ 
  isOpen, 
  onClose
}: ColorSchemeHelpPopupProps) {
  const { language } = useLanguage()
  const popupRef = useRef<HTMLDivElement>(null)

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close popup on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={popupRef}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {getTranslatedLabel('help_button_title', language)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Overlanding */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
              {getTranslatedLabel('help_overlanding_title', language)}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {getTranslatedLabel('help_overlanding_text', language)}
            </p>
          </div>

          {/* Carnet */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-4 h-4 bg-blue-600 rounded-full mr-2"></span>
              {getTranslatedLabel('help_carnet_title', language)}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {getTranslatedLabel('help_carnet_text', language)}
            </p>
          </div>

          {/* Climate */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-4 h-4 bg-orange-500 rounded-full mr-2"></span>
              {getTranslatedLabel('help_climate_title', language)}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {getTranslatedLabel('help_climate_text', language)}
            </p>
          </div>

          {/* Itineraries */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-4 h-4 bg-purple-600 rounded-full mr-2"></span>
              {getTranslatedLabel('help_itineraries_title', language)}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {getTranslatedLabel('help_itineraries_text', language)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {getTranslatedLabel('onboarding_tooltip_got_it', language)}
          </button>
        </div>
      </div>
    </div>
  )
}
