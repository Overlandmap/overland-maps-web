'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslatedCountryName, getTranslatedBorderStatus, getBorderStatusColorClasses, getTranslatedCarnetStatus, getTranslatedOverlandingStatus, getTranslatedLabel } from '../lib/i18n'
import { hasFlagAvailable } from '../lib/flag-utils'
import CountryFlag from './CountryFlag'

interface DetailSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedFeature?: {
    type: 'country' | 'border' | 'border-post' | 'zone'
    id: string
    data: CountryData | BorderData | any | null
    feature: any
  } | null
  onCountrySelect?: (countryCode: string) => void
  onBorderClick?: (borderId: string, borderData: any, feature?: any) => void
  onBorderPostClick?: (borderPostId: string, borderPostData: any, feature?: any) => void
  onBorderPostZoom?: (location: { lng: number, lat: number }) => void
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
    const loadBorderPostsForBorder = () => {
      if (selectedFeature?.type === 'border' && selectedFeature.data) {
        const borderData = selectedFeature.data
        console.log('🔍 DEBUG: Border data:', borderData)
        
        const borderPostsField = (borderData as any).border_posts
        console.log('🔍 DEBUG: border_posts field:', borderPostsField)
        console.log('🔍 DEBUG: border_posts type:', typeof borderPostsField)
        
        // border_posts is a map of ID → name from Firestore
        if (borderPostsField && typeof borderPostsField === 'object') {
          const borderPostsList = Object.entries(borderPostsField).map(([id, name]) => ({
            id,
            name: name as string || 'Unnamed Border Post'
          }))
          
          console.log(`✅ Loaded ${borderPostsList.length} border posts from border data:`, borderPostsList)
          setBorderPosts(borderPostsList)
        } else {
          console.log('⚠️ No border_posts field found or invalid type')
          setBorderPosts([])
        }
      } else {
        console.log('⚠️ No border selected or no border data')
        setBorderPosts([])
      }
    }

    loadBorderPostsForBorder()
  }, [selectedFeature])

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
   */
  const getBorderPostStatus = (isOpen: number) => {
    switch (isOpen) {
      case 0:
        return { label: getTranslatedLabel('closed', language as any), color: 'bg-red-100 text-red-800' }
      case 1:
        return { label: getTranslatedLabel('bilateral', language as any), color: 'bg-orange-100 text-orange-800' }
      case 2:
        return { label: getTranslatedLabel('open', language as any), color: 'bg-green-100 text-green-800' }
      default:
        return { label: getTranslatedLabel('unknown', language as any), color: 'bg-gray-100 text-gray-800' }
    }
  }

  /**
   * Render country information (read-only)
   */
  const renderCountryDetails = (countryData: CountryData, feature: any) => {
    const properties = feature?.properties || {}
    const summary = generateCountrySummary(countryData, properties, language)
    const additionalParams = prepareParametersForDisplay(countryData.parameters || {}, 15)
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="mb-4 -mx-4 bg-gray-50 border-b border-gray-200">
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
                  {(countryData.disputed || countryData.parameters?.disputed) && (
                    <p className="text-sm text-gray-700 mt-1 italic font-bold">
                      {countryData.disputed || countryData.parameters?.disputed}
                    </p>
                  )}
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
          </div>
          
          {/* Overlanding Status - Read Only */}
          {countryData.parameters?.overlanding !== undefined && (
            <div className="mt-3">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Overlanding Status</span>
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
              </div>
            </div>
          )}
        </div>

        {/* Essential Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Carnet */}
            <div className="flex justify-between">
              <span className="text-gray-600 font-semibold">Carnet de passage:</span>
              <span className="font-normal">
                {getTranslatedCarnetStatus(countryData.parameters?.carnet, language)}
              </span>
            </div>
            
            {/* Visa Comment */}
            {countryData.parameters?.visa_comment && (
              <div className="space-y-1">
                <span className="text-gray-600 font-semibold">{getTranslatedLabel('visa', language)}:</span>
                <div className="text-gray-800 font-normal">
                  {countryData.parameters.visa_comment}
                </div>
              </div>
            )}
            
            {/* Driving */}
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
          </div>
        </div>

        {/* Borders */}
        {borderDetails.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Borders
            </h3>
            
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
          </div>
        )}

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
          <h3 className="text-lg font-semibold text-gray-900">Adjacent Countries</h3>
          
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
            {/* Geometry Type */}
            {properties.geomType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Geometry:</span>
                <span className="font-medium">{properties.geomType}</span>
              </div>
            )}
            
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
          {properties.comment && (
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-800">{properties.comment}</p>
              </div>
            </div>
          )}
        </div>

        {/* Border Posts */}
        {(selectedFeature?.type === 'border' && selectedFeature.data) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Border Posts {borderPosts.length > 0 ? `(${borderPosts.length})` : ''}
            </h3>
            
            {borderPosts.length > 0 ? (
              <div className="space-y-2">
                {borderPosts.map((borderPost) => (
                  <div 
                    key={borderPost.id} 
                    className="bg-gray-50 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                    onClick={() => {
                      if (onBorderPostClick) {
                        console.log('🔄 Border post clicked from list:', borderPost.id)
                        // Structure the feature object to match what handleBorderPostClick expects
                        const feature = {
                          properties: {
                            id: borderPost.id,
                            name: borderPost.name
                          },
                          geometry: null
                        }
                        onBorderPostClick(borderPost.id, borderPost, feature)
                      }
                    }}
                  >
                    <div className="font-medium text-sm text-gray-900">
                      🛂 {borderPost.name}
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

  /**
   * Render border post information (read-only)
   */
  const renderBorderPostDetails = (borderPostData: any, feature: any) => {
    const properties = feature?.properties || borderPostData || {}
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
        {(properties.coordinates || (feature?.geometry?.type === 'Point' && feature?.geometry?.coordinates)) && (
          <div>
            <button
              onClick={() => {
                const coords = properties.coordinates || feature?.geometry?.coordinates
                if (coords && onBorderPostZoom) {
                  const [lng, lat] = coords
                  onBorderPostZoom({ lng, lat })
                }
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
              {getTranslatedLabel('zoom_to_location', language)}
            </button>
          </div>
        )}

        {/* Border Post Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Location */}
            {properties.location && (
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{properties.location}</span>
              </div>
            )}
            
            {/* Countries */}
            {properties.countries && (
              <div className="space-y-2">
                <span className="text-gray-600 text-sm font-medium">Countries:</span>
                <div className="flex flex-wrap gap-2">
                  {properties.countries.split(',').map((country: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {country.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Coordinates */}
            {properties.coordinates && (
              <div className="flex justify-between">
                <span className="text-gray-600">Coordinates:</span>
                <span className="font-medium text-xs">
                  {properties.coordinates[1]?.toFixed(4)}, {properties.coordinates[0]?.toFixed(4)}
                </span>
              </div>
            )}
          </div>
          
          {/* Comment */}
          {properties.comment && (
            <div className="space-y-2">
              <span className="text-gray-600 text-sm font-medium">Comment:</span>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-800">{properties.comment}</p>
              </div>
            </div>
          )}
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
        return { label: getTranslatedLabel('zone_permit', language), color: 'bg-gray-100 text-gray-800' }
      case 3:
        return { label: getTranslatedLabel('zone_restrictions', language), color: 'bg-blue-100 text-blue-800' }
      default:
        return { label: getTranslatedLabel('unknown', language), color: 'bg-gray-100 text-gray-800' }
    }
  }

  /**
   * Render zone information (read-only)
   */
  const renderZoneDetails = (zoneData: any, feature: any) => {
    const properties = feature?.properties || zoneData || {}
    const zoneType = getZoneTypeLabel(properties.type ?? 0)
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
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
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${zoneType.color}`}>
              {zoneType.label}
            </span>
          </div>
        </div>

        {/* Zone Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Country */}
            {properties.country && (
              <div className="space-y-2">
                <span className="text-gray-600 text-sm font-medium">{getTranslatedLabel('country', language)}:</span>
                <CountryNameDisplay 
                  countryCode={properties.country} 
                  language={language}
                  onCountryClick={onCountrySelect}
                />
              </div>
            )}
          </div>
          
          {/* Comment */}
          {properties.comment && (
            <div className="space-y-2">
              <span className="text-gray-600 text-sm font-medium">{getTranslatedLabel('comment', language)}:</span>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-800">{properties.comment}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 flex flex-col ${className}`}>
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
            
            {selectedFeature.type === 'border-post' && selectedFeature.data && 
              renderBorderPostDetails(selectedFeature.data, selectedFeature.feature)}
            
            {selectedFeature.type === 'zone' && selectedFeature.data && 
              renderZoneDetails(selectedFeature.data, selectedFeature.feature)}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Click on a country, border, or zone to view details
          </div>
        )}
      </div>
    </div>
  )
}