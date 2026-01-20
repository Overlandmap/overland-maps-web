'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { CountryData, BorderData } from '../types'
import { 
  formatCountryName, 
  formatCapitalName,
  formatISOCode, 
  generateCountrySummary,
  prepareParametersForDisplay,
  formatBorderLength,
  formatFieldName,
  formatParameterValue
} from '../lib/data-formatters'
import { getBorderById, loadCountryData } from '../lib/data-loader'
import { getBorderPostById } from '../lib/border-post-data'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslatedCountryName, getTranslatedBorderStatus, getBorderStatusColorClasses, getTranslatedCarnetStatus, getTranslatedOverlandingStatus, getTranslatedLabel, getTranslatedComment, getTranslatedVisaComment, getTranslatedInsuranceComment, getTranslatedTip, getTranslatedTipComment, getTranslatedStayDuration, getTranslatedVisaStatus, getTranslatedCarnetComment, getTranslatedInsuranceScheme, getTranslatedDisputed } from '../lib/i18n'
import { hasFlagAvailable } from '../lib/flag-utils'
import { processItineraryText, setupItineraryLinkHandlers } from '../lib/text-filters'
import CountryFlag from './CountryFlag'

interface DetailSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedFeature?: {
    type: 'country' | 'border' | 'border-post' | 'zone' | 'itinerary'
    id: string
    data: CountryData | BorderData | any | null
    feature: any
  } | null
  onCountrySelect?: (countryCode: string) => void
  onBorderClick?: (borderId: string, borderData: any, feature?: any) => void
  onBorderPostClick?: (borderPostId: string, borderPostData: any, feature?: any) => void
  onBorderPostZoom?: (location: { lng: number, lat: number }) => void
  onItineraryZoom?: (bounds: [[number, number], [number, number]]) => void
  onItineraryClick?: (itineraryId: string, itineraryData: any, feature?: any) => void
  className?: string
}

interface SidebarState {
  isLoading: boolean
  error?: string
}

interface BorderDetail {
  id: string
  data: BorderData | null
  neighborCountry: string
  neighborCountryName?: string
}

interface CountryNameDisplayProps {
  countryCode: string
  language: string
  onCountryClick?: (countryCode: string) => void
}

/**
 * Calculate bounds for itinerary geometry
 */
function calculateItineraryBounds(geometry: any): [[number, number], [number, number]] | null {
  // Validate geometry object
  if (!geometry || typeof geometry !== 'object') return null
  if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) return null
  if (geometry.coordinates.length === 0) return null
  
  let minLng = Infinity, maxLng = -Infinity
  let minLat = Infinity, maxLat = -Infinity
  let coordinateCount = 0
  
  const processCoordinate = (coord: number[]) => {
    // Validate coordinate format
    if (!Array.isArray(coord) || coord.length < 2) return
    
    const [lng, lat] = coord
    
    // Validate coordinate values
    if (typeof lng !== 'number' || typeof lat !== 'number') return
    if (!isFinite(lng) || !isFinite(lat)) return
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return
    
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    coordinateCount++
  }
  
  try {
    // Handle different geometry types
    if (geometry.type === 'Point') {
      processCoordinate(geometry.coordinates)
    } else if (geometry.type === 'LineString') {
      if (Array.isArray(geometry.coordinates)) {
        geometry.coordinates.forEach(processCoordinate)
      }
    } else if (geometry.type === 'MultiLineString') {
      if (Array.isArray(geometry.coordinates)) {
        geometry.coordinates.forEach((line: any) => {
          if (Array.isArray(line)) {
            line.forEach(processCoordinate)
          }
        })
      }
    } else {
      // Unsupported geometry type
      return null
    }
  } catch (error) {
    console.warn('Error processing geometry coordinates:', error)
    return null
  }
  
  // Check if we found any valid coordinates
  if (coordinateCount === 0) return null
  if (!isFinite(minLng) || !isFinite(maxLng) || !isFinite(minLat) || !isFinite(maxLat)) return null
  
  // For single point, create a small bounds around it
  if (coordinateCount === 1) {
    const padding = 0.01 // ~1km at equator
    return [
      [minLng - padding, minLat - padding],
      [maxLng + padding, maxLat + padding]
    ]
  }
  
  // Add padding (10% of the bounds, with minimum padding)
  const lngRange = maxLng - minLng
  const latRange = maxLat - minLat
  const minPadding = 0.001 // Minimum padding for very small geometries
  
  const lngPadding = Math.max(lngRange * 0.1, minPadding)
  const latPadding = Math.max(latRange * 0.1, minPadding)
  
  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding]
  ]
}

/**
 * Component to display translated country name from country code
 */
