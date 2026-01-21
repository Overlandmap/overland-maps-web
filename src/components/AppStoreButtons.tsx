import Image from 'next/image'

interface AppStoreButtonsProps {
  language?: string
  size?: 'small' | 'large'
  layout?: 'compact' | 'full-width'
}

/**
 * Reusable App Store and Play Store buttons component
 * Used in both the legend and detail sidebar for consistency
 */
export default function AppStoreButtons({ size = 'small', layout = 'compact' }: AppStoreButtonsProps) {
  const isSmall = size === 'small'
  const isFullWidth = layout === 'full-width'
  
  const heightClass = isSmall ? 'h-8' : 'h-12'
  const containerSpacing = isSmall ? 'flex space-x-2' : 'flex space-x-3'
  const flexClass = isFullWidth ? 'flex-1' : ''

  return (
    <div className={containerSpacing}>
      {/* App Store Button */}
      <a
        href="https://apps.apple.com/us/app/overland-map/id6741202903"
        target="_blank"
        rel="noopener noreferrer"
        className={`${flexClass} hover:opacity-80 transition-opacity`}
      >
        <Image
          src="/assets/appstore.png"
          alt="Download on the App Store"
          width={0}
          height={0}
          sizes="100vw"
          className={`${heightClass} w-auto`}
        />
      </a>

      {/* Play Store Button */}
      <a
        href="https://play.google.com/store/apps/details?id=ch.overlandmap.map"
        target="_blank"
        rel="noopener noreferrer"
        className={`${flexClass} hover:opacity-80 transition-opacity`}
      >
        <Image
          src="/assets/playstore.png"
          alt="Get it on Google Play"
          width={0}
          height={0}
          sizes="100vw"
          className={`${heightClass} w-auto`}
        />
      </a>
    </div>
  )
}
