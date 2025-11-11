/**
 * Data formatting utilities for displaying country and border information
 */

import { CountryData, BorderData } from '../types'
import { SupportedLanguage, getTranslatedCountryName, getTranslatedCapitalName, DEFAULT_LANGUAGE } from './i18n'

/**
 * Format country name with fallbacks and language support
 */
export function formatCountryName(
  countryData: CountryData, 
  featureProperties?: any, 
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  // Try to get translated name first
  const translatedName = getTranslatedCountryName(countryData, language)
  if (translatedName && translatedName !== 'Unknown Country') {
    return translatedName
  }
  
  // Fallback to original logic
  return countryData.name || 
         featureProperties?.name || 
         featureProperties?.NAME || 
         featureProperties?.name_long ||
         'Unknown Country'
}

/**
 * Format capital name with language support
 */
export function formatCapitalName(
  countryData: CountryData,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  // Try to get translated capital name first
  const translatedCapital = getTranslatedCapitalName(countryData, language)
  if (translatedCapital && translatedCapital !== 'Unknown Capital') {
    return translatedCapital
  }
  
  // Fallback to parameters.capital
  return countryData.parameters?.capital || 'Unknown Capital'
}

/**
 * Format ISO codes with validation
 */
export function formatISOCode(code: string | undefined, length: 2 | 3): string {
  if (!code) return 'N/A'
  
  const cleanCode = String(code).trim().toUpperCase()
  
  if (length === 2 && cleanCode.length === 2) {
    return cleanCode
  } else if (length === 3 && cleanCode.length === 3) {
    return cleanCode
  }
  
  return 'Invalid'
}

/**
 * Format numeric values with appropriate units
 */
export function formatNumericValue(value: any, unit?: string): string {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  const numValue = Number(value)
  
  if (isNaN(numValue)) {
    return String(value)
  }

  // Format large numbers with commas
  const formatted = numValue.toLocaleString()
  
  return unit ? `${formatted} ${unit}` : formatted
}

/**
 * Format area values (convert to appropriate units)
 */
export function formatArea(area: any): string {
  const numArea = Number(area)
  
  if (isNaN(numArea) || numArea <= 0) {
    return 'N/A'
  }

  if (numArea < 1) {
    return `${(numArea * 1000000).toLocaleString()} m²`
  } else if (numArea < 1000) {
    return `${numArea.toLocaleString()} km²`
  } else {
    return `${numArea.toLocaleString()} km²`
  }
}

/**
 * Format population values
 */
export function formatPopulation(population: any): string {
  const numPop = Number(population)
  
  if (isNaN(numPop) || numPop <= 0) {
    return 'N/A'
  }

  if (numPop >= 1000000000) {
    return `${(numPop / 1000000000).toFixed(1)}B`
  } else if (numPop >= 1000000) {
    return `${(numPop / 1000000).toFixed(1)}M`
  } else if (numPop >= 1000) {
    return `${(numPop / 1000).toFixed(1)}K`
  } else {
    return numPop.toLocaleString()
  }
}

/**
 * Format coordinate values
 */
export function formatCoordinate(coord: number, type: 'lat' | 'lng'): string {
  if (typeof coord !== 'number' || isNaN(coord)) {
    return 'N/A'
  }

  const direction = type === 'lat' 
    ? (coord >= 0 ? 'N' : 'S')
    : (coord >= 0 ? 'E' : 'W')
  
  return `${Math.abs(coord).toFixed(4)}° ${direction}`
}

/**
 * Format field names for display (convert snake_case to Title Case)
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\bId\b/g, 'ID')
    .replace(/\bIso\b/g, 'ISO')
    .replace(/\bGdp\b/g, 'GDP')
    .replace(/\bUn\b/g, 'UN')
    .replace(/\bWb\b/g, 'World Bank')
}

/**
 * Format border length
 */
export function formatBorderLength(length: any): string {
  const numLength = Number(length)
  
  if (isNaN(numLength) || numLength <= 0) {
    return 'N/A'
  }

  if (numLength < 1) {
    return `${(numLength * 1000).toFixed(0)} m`
  } else {
    return `${numLength.toLocaleString()} km`
  }
}

/**
 * Format date values
 */
export function formatDate(date: any): string {
  if (!date) return 'N/A'
  
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return String(date)
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return String(date)
  }
}

/**
 * Format boolean values
 */
export function formatBoolean(value: any): string {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  const strValue = String(value).toLowerCase()
  if (['true', '1', 'yes', 'y'].includes(strValue)) {
    return 'Yes'
  } else if (['false', '0', 'no', 'n'].includes(strValue)) {
    return 'No'
  }
  
  return String(value)
}

/**
 * Format overlanding status with language support
 */
export function formatOverlandingStatus(overlanding: any, language: SupportedLanguage = DEFAULT_LANGUAGE): string {
  // Import the translation function dynamically to avoid circular imports
  const { getTranslatedOverlandingStatus } = require('./i18n')
  return getTranslatedOverlandingStatus(overlanding, language)
}

/**
 * Truncate long text values
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Format complex object values for display
 */
export function formatComplexValue(value: any): string {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Empty array'
      if (value.length === 1) return String(value[0])
      return `Array (${value.length} items)`
    } else {
      const keys = Object.keys(value)
      if (keys.length === 0) return 'Empty object'
      if (keys.length === 1) return `${keys[0]}: ${value[keys[0]]}`
      return `Object (${keys.length} properties)`
    }
  }
  
  return String(value)
}