function CountryNameDisplay({ countryCode, language, onCountryClick }: CountryNameDisplayProps) {
  const [countryName, setCountryName] = useState<string>(countryCode)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getCountryName = async () => {
      try {
        setLoading(true)
        const { countries } = await loadCountryData()
        const country = countries.find(c => 
          c.id === countryCode || 
          c.iso_a3 === countryCode ||
          c.parameters?.iso_a3 === countryCode ||
          c.parameters?.adm0_a3 === countryCode
        )
        
        if (country) {
          const translatedName = getTranslatedCountryName(country, language as any)
          setCountryName(translatedName)
        } else {
          setCountryName(countryCode)
        }
      } catch (error) {
        console.warn(`Failed to get country name for ${countryCode}:`, error)
        setCountryName(countryCode)
      } finally {
        setLoading(false)
      }
    }

    getCountryName()
  }, [countryCode, language])

  return (
    <div 
      className={`flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 ${
        onCountryClick ? 'hover:bg-blue-50 hover:border-blue-200 cursor-pointer group' : ''
      }`}
      onClick={() => onCountryClick?.(countryCode)}
      title={onCountryClick ? `Click to view ${countryName}` : undefined}
    >
      <div className="flex items-center space-x-3">
        <CountryFlag 
          countryCode={countryCode}
          alt={`Flag of ${countryName}`}
          size="md"
          className="border border-gray-200"
          showFallback={false}
        />
        {!loading && !hasFlagAvailable(countryCode) && (
          <div className="w-6 h-4 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-xs">🌍</span>
          </div>
        )}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 text-sm">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">{countryName}</span>
                {countryName !== countryCode && (
                  <span className="text-gray-500 text-sm ml-2">({countryCode})</span>
                )}
              </div>
              {onCountryClick && (
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DetailSidebar({
  isOpen,
  onClose,
  selectedFeature,
  onCountrySelect,
  onBorderClick,
  onBorderPostClick,
  onBorderPostZoom,
  onItineraryZoom,
  onItineraryClick,
  className = ""
}: DetailSidebarProps) {
  const { language } = useLanguage()
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    isLoading: false
  })
  const [borderDetails, setBorderDetails] = useState<BorderDetail[]>([])
  const [loadingBorders, setLoadingBorders] = useState(false)
  const [borderPosts, setBorderPosts] = useState<any[]>([])
  const [translatedBorderTitle, setTranslatedBorderTitle] = useState<string>('')
  const [crossingText, setCrossingText] = useState<string>('')
  const [activeCountryTab, setActiveCountryTab] = useState<'general' | 'visa' | 'driving' | 'borders'>('general')

  // Reset state when feature changes
  useEffect(() => {
    if (selectedFeature) {
      setSidebarState({ isLoading: false })
    }
  }, [selectedFeature])

  // Load border details when country is selected
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const loadBorderDetails = async () => {
      if (selectedFeature?.type === 'country' && selectedFeature.data) {
        const countryData = selectedFeature.data as CountryData
        const borders = countryData.parameters?.borders
        
        if (borders && Object.keys(borders).length > 0) {
          timeoutId = setTimeout(() => setLoadingBorders(true), 200)
          
          const borderPromises = Object.entries(borders).map(async ([borderId, neighborCountry]) => {
            try {
              const [borderData, translatedName] = await Promise.all([
                getBorderById(borderId, { useCache: false }),
                getTranslatedCountryNameByCode(String(neighborCountry))
              ])
              return {
                id: borderId,
                data: borderData,
                neighborCountry: String(neighborCountry),
                neighborCountryName: translatedName
              }
            } catch (error) {
              console.warn(`Failed to load border ${borderId}:`, error)
              return {
                id: borderId,
                data: null,
                neighborCountry: String(neighborCountry),
                neighborCountryName: String(neighborCountry)
              }
            }
          })
          
          try {
            const results = await Promise.all(borderPromises)
            clearTimeout(timeoutId)
            setLoadingBorders(false)
            setBorderDetails(results)
          } catch (error) {
            console.error('Failed to load border details:', error)
            clearTimeout(timeoutId)
            setLoadingBorders(false)
            setBorderDetails([])
          }
        } else {
          setBorderDetails([])
          setLoadingBorders(false)
        }
      } else {
        setBorderDetails([])
        setLoadingBorders(false)
      }
    }

    loadBorderDetails()
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [selectedFeature, language])

  // Load border posts when a border is selected
  useEffect(() => {
    const loadBorderPostsForBorder = async () => {
      if (selectedFeature?.type === 'border' && selectedFeature.data) {
        const borderData = selectedFeature.data
        const borderPostsField = (borderData as any).border_posts
        
        // border_posts is a map of ID → name from Firestore
        if (borderPostsField && typeof borderPostsField === 'object') {
          try {
            // Fetch full data for each border post to get status information
            const borderPostPromises = Object.entries(borderPostsField).map(async ([id, name]) => {
              try {
                const fullData = await getBorderPostById(id)
                return {
                  id,
                  name: name as string || 'Unnamed Border Post',
                  is_open: fullData?.is_open ?? -1 // Default to unknown if not available
                }
              } catch (error) {
                console.warn(`Failed to load border post ${id}:`, error)
                return {
                  id,
                  name: name as string || 'Unnamed Border Post',
                  is_open: -1 // Default to unknown on error
                }
              }
            })
            
            const borderPostsList = await Promise.all(borderPostPromises)
            setBorderPosts(borderPostsList)
          } catch (error) {
            console.error('Failed to load border posts with status:', error)
            // Fallback to basic data without status
            const borderPostsList = Object.entries(borderPostsField).map(([id, name]) => ({
              id,
              name: name as string || 'Unnamed Border Post',
              is_open: -1 // Default to unknown
            }))
            setBorderPosts(borderPostsList)
          }
        } else {
          setBorderPosts([])
        }
      } else {
        setBorderPosts([])
      }
    }

    loadBorderPostsForBorder()
  }, [selectedFeature])

  // Load crossing text when a border post is selected
  useEffect(() => {
    const loadCrossingText = async () => {
      if (selectedFeature?.type === 'border-post') {
        const properties = normalizeBorderPostData(selectedFeature.data, selectedFeature.feature)
        
        if (properties?.countries) {
          try {
            const crossingTextResult = await generateCrossingText(properties.countries, language)
            setCrossingText(crossingTextResult)
          } catch (error) {
            console.warn('Failed to generate crossing text:', error)
            setCrossingText('')
          }
        } else {
          setCrossingText('')
        }
      } else {
        setCrossingText('')
      }
    }

    loadCrossingText()
  }, [selectedFeature, language])

  /**
   * Get translated border title from country codes
   */
  const getTranslatedBorderTitle = useCallback(async (borderName: string): Promise<string> => {
    if (!borderName) return 'Border Details'
    
    try {
      // Parse country codes from border name (e.g., "IRN-IRQ" -> ["IRN", "IRQ"])
      const countryCodes = borderName.split('-').map(code => code.trim()).filter(code => code)
      
      if (countryCodes.length !== 2) {
        return borderName // Fallback to original name if parsing fails
      }
      
      const { countries } = await loadCountryData()
      const translatedNames = await Promise.all(
        countryCodes.map(async (countryCode) => {
          const country = countries.find(c => 
            c.id === countryCode || 
            c.iso_a3 === countryCode ||
            c.parameters?.iso_a3 === countryCode ||
            c.parameters?.adm0_a3 === countryCode
          )
          
          if (country) {
            return getTranslatedCountryName(country, language)
          }
          
          return countryCode // Fallback to code if country not found
        })
      )
      
      return translatedNames.join(' - ')
    } catch (error) {
      console.warn('Failed to translate border title:', error)
      return borderName // Fallback to original name
    }
  }, [language])

  // Load translated border title when a border is selected
  useEffect(() => {
    const loadTranslatedTitle = async () => {
      if (selectedFeature?.type === 'border') {
        const properties = selectedFeature.feature?.properties || selectedFeature.data || {}
        const borderName = properties.name || ''
        
        if (borderName) {
          const translatedTitle = await getTranslatedBorderTitle(borderName)
          setTranslatedBorderTitle(translatedTitle)
        } else {
          setTranslatedBorderTitle('Border Details')
        }
      } else {
        setTranslatedBorderTitle('')
      }
    }

    loadTranslatedTitle()
  }, [selectedFeature, language, getTranslatedBorderTitle])

  /**
   * Get translated country name by country code
   */
  const getTranslatedCountryNameByCode = async (countryCode: string): Promise<string> => {
    try {
      const { countries } = await loadCountryData()
      const country = countries.find(c => 
        c.id === countryCode || 
        c.iso_a3 === countryCode ||
        c.parameters?.iso_a3 === countryCode ||
        c.parameters?.adm0_a3 === countryCode
      )
      
      if (country) {
        return getTranslatedCountryName(country, language)
      }
      
      return countryCode
    } catch (error) {
      console.warn(`Failed to get translated name for country code ${countryCode}:`, error)
      return countryCode
    }
  }

  /**
   * Generate crossing text from countries field (e.g., "RUS-KAZ" -> "Crossing between Russia and Kazakhstan")
   */
  const generateCrossingText = async (countriesField: string, selectedLanguage?: string): Promise<string> => {
    if (!countriesField || typeof countriesField !== 'string') {
      return ''
    }

    try {
      // Parse country codes from the pattern "ID1-ID2"
      const countryCodes = countriesField.split('-').map(code => code.trim()).filter(code => code)
      
      if (countryCodes.length !== 2) {
        return countriesField // Fallback to original if parsing fails
      }

      // Get translated names for both countries
      const [country1Name, country2Name] = await Promise.all([
        getTranslatedCountryNameByCode(countryCodes[0]),
        getTranslatedCountryNameByCode(countryCodes[1])
      ])

      // Get the translated template using the current language or provided language
      const currentLanguage = selectedLanguage || language
      const template = getTranslatedLabel('crossing_between', currentLanguage as any)
      
      // Handle string interpolation for {country1} and {country2} placeholders
      const crossingText = template
        .replace('{country1}', country1Name)
        .replace('{country2}', country2Name)

      return crossingText
    } catch (error) {
      console.warn('Failed to generate crossing text:', error)
      // Fallback to English template if translation fails
      try {
        const countryCodes = countriesField.split('-').map(code => code.trim()).filter(code => code)
        if (countryCodes.length === 2) {
          const [country1Name, country2Name] = await Promise.all([
            getTranslatedCountryNameByCode(countryCodes[0]),
            getTranslatedCountryNameByCode(countryCodes[1])
          ])
          return `Crossing between ${country1Name} and ${country2Name}`
        }
      } catch (fallbackError) {
        console.warn('Fallback crossing text generation also failed:', fallbackError)
      }
      return countriesField // Final fallback to original field
    }
  }

  /**
   * Handle border post zoom
   */
  const handleBorderPostZoom = (borderPost: any) => {
    if (!borderPost.coordinates) {
      console.warn('Border post missing coordinates:', borderPost)
      return
    }

    const [lng, lat] = borderPost.coordinates
    
    if (onBorderPostZoom) {
      onBorderPostZoom({ lng, lat })
    }
  }

  /**
   * Get border post status
   * is_open values:
   * 0 = Closed (red)
   * 1 = Bilateral (orange)
   * 2 = Open/Multilateral (green)
   * 3 = Restricted (yellow)
   */
  const getBorderPostStatus = (isOpen: number) => {
    switch (isOpen) {
      case 0:
        return { label: getTranslatedLabel('closed', language as any), color: 'bg-red-100 text-red-800' }
      case 1:
        return { label: getTranslatedLabel('bilateral', language as any), color: 'bg-orange-100 text-orange-800' }
      case 2:
        return { label: getTranslatedLabel('open', language as any), color: 'bg-green-100 text-green-800' }
      case 3:
        return { label: getTranslatedLabel('restricted', language as any), color: 'bg-yellow-100 text-yellow-800' }
      default:
        return { label: getTranslatedLabel('unknown', language as any), color: 'bg-gray-100 text-gray-800' }
    }
  }

  /**
   * Render country information (read-only) with tabs
   */
  const renderCountryDetails = (countryData: CountryData, feature: any) => {
    const properties = feature?.properties || {}
    const summary = generateCountrySummary(countryData, properties, language)
    const additionalParams = prepareParametersForDisplay(countryData.parameters || {}, 15)
    
    // Check if all travel data is missing
    const hasNoTravelData = (countryData.parameters?.visa === undefined || countryData.parameters?.visa === null) &&
                            !getTranslatedVisaComment(countryData, language) &&
                            !getTranslatedTip(countryData, language) &&
                            !countryData.parameters?.insurance
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="-mx-4 bg-gray-50 border-b border-gray-200">
          <div className="p-1.5 flex items-center space-x-4">
            <div className="flex-shrink-0">
              <CountryFlag 
                countryCode={countryData.parameters?.adm0_a3 || countryData.id}
                alt={`Flag of ${formatCountryName(countryData, properties, language)}`}
                className="w-24 max-h-18"
              />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {formatCountryName(countryData, properties, language)}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {(() => {
            const disputedText = getTranslatedDisputed(countryData, language)
            return disputedText && (
              <p className="px-1.5 pb-2 text-sm text-gray-700 italic">
                {disputedText}
              </p>
            )
          })()}
        </div>

        {/* Overlanding Status Badge */}
        {countryData.parameters?.overlanding !== undefined && (
          <div className="-mt-6 px-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              countryData.parameters.overlanding === 3 ? 'bg-green-500 text-white' :
              countryData.parameters.overlanding === 2 ? 'bg-yellow-500 text-white' :
              countryData.parameters.overlanding === 1 ? 'bg-red-500 text-white' :
              countryData.parameters.overlanding === 0 ? 'bg-black text-white' :
              'bg-gray-100 text-gray-800'
            }`}>
              {getTranslatedOverlandingStatus(countryData.parameters.overlanding, language)}
            </span>
          </div>
        )}

        {/* Data Coming Soon Message */}
        {hasNoTravelData && (
          <div className="px-4 -mt-2">
            <p className="text-sm text-gray-500 italic">
              {getTranslatedLabel('data_coming_soon', language)}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 -mt-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveCountryTab('general')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeCountryTab === 'general'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getTranslatedLabel('general', language)}
            </button>
            <button
              onClick={() => setActiveCountryTab('visa')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeCountryTab === 'visa'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getTranslatedLabel('visa', language)}
            </button>
            <button
              onClick={() => setActiveCountryTab('driving')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeCountryTab === 'driving'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getTranslatedLabel('vehicle', language)}
            </button>
            <button
              onClick={() => setActiveCountryTab('borders')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeCountryTab === 'borders'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getTranslatedLabel('borders', language)}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {/* General Tab */}
          {activeCountryTab === 'general' && (
            <div className="space-y-4">
              {/* Capital */}
              {countryData.parameters?.capital && (
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">{getTranslatedLabel('capital', language)}:</span>
                  <span className="font-normal">{formatCapitalName(countryData, language)}</span>
                </div>
              )}
              
              {/* Currency */}
              {countryData.parameters?.currency && (
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">{getTranslatedLabel('currency', language)}:</span>
                  <span className="font-normal">{countryData.parameters.currency}</span>
                </div>
              )}
              
              {/* General Comment */}
              {(() => {
                const generalComment = getTranslatedComment(countryData, language)
                return generalComment && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-inner">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {generalComment}
                    </p>
                  </div>
                )
              })()}

            {/* Official Travel Advice Links */}
            {(() => {
              const generateOfficialLinks = () => {
                try {
                  const foreignUrls = countryData.parameters?.foreign_url
                  const links: Array<{ url: string; label: string; countryCode: string }> = []
                // Configuration for different country sources
                // Keys can be either country code (e.g., 'FRA') or language_country (e.g., 'de_CHE')
                const urlConfig: Record<string, { baseUrl: string; labelTemplate: string; postfix?: string; useCountryCode?: boolean }> = {
                  'FRA': {
                    baseUrl: 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/',
                    labelTemplate: 'Conseil aux voyageurs (France)'
                  },
                  'fr_CHE': {
                    baseUrl: 'https://www.eda.admin.ch/eda/fr/dfae/representations-et-conseils-pour-les-voyages/',
                    labelTemplate: 'Conseil pour les voyages (Suisse)',
                    postfix: '.html'
                  },
                  'de_CHE': {
                    baseUrl: 'https://www.eda.admin.ch/eda/de/home/vertretungen-und-reisehinweise/',
                    labelTemplate: 'Reise- und Sicherheitshinweise (Schweiz)',
                    postfix: '.html'
                  },
                  'it_CHE': {
                    baseUrl: 'https://www.eda.admin.ch/eda/it/dfae/rappresentanze-e-consigli-di-viaggio/',
                    labelTemplate: 'Consigli di viaggio (Svizzera)',
                    postfix: '.html'
                  },
                  'fr_BEL': {
                    baseUrl: 'https://diplomatie.belgium.be/fr/pays/',
                    labelTemplate: 'Conseils aux voyageurs (Belgique)'
                  },
                  'nl_BEL': {
                    baseUrl: 'https://diplomatie.belgium.be/nl/landen/',
                    labelTemplate: 'Reisadvies (België)'
                  },
                  'NLD': {
                    baseUrl: 'https://www.nederlandwereldwijd.nl/reizen/reisadviezen/',
                    labelTemplate: 'Reisadvies (Nederland)'
                  },
                  'ITA': {
                    baseUrl: 'https://www.viaggiaresicuri.it/find-country/country/',
                    labelTemplate: 'Viaggiare Sicuri (Italia)',
                    useCountryCode: true // Use ADM0_A3 instead of country name
                  },
                  'ESP': {
                    baseUrl: 'https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-recomendaciones-de-viaje.aspx?trc=',
                    labelTemplate: 'Recomendaciones de viaje (España)'
                  },
                  'GER': {
                    baseUrl: 'https://www.auswaertiges-amt.de/de/service/laender/',
                    labelTemplate: 'Reise- und Sicherheitshinweise (Deutschland)',
                    postfix: '-node/'
                  },
                  'GBR': {
                    baseUrl: 'https://www.gov.uk/foreign-travel-advice/',
                    labelTemplate: 'Travel Advice (UK)'
                  },
                  'USA': {
                    baseUrl: 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/',
                    labelTemplate: 'Travel Advisory (USA)',
                    postfix: '.html'
                  },
                  'en_CAN': {
                    baseUrl: 'https://travel.gc.ca/destinations/',
                    labelTemplate: 'Travel Advice (Canada)'
                  },
                  'fr_CAN': {
                    baseUrl: 'https://voyage.gc.ca/destinations/',
                    labelTemplate: 'Conseils aux voyageurs (Canada)'
                  },
                  // 'AUS': {
                  //   baseUrl: 'https://www.smartraveller.gov.au/destinations/africa/',
                  //   labelTemplate: 'Travel Advice (Australia)'
                  // }
                }

                // Default countries to show per language when no foreign_url exists
                // Use language_country format for language-specific configs
                const defaultCountriesByLanguage: Record<string, string[]> = {
                  'fr': ['FRA', 'fr_CHE', 'fr_BEL', 'fr_CAN'],
                  'en': ['GBR', 'USA', 'en_CAN', 'AUS'],
                  'de': ['GER', 'de_CHE'],
                  'it': ['ITA', 'it_CHE'],
                  'nl': ['NLD', 'nl_BEL'],
                  'es': ['ESP']
                }

                // Helper function to generate URL slug from country name
                const generateSlug = (name: string, capitalize: boolean = false) => {
                  const normalized = name
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9\s-]/gi, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim()
                  
                  if (capitalize) {
                    // Capitalize first letter of each word for USA format (no spaces or hyphens)
                    // Example: "Saudi Arabia" -> "SaudiArabia"
                    return normalized
                      .split('-')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join('')
                  }
                  
                  return normalized.toLowerCase()
                }

                // Check if foreign_url exists and has entries for current language
                if (foreignUrls && typeof foreignUrls === 'object') {
                  // Iterate through foreign_url entries
                  Object.entries(foreignUrls).forEach(([key, value]) => {
                    // Parse key format: {language}_{country_code}
                    const parts = key.split('_')
                    if (parts.length !== 2) return
                    
                    const [lang, countryCode] = parts
                    
                    // Only show links for current language
                    if (lang !== language) return
                    
                    // Try to get configuration with language_country key first, then just country
                    const configKey = `${lang}_${countryCode}`
                    const config = urlConfig[configKey] || urlConfig[countryCode]
                    if (!config) return
                    
                    // Generate URL based on config
                    let urlPart: string
                    if (config.useCountryCode) {
                      // Use ADM0_A3 code directly (e.g., for Italy)
                      urlPart = countryData.parameters?.adm0_a3 || countryData.id || String(value)
                    } else {
                      // Generate slug from country name (capitalize for USA)
                      urlPart = generateSlug(String(value), countryCode === 'USA')
                    }
                    const postfix = config.postfix || ''
                    
                    links.push({
                      url: config.baseUrl + urlPart + postfix,
                      label: config.labelTemplate,
                      countryCode: configKey
                    })
                  })
                }
                
                // If no links found, add default links based on current language
                if (links.length === 0) {
                  const defaultCountries = defaultCountriesByLanguage[language] || []
                  
                  if (defaultCountries.length > 0) {
                    const countryName = formatCountryName(countryData, properties, language)
                    
                    defaultCountries.forEach(configKey => {
                      const config = urlConfig[configKey]
                      if (config) {
                        // Extract actual country code for special handling (e.g., USA capitalization)
                        const actualCountryCode = configKey.includes('_') ? configKey.split('_')[1] : configKey
                        
                        // Generate slug (capitalize for USA)
                        const slug = generateSlug(countryName, actualCountryCode === 'USA')
                        const postfix = config.postfix || ''
                        links.push({
                          url: config.baseUrl + slug + postfix,
                          label: config.labelTemplate,
                          countryCode: configKey
                        })
                      }
                    })
                  }
                }
                
                  return links
                } catch (error) {
                  console.error('Error generating official links:', error)
                  return []
                }
              }

              const officialLinks = generateOfficialLinks()
              
              if (officialLinks.length > 0) {
                return (
                  <div className="mt-4 space-y-2">
                    {officialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors w-full"
                      >
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="flex-1">{link.label}</span>
                      </a>
                    ))}
                  </div>
                )
              }
              
              return null
            })()}
            </div>
          )}

          {/* Visa Tab */}
          {activeCountryTab === 'visa' && (
            <div className="space-y-4">
              {hasNoTravelData ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 italic">
                    {getTranslatedLabel('data_coming_soon', language)}
                  </p>
                </div>
              ) : (
                <>
                  {/* Visa Status */}
                  {countryData.parameters?.visa !== undefined && (
                    <div>
                      {countryData.parameters?.visa_url ? (
                        <a 
                          href={countryData.parameters.visa_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-bold text-blue-600 hover:text-blue-800 underline"
                        >
                          {getTranslatedVisaStatus(countryData.parameters.visa, language as any)}
                        </a>
                      ) : (
                        <span className="font-bold text-gray-900">
                          {getTranslatedVisaStatus(countryData.parameters.visa, language as any)}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Visa Comment */}
                  {(() => {
                    const visaComment = getTranslatedVisaComment(countryData, language)
                    return visaComment && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-inner">
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {visaComment}
                        </p>
                      </div>
                    )
                  })()}
                </>
              )}
            </div>
          )}

          {/* Vehicle Tab */}
          {activeCountryTab === 'driving' && (
            <div className="space-y-4">
              {hasNoTravelData ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 italic">
                    {getTranslatedLabel('data_coming_soon', language)}
                  </p>
                </div>
              ) : (
                <>
                  {/* Driving Side */}
                  {countryData.parameters?.driving && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">{getTranslatedLabel('driving', language)}:</span>
                      <span className="font-normal">
                        {countryData.parameters.driving === 'l' ? getTranslatedLabel('left', language) : 
                         countryData.parameters.driving === 'r' ? getTranslatedLabel('right', language) : 
                         countryData.parameters.driving}
                      </span>
                    </div>
                  )}
                  
                  {/* Carnet */}
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">{getTranslatedLabel('carnet', language)}:</span>
                    <span className="font-normal">
                      {getTranslatedCarnetStatus(countryData.parameters?.carnet, language)}
                    </span>
                  </div>
                  
                  {/* Carnet Comment (no label) */}
                  {(() => {
                    const carnetComment = getTranslatedCarnetComment(countryData, language)
                    return carnetComment && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-inner">
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {carnetComment}
                        </p>
                      </div>
                    )
                  })()}
                  
                  {/* Separator */}
                  {(getTranslatedTip(countryData, language) || getTranslatedTipComment(countryData, language) || getTranslatedStayDuration(countryData, language)) && (
                    <div className="border-t border-gray-200"></div>
                  )}
                  
                  {/* TIP (temporary import permit) */}
                  {(() => {
                    const tip = getTranslatedTip(countryData, language)
                    return tip && (
                      <div className="space-y-2">
                        <span className="text-gray-600 font-semibold">{getTranslatedLabel('tip_label', language)}:</span>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-inner">
                          <p className="text-gray-800 text-sm leading-relaxed">
                            {tip}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                  
                  {/* Tip Comment (no label) */}
                  {(() => {
                    const tipComment = getTranslatedTipComment(countryData, language)
                    return tipComment && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-inner">
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {tipComment}
                        </p>
                      </div>
                    )
                  })()}
                  
                  {/* Maximum stay */}
                  {(() => {
                    const stayDuration = getTranslatedStayDuration(countryData, language)
                    return stayDuration && (
                      <div className="space-y-1">
                        <span className="text-gray-600 font-semibold">{getTranslatedLabel('maximum_stay', language)}:</span>
                        <div className="text-gray-800 font-normal">{stayDuration}</div>
                      </div>
                    )
                  })()}
                  
                  {/* Separator */}
                  {(countryData.parameters?.insurance !== undefined || getTranslatedInsuranceComment(countryData, language) || countryData.parameters?.insurance_url) && (
                    <div className="border-t border-gray-200"></div>
                  )}
                  
                  {/* Insurance */}
                  {countryData.parameters?.insurance !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">{getTranslatedLabel('insurance', language)}:</span>
                      <span className="font-normal">
                        {countryData.parameters.insurance === 1 ? getTranslatedLabel('mandatory', language) : 
                         countryData.parameters.insurance === 0 ? getTranslatedLabel('not_required', language) : 
                         countryData.parameters.insurance}
                      </span>
                    </div>
                  )}
                  
                  {/* Insurance Scheme (System) */}
                  {countryData.parameters?.insurance_scheme && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">{getTranslatedLabel('insurance_system', language)}:</span>
                      <span className="font-normal">{getTranslatedInsuranceScheme(countryData.parameters.insurance_scheme, language as any)}</span>
                    </div>
                  )}
              
                  {/* Insurance Comment (no label) */}
                  {(() => {
                    const insuranceComment = getTranslatedInsuranceComment(countryData, language)
                    return insuranceComment && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-inner">
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {insuranceComment}
                        </p>
                      </div>
                    )
                  })()}
                  
                  {/* Insurance URL (Official website link) */}
                  {countryData.parameters?.insurance_url && (
                    <div>
                      <a 
                        href={countryData.parameters.insurance_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {getTranslatedLabel('official_website', language)}
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Borders Tab */}
          {activeCountryTab === 'borders' && (
            <div className="space-y-4">
              {borderDetails.length > 0 ? (
                <>
                  {loadingBorders ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="text-sm text-gray-500">Loading borders...</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {borderDetails.map((border) => {
                        const neighborCountry = border.neighborCountry
                        const translatedName = border.neighborCountryName || neighborCountry
                        const borderStatus = getTranslatedBorderStatus((border.data as any)?.is_open || 0, language as any)
                        const statusColorClass = getBorderStatusColorClasses((border.data as any)?.is_open || 0)
                        
                        return (
                          <div 
                            key={border.id} 
                            className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => onBorderClick && onBorderClick(border.id, border.data, null)}
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <CountryFlag 
                                countryCode={neighborCountry}
                                alt={`Flag of ${translatedName}`}
                                size="sm"
                                className="border border-gray-200"
                              />
                              <div className="font-medium text-sm text-gray-900">
                                {translatedName}
                              </div>
                            </div>
                            <div className="mt-1">
                              <span className={`text-xs px-2 py-1 rounded ${statusColorClass}`}>
                                {borderStatus}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {getTranslatedLabel('no_borders', language)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }



  /**
   * Render border information (read-only)
   */
  const renderBorderDetails = (borderData: any, feature: any) => {
    const properties = feature?.properties || borderData || {}
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {translatedBorderTitle || properties.name || 'Border Details'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getBorderStatusColorClasses(properties.is_open || 0)}`}>
              {getTranslatedBorderStatus(properties.is_open || 0, language as any)}
            </span>
          </div>
        </div>

        {/* Adjacent Countries */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{getTranslatedLabel('adjacent_countries', language)}</h3>
          
          {(() => {
            // Parse country codes from border name (e.g., "KAZ - KGZ" -> ["KAZ", "KGZ"])
            const borderName = properties.name || ''
            const countryCodes = borderName.split(' - ').filter((code: string) => code.trim())
            
            return countryCodes.length > 0 ? (
              <div className="space-y-3">
                {countryCodes.map((countryCode: string, index: number) => (
                  <CountryNameDisplay 
                    key={index} 
                    countryCode={countryCode} 
                    language={language}
                    onCountryClick={onCountrySelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-gray-600 text-sm">
                Country information not available
              </div>
            )
          })()}
        </div>

        {/* Border Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Last Updated */}
            {properties.updatedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Updated:</span>
                <span className="font-medium text-xs">
                  {new Date(properties.updatedAt._seconds * 1000).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          {/* Comment */}
          {(() => {
            // Validate translation structure and log warnings
            const validation = validateTranslationStructure(properties);
            if (validation.warnings.length > 0) {
              console.warn('Border translation validation warnings:', validation.warnings);
            }

            // Get the translated comment using the validation helper
            const displayComment = getTranslatedFieldValue(
              properties.comment_translations,
              properties.comment,
              language
            );
            
            return displayComment && (
              <div className="space-y-2">
                <span className="text-gray-600 text-sm font-medium">{getTranslatedLabel('comment', language)}:</span>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-800">{displayComment}</p>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Border Posts */}
        {(selectedFeature?.type === 'border' && selectedFeature.data) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {getTranslatedLabel('border_posts', language)}
            </h3>
            
            {borderPosts.length > 0 ? (
              <div className="space-y-2">
                {borderPosts.map((borderPost) => (
                  <div 
                    key={borderPost.id} 
                    className="bg-gray-50 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                    onClick={async () => {
                      if (onBorderPostClick) {

                        
                        try {
                          // Fetch full border post data
                          const fullBorderPostData = await getBorderPostById(borderPost.id)
                          
                          if (fullBorderPostData) {
                            // Structure the feature object with full data
                            // Extract coordinates from location field (Firebase format)
                            let coordinates = null
                            if (fullBorderPostData.location && 
                                typeof fullBorderPostData.location === 'object' && 
                                '_longitude' in fullBorderPostData.location && 
                                '_latitude' in fullBorderPostData.location) {
                              const location = fullBorderPostData.location as { _longitude: number; _latitude: number }
                              coordinates = [
                                location._longitude,
                                location._latitude
                              ]
                            } else if (fullBorderPostData.coordinates) {
                              coordinates = fullBorderPostData.coordinates
                            }
                            
                            const feature = {
                              properties: {
                                ...fullBorderPostData,
                                // Ensure we have the basic properties
                                id: borderPost.id,
                                name: borderPost.name,
                                coordinates: coordinates
                              },
                              geometry: coordinates ? {
                                type: 'Point',
                                coordinates: coordinates
                              } : null
                            }
                            

                            onBorderPostClick(borderPost.id, fullBorderPostData, feature)
                          } else {
                            console.warn('⚠️ Could not load full border post data, using minimal data')
                            // Fallback to minimal data if full data is not available
                            const feature = {
                              properties: {
                                id: borderPost.id,
                                name: borderPost.name
                              },
                              geometry: null
                            }
                            onBorderPostClick(borderPost.id, borderPost, feature)
                          }
                        } catch (error) {
                          console.error('❌ Error loading border post data:', error)
                          // Fallback to minimal data on error
                          const feature = {
                            properties: {
                              id: borderPost.id,
                              name: borderPost.name
                            },
                            geometry: null
                          }
                          onBorderPostClick(borderPost.id, borderPost, feature)
                        }
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-gray-900">
                        🛂 {borderPost.name}
                      </div>
                      {/* Status swatch */}
                      {borderPost.is_open !== undefined && (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getBorderPostStatus(borderPost.is_open).color}`}>
                          {getBorderPostStatus(borderPost.is_open).label}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-4">
                No border post data available
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Helper functions for location field type validation
  const isValidLocationString = (location: any): location is string => {
    return typeof location === 'string' && location.trim().length > 0;
  };

  const isFirebaseCoordinate = (location: any): boolean => {
    return !!(location && 
              typeof location === 'object' && 
              '_latitude' in location && 
              '_longitude' in location);
  };

  // Helper functions for translation field validation
  const isValidTranslationField = (translations: any): translations is Record<string, string> => {
    if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
      return false;
    }
    
    // Check if at least one value is a valid string
    return Object.values(translations).some(value => typeof value === 'string' && value.trim().length > 0);
  };

  const getTranslatedFieldValue = (
    translations: any, 
    originalValue: any, 
    currentLanguage: string
  ): string | null => {
    // Return null if no valid content exists
    if (!originalValue && (!translations || !isValidTranslationField(translations))) {
      return null;
    }

    // If translations exist and are valid, try to get translated value
    if (isValidTranslationField(translations)) {
      // Try current language first
      if (translations[currentLanguage] && typeof translations[currentLanguage] === 'string') {
        return translations[currentLanguage];
      }
      
      // Fallback to English
      if (translations['en'] && typeof translations['en'] === 'string') {
        return translations['en'];
      }
    }

    // Fallback to original value if it's a valid string
    if (typeof originalValue === 'string' && originalValue.trim().length > 0) {
      return originalValue;
    }

    return null;
  };

  const validateTranslationStructure = (data: any): { 
    hasValidTranslations: boolean; 
    hasValidOriginal: boolean; 
    warnings: string[] 
  } => {
    const warnings: string[] = [];
    const hasValidTranslations = isValidTranslationField(data?.comment_translations);
    const hasValidOriginal = typeof data?.comment === 'string' && data.comment.trim().length > 0;

    if (data?.comment_translations && !hasValidTranslations) {
      warnings.push('comment_translations field exists but is malformed');
    }

    if (!hasValidTranslations && !hasValidOriginal) {
      warnings.push('No valid comment data available');
    }

    return {
      hasValidTranslations,
      hasValidOriginal,
      warnings
    };
  };

  /**
   * Normalize border post data from different sources into a unified structure
   */
  const normalizeBorderPostData = (borderPostData: any, feature: any) => {
    // Handle case where both data sources are null/empty
    if (!borderPostData && !feature) {
      return null;
    }

    // Create a unified data structure by merging both sources
    // Priority: borderPostData (from database) > feature.properties (from map data)
    // Exception: preserve translation data from feature if not available in database
    const rawData = {
      ...feature?.properties,
      ...borderPostData
    };

    // Special handling for translation fields - preserve from feature if database doesn't have them
    // Check both comment_translations and comment_translated field names
    const comment_translations = borderPostData?.comment_translations || 
                                 borderPostData?.comment_translated ||
                                 feature?.properties?.comment_translations ||
                                 feature?.properties?.comment_translated;
    const comment = borderPostData?.comment || feature?.properties?.comment;

    // Normalize coordinates from different formats
    let coordinates = rawData.coordinates;
    if (!coordinates && rawData.location && typeof rawData.location === 'object') {
      // Handle Firebase GeoPoint format
      if (rawData.location._latitude && rawData.location._longitude) {
        coordinates = [rawData.location._longitude, rawData.location._latitude];
      }
    }
    if (!coordinates && feature?.geometry?.coordinates) {
      coordinates = feature.geometry.coordinates;
    }

    return {
      id: rawData.id,
      name: rawData.name,
      location: rawData.location,
      countries: rawData.countries,
      coordinates: coordinates,
      is_open: rawData.is_open,
      comment: comment,
      comment_translations: comment_translations,
      comment_translated: comment_translations // Alias for compatibility
    };
  };

  /**
   * Render border post information (read-only) - unified implementation
   */
  const renderBorderPostDetails = (borderPostData: any, feature: any) => {
    // Normalize data from both sources into a unified structure
    const properties = normalizeBorderPostData(borderPostData, feature);
    
    // Handle case where no valid data is available
    if (!properties) {
      return (
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  🛂 Border Post
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="text-center py-8 text-gray-500">
            No border post data available
          </div>
        </div>
      )
    }
    
    const status = getBorderPostStatus(properties.is_open ?? -1)
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                🛂 {properties.name || 'Border Post'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Zoom Button */}
        {(() => {
          // Check for valid coordinates from either source
          const borderPostCoords = properties.coordinates
          const featureCoords = feature?.geometry?.type === 'Point' ? feature?.geometry?.coordinates : null
          
          // Validate coordinates are arrays with 2 numeric values
          const isValidCoords = (coords: any) => 
            Array.isArray(coords) && 
            coords.length >= 2 && 
            typeof coords[0] === 'number' && 
            typeof coords[1] === 'number' &&
            isFinite(coords[0]) && 
            isFinite(coords[1])
          
          const validBorderPostCoords = isValidCoords(borderPostCoords) ? borderPostCoords : null
          const validFeatureCoords = isValidCoords(featureCoords) ? featureCoords : null
          const finalCoords = validBorderPostCoords || validFeatureCoords
          
          return finalCoords && onBorderPostZoom && (
            <div>
              <button
                onClick={() => {
                  const [lng, lat] = finalCoords
                  onBorderPostZoom({ lng, lat })
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
                {getTranslatedLabel('zoom_to_location', language)}
              </button>
            </div>
          )
        })()}

        {/* Border Post Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Location */}
            {isValidLocationString(properties.location) && (
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{properties.location}</span>
              </div>
            )}
            
            {/* Crossing Information */}
            {crossingText && (
              <div className="flex justify-between">
                <span className="font-medium">{crossingText}</span>
              </div>
            )}
            

          </div>
          
          {/* Comment */}
          {(() => {
            // Validate translation structure and log warnings
            const validation = validateTranslationStructure(properties);
            if (validation.warnings.length > 0) {
              console.warn('Border post translation validation warnings:', validation.warnings);
            }

            // Check if translations are in comment_translated field instead
            const translations = properties.comment_translated || properties.comment_translations;

            // Get the translated comment using the validation helper
            const displayComment = getTranslatedFieldValue(
              translations,
              properties.comment,
              language
            );
            
            return displayComment && (
              <div className="space-y-2">
                <span className="text-gray-600 text-sm font-medium">{getTranslatedLabel('comment', language)}:</span>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-800">{displayComment}</p>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    )
  }

  /**
   * Get zone type label
   * type values:
   * 0 = Closed (red)
   * 1 = Guide/Escort Needed (black)
   * 2 = Permit Needed (white/gray)
   * 3 = Restrictions apply (blue)
   */
  const getZoneTypeLabel = (type: number) => {
    switch (type) {
      case 0:
        return { label: getTranslatedLabel('zone_closed', language), color: 'bg-red-100 text-red-800' }
      case 1:
        return { label: getTranslatedLabel('zone_guide_escort', language), color: 'bg-gray-900 text-white' }
      case 2:
        return { label: getTranslatedLabel('zone_permit', language), color: 'bg-blue-100 text-blue-800' }
      case 3:
        return { label: getTranslatedLabel('zone_restrictions', language), color: 'bg-gray-100 text-gray-800' }
      default:
        return { label: getTranslatedLabel('unknown', language), color: 'bg-gray-100 text-gray-800' }
    }
  }

  /**
   * Render zone information (read-only)
   */
  const renderZoneDetails = (zoneData: any, feature: any) => {
    // Merge zoneData with feature properties, prioritizing zoneData for fields like comment_translations
    const properties = {
      ...zoneData,
      ...feature?.properties,
      // Preserve important fields from zoneData if not in feature
      comment_translations: feature?.properties?.comment_translations || zoneData?.comment_translations,
      comment: feature?.properties?.comment || zoneData?.comment,
      description: feature?.properties?.description || zoneData?.description
    }
    const zoneType = getZoneTypeLabel(properties.type ?? 0)
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-gray-900 flex-1">
              🚫 {properties.name || 'Restricted Zone'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Status Badge */}
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${zoneType.color}`}>
            {zoneType.label}
          </span>
        </div>

        {/* Zone Information */}
        <div className="space-y-4">
          {/* Country (without label) */}
          {properties.country && (
            <CountryNameDisplay 
              countryCode={properties.country} 
              language={language}
              onCountryClick={onCountrySelect}
            />
          )}
          
          {/* Comment (without label) */}
          {(() => {
            // Validate translation structure and log warnings
            const validation = validateTranslationStructure(properties);
            if (validation.warnings.length > 0) {
              console.warn('Zone translation validation warnings:', validation.warnings);
            }

            // Get the translated comment using the validation helper
            const displayComment = getTranslatedFieldValue(
              properties.comment_translations,
              properties.comment,
              language
            );
            
            return displayComment && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-800">{displayComment}</p>
              </div>
            )
          })()}
        </div>
      </div>
    )
  }

  /**
   * Get translated description with fallback logic
   */
  const getTranslatedDescription = (properties: any, language: string): string | null => {
    // Try to get translation for current language
    if (properties.translatedDesc && properties.translatedDesc[language]) {
      return properties.translatedDesc[language]
    }
    
    // Fallback to English translation
    if (properties.translatedDesc && properties.translatedDesc['en']) {
      return properties.translatedDesc['en']
    }
    
    // Fallback to original description
    if (properties.description) {
      return properties.description
    }
    
    return null
  }

  /**
   * Get translated highlights with fallback logic
   */
  const getTranslatedHighlights = (properties: any, language: string): string | null => {
    // Try to get translation for current language
    if (properties.translatedHighlights && properties.translatedHighlights[language]) {
      return properties.translatedHighlights[language]
    }
    
    // Fallback to English translation
    if (properties.translatedHighlights && properties.translatedHighlights['en']) {
      return properties.translatedHighlights['en']
    }
    
    // Fallback to original highlights
    if (properties.highlights) {
      return properties.highlights
    }
    
    return null
  }

  /**
   * Component for rendering processed itinerary text with HTML and link handlers
   */
  const ProcessedTextDisplay = ({ 
    text, 
    className = "" 
  }: { 
    text: string
    className?: string 
  }) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (containerRef.current && onItineraryClick) {
        // Create a wrapper function that matches the expected signature
        const handleItineraryLinkClick = (itineraryId: string) => {
          onItineraryClick(itineraryId, null, null)
        }
        setupItineraryLinkHandlers(containerRef.current, handleItineraryLinkClick)
      }
    }, [text])

    const processedText = processItineraryText(text)

    return (
      <div 
        ref={containerRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    )
  }

  /**
   * Render itinerary information
   */
  const renderItineraryDetails = (feature: any) => {
    const properties = feature?.properties || {}
    
    return (
      <div className="space-y-4">
        {/* Header with trackPackName and close button */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {properties.trackPackName || getTranslatedLabel('track_pack', language)}
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Zoom Button */}
        {(() => {
          const geometry = feature?.geometry
          const bounds = calculateItineraryBounds(geometry)
          const hasValidGeometry = bounds !== null
          const hasZoomCallback = typeof onItineraryZoom === 'function'
          
          // Determine button state and feedback message
          let isDisabled = false
          let tooltipMessage = undefined
          
          if (!hasZoomCallback) {
            isDisabled = true
            tooltipMessage = 'Zoom functionality not available'
          } else if (!geometry) {
            isDisabled = true
            tooltipMessage = 'No geometry data available for this itinerary'
          } else if (!hasValidGeometry) {
            isDisabled = true
            tooltipMessage = 'Invalid geometry data - cannot calculate bounds'
          }
          
          return (
            <div>
              <button
                onClick={() => {
                  // Additional safety checks before calling zoom
                  if (!isDisabled && bounds && hasZoomCallback) {
                    try {
                      onItineraryZoom(bounds)
                    } catch (error) {
                      console.error('Error during itinerary zoom:', error)
                      // Could show user-friendly error message here
                    }
                  }
                }}
                disabled={isDisabled}
                className={`w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm ${
                  !isDisabled
                    ? 'text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 hover:border-blue-700'
                    : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                }`}
                title={tooltipMessage}
                aria-label={isDisabled ? tooltipMessage : `Zoom to ${properties.name || 'itinerary'}`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
                {getTranslatedLabel('zoom_to_location', language)}
              </button>
            </div>
          )
        })()}

        {/* Header Image */}
        {properties.titlePhotoUrl && (
          <div>
            <img 
              src={properties.titlePhotoUrl} 
              alt={properties.name || 'Itinerary'} 
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Itinerary ID and Name */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {properties.itineraryId || 'Unknown'}: {properties.name || 'Unnamed Itinerary'}
          </h2>
        </div>

        {/* Length and Steps on same line */}
        <div>
          <p className="text-lg text-gray-700">
            {properties.lengthKM ? `${properties.lengthKM} km` : getTranslatedLabel('length_unknown', language)}
            {properties.lengthKM && properties.lengthDays && ', '}
            {properties.lengthDays ? `${properties.lengthDays} ${getTranslatedLabel('days', language)}` : ''}
          </p>
        </div>

        {/* Description Section */}
        {(() => {
          const description = getTranslatedDescription(properties, language)
          return description && (
            <div className="space-y-2">
              <span className="text-gray-600 text-sm font-medium">{getTranslatedLabel('description', language)}:</span>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <ProcessedTextDisplay 
                  text={description}
                  className="text-sm text-gray-800 whitespace-pre-line leading-relaxed"
                />
              </div>
            </div>
          )
        })()}

        {/* Highlights Section */}
        {(() => {
          const highlights = getTranslatedHighlights(properties, language)
          return highlights && (
            <div className="space-y-2">
              <span className="text-gray-600 text-sm font-medium">{getTranslatedLabel('highlights', language)}:</span>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <ProcessedTextDisplay 
                  text={highlights}
                  className="text-sm text-gray-800 whitespace-pre-line leading-relaxed"
                />
              </div>
            </div>
          )
        })()}

        {/* Mobile App Promotion */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-800 mb-4">
            {getTranslatedLabel('itinerary_app_promotion', language)}
          </p>
          
          <div className="flex space-x-3">
            {/* App Store Button */}
            <a
              href="https://apps.apple.com/us/app/overland-map/id6741202903"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-sm font-medium">{getTranslatedLabel('app_store', language)}</span>
            </a>

            {/* Play Store Button */}
            <a
              href="https://play.google.com/store/apps/details?id=ch.overlandmap.map"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <span className="text-sm font-medium">{getTranslatedLabel('play_store', language)}</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col ${className}`}>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {sidebarState.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : selectedFeature ? (
          <>
            {selectedFeature.type === 'country' && selectedFeature.data && 
              renderCountryDetails(selectedFeature.data as CountryData, selectedFeature.feature)}
            
            {selectedFeature.type === 'border' && selectedFeature.data && 
              renderBorderDetails(selectedFeature.data, selectedFeature.feature)}
            
            {selectedFeature.type === 'border-post' && 
              renderBorderPostDetails(selectedFeature.data, selectedFeature.feature)}
            
            {selectedFeature.type === 'zone' && selectedFeature.data && 
              renderZoneDetails(selectedFeature.data, selectedFeature.feature)}
            
            {selectedFeature.type === 'itinerary' && selectedFeature.feature && 
              renderItineraryDetails(selectedFeature.feature)}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Click on a country, border, zone, or itinerary to view details
          </div>
        )}
      </div>
    </div>
  )
}