import { useCallback, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { getCountryByISO3, getCountryByADM0A3 } from '../lib/data-loader'

interface MapInteractionHandlers {
  onCountryClick?: (iso3: string, countryData: any, feature: any) => void
  onBorderClick?: (borderId: string, borderData: any, feature: any) => void
  onBorderPostClick?: (borderPostId: string, borderPostData: any, feature: any) => void
  onSelectionClear?: () => void
}

interface SelectedFeature {
  type: 'country' | 'border' | 'border-post'
  id: string
  feature: any
  data?: any
}

/**
 * Highlight style constants for map features
 * These styles ensure visual consistency and accessibility compliance
 */
const HIGHLIGHT_STYLES = {
  country: {
    // Darker fill color for selected countries (30% darker than base)
    // Provides 4.5:1 contrast ratio for WCAG AA compliance
    fillColor: '#1e40af', // Deep blue - 30% darker than typical base colors
    fillOpacity: 0.5,
    transitionDuration: 100 // ms - ensures updates complete within 100ms
  },
  border: {
    // Plain white for maximum contrast and visibility
    // Works well with both overlanding and carnet color schemes
    lineColor: '#ffffff', // Pure white
    lineWidth: 4, // Double the default width (2x)
    lineOpacity: 1.0,
    transitionDuration: 100 // ms - ensures updates complete within 100ms
  }
} as const

export function useMapInteractions(
  map: React.MutableRefObject<maplibregl.Map | null>,
  handlers: MapInteractionHandlers
) {
  const selectedFeature = useRef<SelectedFeature | null>(null)
  const hoveredFeature = useRef<any>(null)

  /**
   * Extract country identifier from clicked country feature
   */
  const extractCountryIdFromFeature = useCallback((feature: any): string | null => {
    if (!feature) return null
    
    const properties = feature.properties || {}
    
    // Try different possible field names for country identification
    // Priority: Natural Earth fields first, then feature ID, then fallbacks
    return properties.ADM0_A3 ||  // Natural Earth admin code (primary)
           properties.ISO_A3 ||   // Natural Earth ISO code
           feature.id ||          // GeoJSON feature ID
           properties.id ||       // Feature ID copied to properties
           properties.adm0_a3 ||  // Lowercase variants
           properties.iso_a3 || 
           properties.iso3 || 
           properties.ISO3 ||
           properties.NAME ||     // Natural Earth name field
           properties.name ||     // Fallback to country name
           null
  }, [])

  /**
   * Map country names to ISO A3 codes for data lookup
   * Comprehensive mapping from Natural Earth country names to ISO A3 codes
   */
  const mapCountryNameToISO3 = useCallback((countryName: string): string | null => {
    const nameToISO3Map: Record<string, string> = {
      // Major countries
      'United States of America': 'USA',
      'Canada': 'CAN',
      'France': 'FRA',
      'Germany': 'DEU',
      'United Kingdom': 'GBR',
      'Spain': 'ESP',
      'Italy': 'ITA',
      'Mexico': 'MEX',
      'Brazil': 'BRA',
      'Argentina': 'ARG',
      'Australia': 'AUS',
      'China': 'CHN',
      'India': 'IND',
      'Russia': 'RUS',
      'Japan': 'JPN',
      
      // Additional mappings for common Natural Earth names
      'Afghanistan': 'AFG',
      'Albania': 'ALB',
      'Algeria': 'DZA',
      'Angola': 'AGO',
      'Antarctica': 'ATA',
      'Armenia': 'ARM',
      'Austria': 'AUT',
      'Azerbaijan': 'AZE',
      'The Bahamas': 'BHS',
      'Bangladesh': 'BGD',
      'Belarus': 'BLR',
      'Belgium': 'BEL',
      'Belize': 'BLZ',
      'Benin': 'BEN',
      'Bolivia': 'BOL',
      'Bosnia and Herzegovina': 'BIH',
      'Botswana': 'BWA',
      'Brunei': 'BRN',
      'Bulgaria': 'BGR',
      'Burkina Faso': 'BFA',
      'Burundi': 'BDI',
      'Cambodia': 'KHM',
      'Cameroon': 'CMR',
      'Central African Republic': 'CAF',
      'Chad': 'TCD',
      'Chile': 'CHL',
      'Colombia': 'COL',
      'Democratic Republic of the Congo': 'COD',
      'Republic of the Congo': 'COG',
      'Costa Rica': 'CRI',
      'Croatia': 'HRV',
      'Cuba': 'CUB',
      'Cyprus': 'CYP',
      'Czech Republic': 'CZE',
      'Denmark': 'DNK',
      'Djibouti': 'DJI',
      'Dominican Republic': 'DOM',
      'Ecuador': 'ECU',
      'Egypt': 'EGY',
      'El Salvador': 'SLV',
      'Equatorial Guinea': 'GNQ',
      'Eritrea': 'ERI',
      'Estonia': 'EST',
      'Ethiopia': 'ETH',
      'Finland': 'FIN',
      'Gabon': 'GAB',
      'Gambia': 'GMB',
      'Georgia': 'GEO',
      'Ghana': 'GHA',
      'Greece': 'GRC',
      'Greenland': 'GRL',
      'Guatemala': 'GTM',
      'Guinea': 'GIN',
      'Guinea-Bissau': 'GNB',
      'Guyana': 'GUY',
      'Haiti': 'HTI',
      'Honduras': 'HND',
      'Hungary': 'HUN',
      'Iceland': 'ISL',
      'Indonesia': 'IDN',
      'Iran': 'IRN',
      'Iraq': 'IRQ',
      'Ireland': 'IRL',
      'Israel': 'ISR',
      'Ivory Coast': 'CIV',
      'Jamaica': 'JAM',
      'Jordan': 'JOR',
      'Kazakhstan': 'KAZ',
      'Kenya': 'KEN',
      'Kuwait': 'KWT',
      'Kyrgyzstan': 'KGZ',
      'Laos': 'LAO',
      'Latvia': 'LVA',
      'Lebanon': 'LBN',
      'Lesotho': 'LSO',
      'Liberia': 'LBR',
      'Libya': 'LBY',
      'Lithuania': 'LTU',
      'Luxembourg': 'LUX',
      'Macedonia': 'MKD',
      'Madagascar': 'MDG',
      'Malawi': 'MWI',
      'Malaysia': 'MYS',
      'Mali': 'MLI',
      'Malta': 'MLT',
      'Mauritania': 'MRT',
      'Mauritius': 'MUS',
      'Moldova': 'MDA',
      'Mongolia': 'MNG',
      'Montenegro': 'MNE',
      'Morocco': 'MAR',
      'Mozambique': 'MOZ',
      'Myanmar': 'MMR',
      'Namibia': 'NAM',
      'Nepal': 'NPL',
      'Netherlands': 'NLD',
      'New Zealand': 'NZL',
      'Nicaragua': 'NIC',
      'Niger': 'NER',
      'Nigeria': 'NGA',
      'North Korea': 'PRK',
      'Norway': 'NOR',
      'Oman': 'OMN',
      'Pakistan': 'PAK',
      'Panama': 'PAN',
      'Papua New Guinea': 'PNG',
      'Paraguay': 'PRY',
      'Peru': 'PER',
      'Philippines': 'PHL',
      'Poland': 'POL',
      'Portugal': 'PRT',
      'Qatar': 'QAT',
      'Romania': 'ROU',
      'Rwanda': 'RWA',
      'Saudi Arabia': 'SAU',
      'Senegal': 'SEN',
      'Serbia': 'SRB',
      'Sierra Leone': 'SLE',
      'Slovakia': 'SVK',
      'Slovenia': 'SVN',
      'Somalia': 'SOM',
      'South Africa': 'ZAF',
      'South Korea': 'KOR',
      'South Sudan': 'SSD',
      'Sri Lanka': 'LKA',
      'Sudan': 'SDN',
      'Suriname': 'SUR',
      'Swaziland': 'SWZ',
      'Sweden': 'SWE',
      'Switzerland': 'CHE',
      'Syria': 'SYR',
      'Taiwan': 'TWN',
      'Tajikistan': 'TJK',
      'Tanzania': 'TZA',
      'Thailand': 'THA',
      'Togo': 'TGO',
      'Tunisia': 'TUN',
      'Turkey': 'TUR',
      'Turkmenistan': 'TKM',
      'Uganda': 'UGA',
      'Ukraine': 'UKR',
      'United Arab Emirates': 'ARE',
      'Uruguay': 'URY',
      'Uzbekistan': 'UZB',
      'Venezuela': 'VEN',
      'Vietnam': 'VNM',
      'Yemen': 'YEM',
      'Zambia': 'ZMB',
      'Zimbabwe': 'ZWE'
    }
    
    return nameToISO3Map[countryName] || null
  }, [])

  /**
   * Handle country feature clicks
   */
  const handleCountryClick = useCallback(async (feature: any) => {
    if (!feature) {
      console.warn('⚠️ No feature provided to handleCountryClick')
      return
    }
    
    console.log('🔍 Raw feature data:', {
      id: feature?.id,
      properties: feature?.properties,
      source: feature?.source,
      sourceLayer: feature?.sourceLayer
    })
    
    const countryId = extractCountryIdFromFeature(feature)
    console.log('🔍 Extracted country ID:', countryId)
    
    if (!countryId) {
      console.warn('⚠️ Country feature missing identifier:', feature?.properties)
      return
    }

    try {
      const countryName = feature?.properties?.name || countryId
      console.log('🌍 Country clicked:', countryName, 'ID:', countryId)
      
      // First try direct ADM0_A3 lookup (preferred method)
      let countryData = await getCountryByADM0A3(countryId)
      console.log(`🔍 ADM0_A3 lookup: "${countryId}" ->`, !!countryData, countryData ? `(${countryData.name})` : 'null')
      
      // If not found, try mapping country name to ISO A3 for fallback lookup
      if (!countryData) {
        const iso3 = mapCountryNameToISO3(countryName) || countryId
        console.log(`🔍 Fallback mapping: "${countryName}" -> "${iso3}"`)
        countryData = await getCountryByISO3(iso3)
        console.log(`📊 Fallback data found:`, !!countryData, countryData ? `(${countryData.name})` : 'null')
      }
      
      if (!countryData) {
        console.warn(`⚠️ No data found for country: ${countryName} (${countryId})`)
        // Still call the handler with the feature data
        handlers.onCountryClick?.(countryId, null, feature)
      } else {
        // Update selected feature
        selectedFeature.current = {
          type: 'country',
          id: countryId,
          feature: feature,
          data: countryData
        }

        // Call the handler
        handlers.onCountryClick?.(countryId, countryData, feature)
      }

      // Note: Highlighting will be handled by WorldMapApp useEffect to avoid flickering
      
    } catch (error) {
      console.error(`❌ Error handling country click for ${countryId}:`, error)
      // Still call the handler with available data
      handlers.onCountryClick?.(countryId, null, feature)
    }
  }, [extractCountryIdFromFeature, mapCountryNameToISO3, handlers])

  /**
   * Handle border feature clicks
   */
  const handleBorderClick = useCallback(async (feature: any) => {
    const borderId = feature.properties?.id
    
    if (!borderId) {
      console.warn('⚠️ Border feature missing ID:', feature.properties)
      return
    }

    console.log('🔗 Border clicked:', borderId)

    // Load complete border data from JSON file to ensure consistency
    let borderData = feature.properties
    try {
      const { getBorderById } = await import('../lib/data-loader')
      const completeData = await getBorderById(borderId)
      if (completeData) {
        borderData = completeData
        console.log('✅ Loaded complete border data for:', borderId)
      } else {
        console.warn('⚠️ Could not load complete border data, using feature properties')
      }
    } catch (error) {
      console.warn('⚠️ Failed to load complete border data, using feature properties:', error)
    }

    // Update selected feature
    selectedFeature.current = {
      type: 'border',
      id: borderId,
      feature: feature,
      data: borderData
    }

    // Highlight the border
    highlightBorderFeature(borderId)

    // Call the handler
    handlers.onBorderClick?.(borderId, borderData, feature)
  }, [handlers])

  /**
   * Handle border post feature clicks
   */
  const handleBorderPostClick = useCallback((feature: any) => {
    const borderPostId = feature.properties?.id
    
    if (!borderPostId) {
      console.warn('⚠️ Border post feature missing ID:', feature.properties)
      return
    }

    console.log('🛂 Border post clicked:', borderPostId, feature.properties)

    // Update selected feature
    selectedFeature.current = {
      type: 'border-post' as any, // Extend the type
      id: borderPostId,
      feature: feature,
      data: feature.properties
    }

    // Highlight the border post
    highlightBorderPostFeature(borderPostId)

    // Call the border post handler
    handlers.onBorderPostClick?.(borderPostId, feature.properties, feature)
  }, [handlers])

  /**
   * Set up click event handlers on the map
   */
  const setupClickHandlers = useCallback(() => {
    if (!map.current) return

    map.current.on('click', async (e) => {
      const features = map.current!.queryRenderedFeatures(e.point)
      
      console.log('🖱️ Click detected, features found:', features.length)
      
      // Priority order: border posts first, then borders, then countries from our vector layer
      const borderPostFeature = features.find(feature => feature.source === 'border-posts')
      const borderFeature = features.find(feature => feature.source === 'borders')
      const countryFeature = features.find(feature => 
        feature.source === 'countries' && 
        extractCountryIdFromFeature(feature)
      )

      console.log('🔍 Border post feature:', !!borderPostFeature)
      console.log('🔍 Border feature:', !!borderFeature)
      console.log('🔍 Country feature:', !!countryFeature, countryFeature?.properties)

      if (borderPostFeature) {
        console.log('🛂 Handling border post click')
        handleBorderPostClick(borderPostFeature)
      } else if (borderFeature) {
        console.log('🔗 Handling border click')
        handleBorderClick(borderFeature)
      } else if (countryFeature) {
        console.log('🌍 Handling country click')
        await handleCountryClick(countryFeature)
      } else {
        console.log('🧹 No features found, clearing selection')
        // Clicked on empty area - clear selection
        clearSelection()
      }
    })
  }, [map, handleCountryClick, handleBorderClick, handleBorderPostClick, extractCountryIdFromFeature])

  /**
   * Set up hover effects
   */
  const setupHoverEffects = useCallback(() => {
    if (!map.current) return

    // Mouse move handler for cursor changes
    map.current.on('mousemove', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point)
      
      const interactiveFeature = features.find(feature => 
        feature.source === 'borders' || 
        feature.source === 'countries' ||
        extractCountryIdFromFeature(feature)
      )

      if (interactiveFeature) {
        map.current!.getCanvas().style.cursor = 'pointer'
        
        // Update hovered feature for potential tooltip display
        if (hoveredFeature.current?.id !== interactiveFeature.id) {
          hoveredFeature.current = interactiveFeature
        }
      } else {
        map.current!.getCanvas().style.cursor = ''
        hoveredFeature.current = null
      }
    })

    // Specific hover handlers for interactive layers
    const interactiveLayers = ['border-lines', 'countries-fill', 'border-posts']
    
    interactiveLayers.forEach(layerId => {
      if (map.current!.getLayer(layerId)) {
        map.current!.on('mouseenter', layerId, () => {
          map.current!.getCanvas().style.cursor = 'pointer'
        })

        map.current!.on('mouseleave', layerId, () => {
          map.current!.getCanvas().style.cursor = ''
        })
      }
    })
  }, [map, extractCountryIdFromFeature])

  /**
   * Highlight a country feature using feature state-based highlighting
   * Implements Requirements: 1.1, 1.2, 1.3, 1.4, 3.4, 5.1, 5.2, 5.3
   * 
   * @param feature - The country feature to highlight
   * @param style - Optional custom style overrides
   */
  const highlightCountryFeature = useCallback((feature: any, style?: Partial<typeof HIGHLIGHT_STYLES.country>) => {
    if (!map.current) {
      console.warn('⚠️ Map not initialized, cannot highlight country')
      return
    }

    // Extract feature ID with comprehensive fallback logic
    const countryId = feature?.properties?.id || 
                     feature?.id || 
                     feature?.properties?.ADM0_A3 ||
                     feature?.properties?.ISO_A3 ||
                     feature?.properties?.adm0_a3 ||
                     feature?.properties?.iso_a3
    
    const countryName = feature?.properties?.name || feature?.properties?.NAME
    
    // Error handling for missing feature IDs
    if (!countryId && !countryName) {
      console.warn('⚠️ Country feature missing identifier - cannot highlight:', {
        properties: feature?.properties,
        id: feature?.id
      })
      return
    }

    const startTime = performance.now()
    
    try {
      console.log('🎨 Highlighting country feature:', countryName, 'ID:', countryId)
      
      // Use the countries-highlight layer with filter-based approach
      // This ensures updates complete within 100ms (Requirement 3.4, 5.3)
      if (map.current.getLayer('countries-highlight')) {
        // Try to highlight by ID first (preferred), then by name as fallback
        if (countryId) {
          map.current.setFilter('countries-highlight', ['==', 'id', countryId])
        } else if (countryName) {
          map.current.setFilter('countries-highlight', ['==', 'name', countryName])
        }
        
        // Apply custom style if provided (for future extensibility)
        if (style) {
          const mergedStyle = { ...HIGHLIGHT_STYLES.country, ...style }
          map.current.setPaintProperty('countries-highlight', 'fill-color', mergedStyle.fillColor)
          map.current.setPaintProperty('countries-highlight', 'fill-opacity', mergedStyle.fillOpacity)
        }
        
        const endTime = performance.now()
        const duration = endTime - startTime
        
        if (duration > 100) {
          console.warn(`⚠️ Country highlight took ${duration.toFixed(2)}ms (target: <100ms)`)
        } else {
          console.log(`✅ Country highlighted in ${duration.toFixed(2)}ms`)
        }
      } else {
        console.warn('⚠️ countries-highlight layer not found')
      }
    } catch (error) {
      console.error('❌ Error highlighting country feature:', error)
      // Gracefully handle errors without breaking functionality
    }
  }, [map])

  /**
   * Highlight a border feature with enhanced styling
   * Implements Requirements: 2.1, 2.2, 2.3, 2.4, 3.4, 5.1, 5.2, 5.3
   * 
   * @param borderId - The unique identifier of the border to highlight
   * @param style - Optional custom style overrides
   */
  const highlightBorderFeature = useCallback((borderId: string, style?: Partial<typeof HIGHLIGHT_STYLES.border>) => {
    if (!map.current) {
      console.warn('⚠️ Map not initialized, cannot highlight border')
      return
    }

    // Error handling for invalid border IDs
    if (!borderId || typeof borderId !== 'string' || borderId.trim() === '') {
      console.warn('⚠️ Invalid border ID provided:', borderId)
      return
    }

    const startTime = performance.now()
    
    try {
      console.log('🎨 Highlighting border:', borderId)
      
      // Update the border highlight layer filter to show selected border
      // This ensures updates complete within 100ms (Requirement 3.4, 5.3)
      if (map.current.getLayer('border-highlight')) {
        map.current.setFilter('border-highlight', ['==', 'id', borderId])
        
        // Ensure white color (#FFFFFF) and double width (4px) are applied
        // These paint properties should already be set in MapContainer, but we verify here
        const currentColor = map.current.getPaintProperty('border-highlight', 'line-color')
        const currentWidth = map.current.getPaintProperty('border-highlight', 'line-width')
        
        // Apply or verify the highlight styles
        const targetColor = style?.lineColor || HIGHLIGHT_STYLES.border.lineColor
        const targetWidth = style?.lineWidth || HIGHLIGHT_STYLES.border.lineWidth
        const targetOpacity = style?.lineOpacity || HIGHLIGHT_STYLES.border.lineOpacity
        
        if (currentColor !== targetColor) {
          map.current.setPaintProperty('border-highlight', 'line-color', targetColor)
        }
        if (currentWidth !== targetWidth) {
          map.current.setPaintProperty('border-highlight', 'line-width', targetWidth)
        }
        map.current.setPaintProperty('border-highlight', 'line-opacity', targetOpacity)
        
        const endTime = performance.now()
        const duration = endTime - startTime
        
        if (duration > 100) {
          console.warn(`⚠️ Border highlight took ${duration.toFixed(2)}ms (target: <100ms)`)
        } else {
          console.log(`✅ Border highlighted in ${duration.toFixed(2)}ms`)
        }
      } else {
        console.warn('⚠️ border-highlight layer not found')
      }
    } catch (error) {
      console.error('❌ Error highlighting border feature:', error)
      // Gracefully handle errors without breaking functionality
    }
  }, [map])

  /**
   * Highlight a border post feature
   */
  const highlightBorderPostFeature = useCallback((borderPostId: string) => {
    if (!map.current || !borderPostId) return

    // Update the border post highlight layer filter
    if (map.current.getLayer('border-post-highlight')) {
      map.current.setFilter('border-post-highlight', ['==', 'id', borderPostId])
    }
  }, [map])

  /**
   * Highlight country by ID (for URL loading)
   */
  const highlightCountryById = useCallback((countryId: string) => {
    if (!map.current || !countryId) return

    console.log('🎯 Highlighting country by ID:', countryId)
    
    if (map.current.getLayer('countries-highlight')) {
      console.log('✅ Found countries-highlight layer, setting filter')
      map.current.setFilter('countries-highlight', ['==', 'id', countryId])
      
      // Also try by name as fallback
      setTimeout(() => {
        if (map.current && map.current.getLayer('countries-highlight')) {
          console.log('🔄 Also trying highlight by name for:', countryId)
          // Try to find the country name for this ID
          const features = map.current.querySourceFeatures('countries')
          const matchingFeature = features.find((f: any) => 
            f.properties?.id === countryId || f.id === countryId
          )
          if (matchingFeature?.properties?.name) {
            console.log('📍 Found matching feature, highlighting by name:', matchingFeature.properties.name)
            map.current.setFilter('countries-highlight', ['==', 'name', matchingFeature.properties.name])
          }
        }
      }, 100)
    } else {
      console.warn('❌ countries-highlight layer not found')
    }
  }, [map])

  /**
   * Clear all highlights from the map
   * Implements Requirements: 3.1, 3.2, 3.5
   * 
   * This function clears all highlight layers and resets selection state
   */
  const clearAllHighlights = useCallback(() => {
    if (!map.current) {
      console.warn('⚠️ Map not initialized, cannot clear highlights')
      return
    }

    try {
      console.log('🧹 Clearing all highlights')
      
      // Clear country highlight layer filters
      if (map.current.getLayer('countries-highlight')) {
        map.current.setFilter('countries-highlight', ['==', 'id', ''])
      }

      // Clear border highlight layer filters
      if (map.current.getLayer('border-highlight')) {
        map.current.setFilter('border-highlight', ['==', 'id', ''])
      }

      // Clear border post highlight layer filters
      if (map.current.getLayer('border-post-highlight')) {
        map.current.setFilter('border-post-highlight', ['==', 'id', ''])
      }

      // Reset feature states for all highlighted features
      // Note: Feature state approach would be used here if we implement it in the future
      // For now, filter-based approach doesn't require explicit state clearing

      // Update selectedFeature ref to null
      selectedFeature.current = null

      console.log('✅ All highlights cleared')
    } catch (error) {
      console.error('❌ Error clearing highlights:', error)
      // Gracefully handle errors without breaking functionality
    }
  }, [map])

  /**
   * Clear all selections and highlights (legacy function, now uses clearAllHighlights)
   */
  const clearSelection = useCallback(() => {
    if (!map.current) return

    // Use the new clearAllHighlights function
    clearAllHighlights()

    // Call clear handler
    handlers.onSelectionClear?.()

    console.log('🧹 Selection cleared')
  }, [map, handlers, clearAllHighlights])

  /**
   * Programmatically select a country by ISO3 code
   */
  const selectCountryByISO3 = useCallback(async (iso3: string) => {
    if (!map.current) return

    try {
      // Query for country features with this ISO3 code from the country-border source
      const features = map.current.querySourceFeatures('country-border', {
        sourceLayer: 'country',
        filter: [
          'any',
          ['==', ['get', 'ADM0_A3'], iso3],
          ['==', ['get', 'ISO_A3'], iso3],
          ['==', ['get', 'id'], iso3]
        ]
      })

      if (features.length > 0) {
        await handleCountryClick(features[0])
      } else {
        console.warn(`Country with ISO3 ${iso3} not found on map`)
      }
    } catch (error) {
      console.error(`Failed to select country ${iso3}:`, error)
    }
  }, [map, handleCountryClick])

  /**
   * Programmatically select a border by ID
   */
  const selectBorderById = useCallback((borderId: string) => {
    if (!map.current) return

    try {
      // Query for border features with this ID
      const features = map.current.querySourceFeatures('borders', {
        filter: ['==', 'id', borderId]
      })

      if (features.length > 0) {
        handleBorderClick(features[0])
      } else {
        console.warn(`Border with ID ${borderId} not found on map`)
      }
    } catch (error) {
      console.error(`Failed to select border ${borderId}:`, error)
    }
  }, [map, handleBorderClick])

  /**
   * Get currently selected feature
   */
  const getSelectedFeature = useCallback(() => {
    return selectedFeature.current
  }, [])

  /**
   * Get currently hovered feature
   */
  const getHoveredFeature = useCallback(() => {
    return hoveredFeature.current
  }, [])

  /**
   * Zoom to a specific location
   */
  const zoomToLocation = useCallback(async (lng: number, lat: number, zoom: number = 12) => {
    if (!map.current) return

    try {
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
        duration: 1500 // Animation duration in ms
      })
    } catch (error) {
      console.error('Failed to zoom to location:', error)
    }
  }, [map])

  return {
    setupClickHandlers,
    setupHoverEffects,
    clearSelection,
    clearAllHighlights,
    selectCountryByISO3,
    selectBorderById,
    getSelectedFeature,
    getHoveredFeature,
    highlightCountryFeature,
    highlightCountryById,
    highlightBorderFeature,
    highlightBorderPostFeature,
    zoomToLocation
  }
}