/**
 * Get display priority for country parameters
 */
export function getParameterDisplayPriority(key: string): number {
  const priorityMap: Record<string, number> = {
    // High priority - basic info
    'name': 100,
    'name_long': 95,
    'iso_a2': 90,
    'iso_a3': 85,
    'continent': 80,
    'region_wb': 75,
    'subregion': 70,
    
    // Medium priority - geographic
    'area_km2': 65,
    'pop_est': 60,
    'gdp_md_est': 55,
    'economy': 50,
    'income_grp': 45,
    
    // Lower priority - detailed
    'timezone': 40,
    'un_a3': 35,
    'wb_a2': 30,
    'wb_a3': 25,
    
    // Lowest priority - technical
    'featurecla': 10,
    'scalerank': 5,
    'labelrank': 5
  }
  
  return priorityMap[key.toLowerCase()] || 20 // Default medium-low priority
}

/**
 * Sort and filter country parameters for display
 */
export function prepareParametersForDisplay(
  parameters: Record<string, any>,
  maxItems: number = 20
): Array<{ key: string; value: any; formattedKey: string; formattedValue: string }> {
  
  return Object.entries(parameters)
    .filter(([key, value]) => 
      value !== null && 
      value !== undefined && 
      value !== '' &&
      !['borderIds', 'id'].includes(key) // Exclude internal fields
    )
    .map(([key, value]) => ({
      key,
      value,
      formattedKey: formatFieldName(key),
      formattedValue: formatParameterValue(key, value)
    }))
    .sort((a, b) => getParameterDisplayPriority(b.key) - getParameterDisplayPriority(a.key))
    .slice(0, maxItems)
}

/**
 * Format parameter value based on key type
 */
export function formatParameterValue(key: string, value: any): string {
  const lowerKey = key.toLowerCase()
  
  // Area values
  if (lowerKey.includes('area') && lowerKey.includes('km')) {
    return formatArea(value)
  }
  
  // Population values
  if (lowerKey.includes('pop') || lowerKey.includes('population')) {
    return formatPopulation(value)
  }
  
  // GDP values
  if (lowerKey.includes('gdp')) {
    return formatNumericValue(value, 'USD')
  }
  
  // Coordinate values
  if (lowerKey.includes('lat') && typeof value === 'number') {
    return formatCoordinate(value, 'lat')
  }
  if (lowerKey.includes('lng') || lowerKey.includes('lon')) {
    return formatCoordinate(value, 'lng')
  }
  
  // Date values
  if (lowerKey.includes('date') || lowerKey.includes('time')) {
    return formatDate(value)
  }
  
  // Boolean values
  if (typeof value === 'boolean' || 
      (typeof value === 'string' && ['true', 'false', 'yes', 'no'].includes(value.toLowerCase()))) {
    return formatBoolean(value)
  }
  
  // Numeric values
  if (typeof value === 'number') {
    return formatNumericValue(value)
  }
  
  // Complex values
  if (typeof value === 'object') {
    return formatComplexValue(value)
  }
  
  // Text values
  if (typeof value === 'string' && value.length > 50) {
    return truncateText(value, 50)
  }
  
  return String(value)
}

/**
 * Generate summary statistics for country data
 */
export function generateCountrySummary(
  countryData: CountryData, 
  featureProperties?: any, 
  language: SupportedLanguage = DEFAULT_LANGUAGE
): {
  basicInfo: Array<{ label: string; value: string }>
  statistics: Array<{ label: string; value: string }>
  geographic: Array<{ label: string; value: string }>
} {
  const props = { ...countryData.parameters, ...featureProperties }
  
  const basicInfo = [
    { label: 'Full Name', value: formatCountryName(countryData, featureProperties, language) },
    { label: 'Capital', value: formatCapitalName(countryData, language) },
    { label: 'Overlanding Status', value: formatOverlandingStatus(props.overlanding, language) },
    { label: 'ISO A3', value: formatISOCode(countryData.iso_a3, 3) },
    { label: 'ISO A2', value: formatISOCode(props.iso_a2, 2) },
    { label: 'Continent', value: props.continent || 'N/A' },
    { label: 'Region', value: props.region_wb || props.region || 'N/A' }
  ].filter(item => item.value !== 'N/A')
  
  const statistics = [
    { label: 'Population', value: formatPopulation(props.pop_est || props.population) },
    { label: 'Area', value: formatArea(props.area_km2 || props.area) },
    { label: 'GDP', value: formatNumericValue(props.gdp_md_est, 'Million USD') },
    { label: 'Economy', value: props.economy || 'N/A' }
  ].filter(item => item.value !== 'N/A')
  
  const borderCount = props.borders ? Object.keys(props.borders).length : (countryData.borderIds?.length || 0)
  
  const geographic = [
    { label: 'Subregion', value: props.subregion || 'N/A' },
    { label: 'Timezone', value: props.timezone || 'N/A' },
    { label: 'Borders', value: borderCount > 0 ? `${borderCount} border${borderCount !== 1 ? 's' : ''}` : 'N/A' }
  ].filter(item => item.value !== 'N/A')
  
  return { basicInfo, statistics, geographic }
}