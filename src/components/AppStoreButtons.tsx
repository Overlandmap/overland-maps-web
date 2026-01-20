import { getTranslatedLabel } from '../lib/i18n'
import { SupportedLanguage } from '../lib/i18n'

interface AppStoreButtonsProps {
  language: SupportedLanguage
  size?: 'small' | 'large'
  layout?: 'compact' | 'full-width'
}

/**
 * Reusable App Store and Play Store buttons component
 * Used in both the legend and detail sidebar for consistency
 */
export default function AppStoreButtons({ language, size = 'small', layout = 'compact' }: AppStoreButtonsProps) {
  const isSmall = size === 'small'
  const isFullWidth = layout === 'full-width'
  
  const buttonClasses = isSmall
    ? 'flex items-center space-x-1 px-2 py-1 rounded text-xs'
    : 'flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm'
  
  const iconSize = isSmall ? 'w-3 h-3' : 'w-5 h-5'
  const textSize = isSmall ? 'text-xs' : 'text-sm'
  const containerSpacing = isSmall ? 'flex space-x-2' : 'flex space-x-3'
  const flexClass = isFullWidth ? 'flex-1' : ''

  return (
    <div className={containerSpacing}>
      {/* App Store Button */}
      <a
        href="https://apps.apple.com/us/app/overland-map/id6741202903"
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonClasses} ${flexClass} bg-black text-white hover:bg-gray-800 transition-colors`}
      >
        <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        <span className={`${textSize} font-medium`}>{getTranslatedLabel('app_store', language)}</span>
      </a>

      {/* Play Store Button */}
      <a
        href="https://play.google.com/store/apps/details?id=ch.overlandmap.map"
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonClasses} ${flexClass} bg-blue-600 text-white hover:bg-blue-700 transition-colors`}
      >
        <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
        </svg>
        <span className={`${textSize} font-medium`}>{getTranslatedLabel('play_store', language)}</span>
      </a>
    </div>
  )
}
