'use client'

import { useState } from 'react'
import { getFlagPath, hasFlagAvailable } from '../lib/flag-utils'

interface CountryFlagProps {
  /** The ADM0_A3 country code (e.g., 'USA', 'FRA', 'GBR') */
  countryCode: string
  /** Alt text for the flag image */
  alt?: string
  /** CSS classes for styling */
  className?: string
  /** Size preset for common flag dimensions */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Show fallback emoji if flag is not available */
  showFallback?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-3',
  md: 'w-6 h-4', 
  lg: 'w-8 h-6',
  xl: 'w-12 h-8'
}

export default function CountryFlag({ 
  countryCode, 
  alt, 
  className = '', 
  size = 'md',
  showFallback = true 
}: CountryFlagProps) {
  const [imageError, setImageError] = useState(false)
  

  
  // Determine if using custom sizing (when className contains width/height classes)
  const hasCustomSize = className.includes('w-') || className.includes('h-')
  const sizeClass = hasCustomSize ? '' : sizeClasses[size]
  

  return (
    <img
      src={getFlagPath(countryCode)}
      alt={alt || `Flag of ${countryCode}`}
      className={`${hasCustomSize ? 'object-contain' : 'object-cover rounded shadow-sm'} ${sizeClass} ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  )
}