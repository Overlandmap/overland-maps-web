/**
 * Utility functions for geographic detection
 */

/**
 * List of European Union country codes and other European countries subject to GDPR
 */
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA countries
  'IS', 'LI', 'NO',
  // UK (still follows GDPR-like regulations)
  'GB',
  // Switzerland (follows similar privacy laws)
  'CH'
]

/**
 * Detect if user is likely from Europe based on timezone
 * This is a fallback method when geolocation is not available
 */
function isEuropeanTimezone(): boolean {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const europeanTimezones = [
      'Europe/', 'Atlantic/Reykjavik', 'Atlantic/Faroe', 'Atlantic/Canary'
    ]
    return europeanTimezones.some(tz => timezone.startsWith(tz))
  } catch {
    return false
  }
}

/**
 * Detect if user is likely from Europe based on language
 * This is another fallback method
 */
function isEuropeanLanguage(): boolean {
  try {
    const language = navigator.language.toLowerCase()
    const europeanLanguages = [
      'de', 'fr', 'it', 'es', 'pt', 'nl', 'da', 'sv', 'no', 'fi', 'pl', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'et', 'lv', 'lt', 'el', 'mt'
    ]
    return europeanLanguages.some(lang => language.startsWith(lang))
  } catch {
    return false
  }
}

/**
 * Check if user is likely from Europe using multiple heuristics
 * Since we can't reliably detect country without user permission,
 * we use timezone and language as indicators
 */
export function isLikelyEuropeanUser(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check timezone first (most reliable)
  if (isEuropeanTimezone()) return true
  
  // Check language as fallback
  if (isEuropeanLanguage()) return true
  
  return false
}

/**
 * Check if GDPR compliance should be shown
 * This can be expanded to include other privacy regulations
 */
export function shouldShowGDPRCompliance(): boolean {
  return isLikelyEuropeanUser()
}