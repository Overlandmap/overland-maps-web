'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslatedLabel } from '../lib/i18n'

interface ColorSchemeOnboardingTooltipProps {
  isOpen: boolean
  onClose: () => void
}

export default function ColorSchemeOnboardingTooltip({ isOpen, onClose }: ColorSchemeOnboardingTooltipProps) {
  const { language } = useLanguage()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Only show on mobile devices
  if (!isOpen || !isMobile) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 z-30 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Tooltip */}
      <div className="fixed top-20 left-4 right-4 z-40 animate-slide-down">
        <div className="bg-white rounded-lg shadow-2xl p-4 relative">
          {/* Arrow pointing up to the color scheme selector */}
          <div className="absolute -top-3 left-6 w-6 h-6 bg-white transform rotate-45 shadow-lg"></div>
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-start mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <svg 
                  className="w-6 h-6 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {getTranslatedLabel('onboarding_tooltip_title', language)}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getTranslatedLabel('onboarding_tooltip_message', language)}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
            >
              {getTranslatedLabel('onboarding_tooltip_got_it', language)}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
