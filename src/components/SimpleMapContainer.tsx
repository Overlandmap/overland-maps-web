'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import 'maplibre-gl/dist/maplibre-gl.css'

import { useLanguage } from '../contexts/LanguageContext'
import { useColorScheme } from '../contexts/ColorSchemeContext'
import { getTranslatedLabel, getTranslatedMonths } from '../lib/i18n'
import { COLOR_SCHEMES } from '../lib/color-expressions'
import LegendExplanationPopup from './LegendExplanationPopup'
import ColorSchemeHelpPopup from './ColorSchemeHelpPopup'
import AppStoreButtons from './AppStoreButtons'

/**
 * Get the border post layer configuration
 * This ensures consistent styling across all instances of the border_post layer
 */
function getBorderPostLayerConfig(): maplibregl.LayerSpecification {
  return {
    id: 'border_post',
    type: 'circle',
    source: 'country-border',
    'source-layer': 'border_post',
    minzoom: 3,
    paint: {
      'circle-color': [
        'case',
        ['==', ['get', 'is_open'], 1], '#3b82f6',  // Bilateral - blue
        ['==', ['get', 'is_open'], 2], '#22c55e',  // Open - green
        ['==', ['get', 'is_open'], 3], '#eab308',  // Restrictions - yellow
        '#ef4444'  // Closed (0) or null - red (default)
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        3, 0,
        4, 4,
        6, 6,
        8, 8,
        22, 8
      ],
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff'
    }
  } as maplibregl.LayerSpecification
}

/**
 * Get the border post highlight layer configuration
 * This ensures consistent styling across all instances of the border-post-highlight layer
 */
function getBorderPostHighlightLayerConfig(): maplibregl.LayerSpecification {
  return {
    id: 'border-post-highlight',
    type: 'circle',
    source: 'country-border',
    'source-layer': 'border_post',
    minzoom: 4,
    paint: {
      'circle-color': '#ffffff',
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        4, 6,
        6, 8,
        8, 10,
        22, 10
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#1e40af'
    },
    filter: ['==', ['get', 'id'], ''] // Initially show nothing
  } as maplibregl.LayerSpecification
}

type ColorScheme = 'overlanding' | 'carnet' | 'climate' | 'itineraries'

interface SimpleMapContainerProps {
  className?: string
  onCountryClick?: (iso3: string, countryData: any, feature: any) => void
  onBorderClick?: (borderId: string, borderData: any, feature: any) => void
  onBorderPostClick?: (borderPostId: string, borderPostData: any, feature: any) => void
  onZoneClick?: (zoneId: string, zoneData: any, feature: any) => void
  onItineraryClick?: (itineraryId: string, itineraryData: any, feature: any) => void
  onSelectionClear?: () => void
  onMapReady?: (interactions: any) => void
  // Selection props for URL-driven highlighting
  selectedCountryId?: string | null
  selectedBorderId?: string | null
  selectedBorderPostId?: string | null
  selectedZoneId?: string | null
  selectedItineraryId?: string | null
}

export default function SimpleMapContainer({
  className = "map-container",
  onCountryClick,
  onBorderClick,
  onBorderPostClick,
  onZoneClick,
  onItineraryClick,
  onSelectionClear,
  onMapReady,
  selectedCountryId,
  selectedBorderId,
  selectedBorderPostId,
  selectedZoneId,
  selectedItineraryId
}: SimpleMapContainerProps) {
  const { language } = useLanguage()
  const { colorScheme, setColorScheme } = useColorScheme()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBorderPosts, setShowBorderPosts] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<number>(0) // 0 = January, 11 = December
  const [climateDataType, setClimateDataType] = useState<'temperature' | 'precipitation'>('temperature')
  const [showLegend, setShowLegend] = useState(false) // Will be set based on screen size
  const [showColorSchemeHelp, setShowColorSchemeHelp] = useState(false)
  const [explanationPopup, setExplanationPopup] = useState<{
    isOpen: boolean
    category: 'overlanding' | 'carnet' | 'borders' | 'border_posts' | 'zones' | null
  }>({
    isOpen: false,
    category: null
  })

  // Store selected country ID in a ref for paint property updates
  const selectedCountryIdRef = useRef<string | null>(null)
  // Store selected zone ID in a ref for pattern updates
  const selectedZoneIdRef = useRef<string | null>(null)
  // Store selected itinerary ID in a ref for highlight updates
  const selectedItineraryIdRef = useRef<string | null>(null)
  // Store updateMapColors ref to avoid circular dependencies
  const updateMapColorsRef = useRef<((scheme: ColorScheme) => void) | null>(null)
  // Track previous language to detect changes
  const previousLanguageRef = useRef<string>(language)
  // Track if initial colors have been applied
  const initialColorsAppliedRef = useRef<boolean>(false)
  // Track if initial legend visibility has been set
  const initialLegendSetRef = useRef<boolean>(false)

  // Handle legend group click to show explanation
  const handleLegendGroupClick = (category: 'overlanding' | 'carnet' | 'borders' | 'border_posts' | 'zones') => {
    setExplanationPopup({
      isOpen: true,
      category
    })
  }

  // Close explanation popup
  const closeExplanationPopup = () => {
    setExplanationPopup({
      isOpen: false,
      category: null
    })
  }

  // Calculate bounds for itinerary geometry
  const calculateItineraryBounds = useCallback((geometry: any): [[number, number], [number, number]] | null => {
    if (!geometry || !geometry.coordinates) return null
    
    let minLng = Infinity, maxLng = -Infinity
    let minLat = Infinity, maxLat = -Infinity
    
    const processCoordinate = (coord: number[]) => {
      if (!Array.isArray(coord) || coord.length < 2) return false
      const [lng, lat] = coord
      if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) return false
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
      return true
    }
    
    try {
      let validCoordinatesFound = false
      
      // Handle different geometry types
      if (geometry.type === 'Point') {
        validCoordinatesFound = processCoordinate(geometry.coordinates)
      } else if (geometry.type === 'LineString') {
        if (Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
          let validCoordsInLine = 0
          for (const coord of geometry.coordinates) {
            if (processCoordinate(coord)) {
              validCoordsInLine++
              validCoordinatesFound = true
            }
          }
          // LineString needs at least 2 valid coordinates
          if (validCoordsInLine < 2) {
            return null
          }
        } else {
          return null // Invalid LineString structure
        }
      } else if (geometry.type === 'MultiLineString') {
        if (Array.isArray(geometry.coordinates)) {
          for (const line of geometry.coordinates) {
            if (Array.isArray(line) && line.length >= 2) {
              let validCoordsInLine = 0
              for (const coord of line) {
                if (processCoordinate(coord)) {
                  validCoordsInLine++
                  validCoordinatesFound = true
                }
              }
              // Each line in MultiLineString needs at least 2 valid coordinates
              if (validCoordsInLine < 2) {
                return null
              }
            } else {
              return null // Invalid line structure in MultiLineString
            }
          }
        } else {
          return null // Invalid MultiLineString structure
        }
      } else {
        return null // Unsupported geometry type
      }
      
      // Check if we got valid bounds
      if (!validCoordinatesFound || minLng === Infinity || maxLng === -Infinity || minLat === Infinity || maxLat === -Infinity) {
        return null
      }
      
      // Add padding (10% of the bounds, minimum 0.01 degrees)
      const lngPadding = Math.max((maxLng - minLng) * 0.1, 0.01)
      const latPadding = Math.max((maxLat - minLat) * 0.1, 0.01)
      
      return [
        [minLng - lngPadding, minLat - latPadding],
        [maxLng + lngPadding, maxLat + latPadding]
      ]
    } catch (error) {
      console.error('❌ Error calculating itinerary bounds:', error)
      return null
    }
  }, [])

  // Fit map to bounds
  const fitBounds = useCallback((bounds: [[number, number], [number, number]]) => {
    if (!map.current) {
      console.warn('⚠️ Cannot fit bounds: map not available')
      return
    }
    
    try {
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1500
      })
    } catch (error) {
      console.error('❌ Error fitting bounds:', error)
    }
  }, [])

  // Clear all highlights function
  const clearAllHighlights = useCallback(() => {
    if (!map.current) {
      console.warn('⚠️ Cannot clear highlights: map not available')
      return
    }

    try {
      // Clear stored references
      selectedCountryIdRef.current = null
      selectedZoneIdRef.current = null
      selectedItineraryIdRef.current = null
      
      // Clear border highlights
      if (map.current.getLayer('border-highlight')) {
        try {
          map.current.setFilter('border-highlight', ['==', ['get', 'id'], ''])
        } catch (error) {
          console.error('❌ Failed to clear border highlight filter:', error)
        }
      }
      
      // Clear border post highlights
      if (map.current.getLayer('border-post-highlight')) {
        try {
          map.current.setFilter('border-post-highlight', ['==', ['get', 'id'], ''])
        } catch (error) {
          console.error('❌ Failed to clear border post highlight filter:', error)
        }
      }
      
      // Clear zone highlights
      if (map.current.getLayer('zone-highlight')) {
        try {
          map.current.setFilter('zone-highlight', ['==', ['get', 'id'], ''])
          // Reset zone highlight paint properties to default
          map.current.setPaintProperty('zone-highlight', 'fill-color', '#ffffff')
          map.current.setPaintProperty('zone-highlight', 'fill-opacity', 0.5)
        } catch (error) {
          console.error('❌ Failed to clear zone highlight:', error)
        }
      }
      
      // Clear itinerary highlights
      if (map.current.getLayer('itinerary-highlight')) {
        try {
          // Clear the filter first
          map.current.setFilter('itinerary-highlight', ['==', ['get', 'itineraryDocId'], ''])

          
          // Reset itinerary highlight paint properties to default state
          try {
            map.current.setPaintProperty('itinerary-highlight', 'line-color', '#ffffff')
            map.current.setPaintProperty('itinerary-highlight', 'line-width', 6)
            map.current.setPaintProperty('itinerary-highlight', 'line-opacity', 1.0)

          } catch (paintError) {
            console.error('❌ Failed to reset itinerary highlight paint properties:', paintError)
            // Continue execution even if paint property reset fails
          }
        } catch (error) {
          console.error('❌ Failed to clear itinerary highlight:', error)
          console.error('❌ Clear error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            layerExists: !!map.current.getLayer('itinerary-highlight'),
            mapAvailable: !!map.current
          })
        }
      } else {
        console.warn('⚠️ Itinerary highlight layer not found during clear operation')
      }
      
      // Reset country colors to base (no selection)
      if (updateMapColorsRef.current) {
        try {
          updateMapColorsRef.current(colorScheme)
        } catch (error) {
          console.error('❌ Failed to reset country colors:', error)
        }
      }
      

    } catch (error) {
      console.error('❌ Unexpected error while clearing highlights:', error)
    }
  }, [colorScheme])

  // Highlighting functions
  const highlightBorder = useCallback((borderId: string) => {
    if (!map.current) {
      console.warn('⚠️ Cannot highlight border: map not available')
      return
    }

    if (!borderId) {
      console.warn('⚠️ Cannot highlight border: invalid border ID provided')
      return
    }

    console.log('🎯 Highlighting border:', borderId)
    
    try {
      // Clear all other highlights first
      clearAllHighlights()
      
      // Check if border-highlight layer exists
      if (!map.current.getLayer('border-highlight')) {
        console.warn('⚠️ Border highlight layer not found, cannot highlight border:', borderId)
        return
      }
      
      // Apply highlight filter
      map.current.setFilter('border-highlight', ['==', ['get', 'id'], borderId])
      

    } catch (error) {
      console.error('❌ Failed to highlight border:', borderId, error)
    }
  }, [clearAllHighlights])

  const highlightCountry = useCallback((countryId: string) => {
    if (!map.current) {
      console.warn('⚠️ Cannot highlight country: map not available')
      return
    }

    if (!countryId) {
      console.warn('⚠️ Cannot highlight country: invalid country ID provided')
      return
    }

    console.log('🎯 Highlighting country:', countryId)
    
    try {
      // Clear all other highlights first (but not country colors)
      if (map.current.getLayer('border-highlight')) {
        try {
          map.current.setFilter('border-highlight', ['==', ['get', 'id'], ''])
        } catch (error) {
          console.error('❌ Failed to clear border highlight for country selection:', error)
        }
      }
      
      if (map.current.getLayer('border-post-highlight')) {
        try {
          map.current.setFilter('border-post-highlight', ['==', ['get', 'id'], ''])
        } catch (error) {
          console.error('❌ Failed to clear border post highlight for country selection:', error)
        }
      }
      
      // Store the selected country ID and update colors
      selectedCountryIdRef.current = countryId
      
      // Update colors using the ref
      if (updateMapColorsRef.current) {
        try {
          updateMapColorsRef.current(colorScheme)

        } catch (error) {
          console.error('❌ Failed to update country colors:', error)
          // Clear the stored ID if color update failed
          selectedCountryIdRef.current = null
        }
      } else {
        console.warn('⚠️ updateMapColors function not available')
      }
    } catch (error) {
      console.error('❌ Failed to highlight country:', countryId, error)
      // Clear the stored ID if highlighting failed
      selectedCountryIdRef.current = null
    }
  }, [colorScheme])

  const highlightBorderPost = useCallback((borderPostId: string) => {
    if (!map.current) {
      console.warn('⚠️ Cannot highlight border post: map not available')
      return
    }

    if (!borderPostId) {
      console.warn('⚠️ Cannot highlight border post: invalid border post ID provided')
      return
    }

    console.log('🎯 Highlighting border post:', borderPostId)
    
    try {
      // Clear all other highlights first
      clearAllHighlights()
      
      // Check if border-post-highlight layer exists
      if (!map.current.getLayer('border-post-highlight')) {
        console.warn('⚠️ Border post highlight layer not found, cannot highlight border post:', borderPostId)
        return
      }
      
      // Apply highlight filter
      map.current.setFilter('border-post-highlight', ['==', ['get', 'id'], borderPostId])
      

    } catch (error) {
      console.error('❌ Failed to highlight border post:', borderPostId, error)
    }
  }, [clearAllHighlights])

  const highlightZone = useCallback((zoneId: string) => {
    if (!map.current) {
      console.warn('⚠️ Cannot highlight zone: map not available')
      return
    }

    if (!zoneId) {
      console.warn('⚠️ Cannot highlight zone: invalid zone ID provided')
      return
    }

    console.log('🎯 Highlighting zone:', zoneId)
    
    try {
      // Clear all other highlights first
      clearAllHighlights()
      
      // Store the selected zone ID
      selectedZoneIdRef.current = zoneId
      
      // Check if zone-highlight layer exists
      if (!map.current.getLayer('zone-highlight')) {
        console.warn('⚠️ Zone highlight layer not found, cannot highlight zone:', zoneId)
        return
      }
      
      // Apply highlight filter
      map.current.setFilter('zone-highlight', ['==', ['get', 'id'], zoneId])
      
      // Make the highlight more visible by updating paint properties
      try {
        map.current.setPaintProperty('zone-highlight', 'fill-color', '#ffffff')
        map.current.setPaintProperty('zone-highlight', 'fill-opacity', 0.5)
      } catch (error) {
        console.error('❌ Failed to update zone highlight paint properties:', error)
      }
      

    } catch (error) {
      console.error('❌ Failed to highlight zone:', zoneId, error)
      // Clear the stored ID if highlighting failed
      selectedZoneIdRef.current = null
    }
  }, [clearAllHighlights])

  const highlightItinerary = useCallback((itineraryId: string) => {
    if (!map.current) {
      console.warn('⚠️ Cannot highlight itinerary: map not available')
      return
    }

    if (!itineraryId || typeof itineraryId !== 'string' || itineraryId.trim() === '') {
      console.warn('⚠️ Cannot highlight itinerary: invalid itinerary ID provided:', itineraryId)
      return
    }

    console.log('🎯 Highlighting itinerary:', itineraryId)
    
    try {
      // Clear all other highlights first
      clearAllHighlights()
      
      // Store the selected itinerary ID
      selectedItineraryIdRef.current = itineraryId
      
      // Check if itinerary-highlight layer exists
      if (!map.current.getLayer('itinerary-highlight')) {
        console.warn('⚠️ Itinerary highlight layer not found, cannot highlight itinerary:', itineraryId)
        

        
        selectedItineraryIdRef.current = null
        return
      }

      // Check if source exists
      if (!map.current.getSource('country-border')) {
        console.warn('⚠️ Country-border source not found, cannot highlight itinerary:', itineraryId)
        selectedItineraryIdRef.current = null
        return
      }

      // Check if itinerary source layer exists and has data
      try {
        const itineraryFeatures = map.current.querySourceFeatures('country-border', {
          sourceLayer: 'itinerary',
          filter: ['==', ['get', 'itineraryDocId'], itineraryId]
        })

        if (itineraryFeatures.length === 0) {
          console.warn('⚠️ No itinerary found with ID:', itineraryId)
          console.warn('⚠️ This may indicate the itinerary data is not loaded or the ID is incorrect')
          // Still apply the filter to maintain consistent state
        }
      } catch (queryError) {
        console.error('❌ Failed to query itinerary features:', queryError)
        console.warn('⚠️ Proceeding with highlight attempt despite query failure')
      }
      
      // Apply highlight filter with enhanced error handling
      try {
        map.current.setFilter('itinerary-highlight', ['==', ['get', 'itineraryDocId'], itineraryId])

      } catch (filterError) {
        console.error('❌ Failed to set itinerary highlight filter:', filterError)
        selectedItineraryIdRef.current = null
        throw filterError
      }

      // Verify highlight paint properties are correct
      try {
        const currentColor = map.current.getPaintProperty('itinerary-highlight', 'line-color')
        const currentWidth = map.current.getPaintProperty('itinerary-highlight', 'line-width')
        const currentOpacity = map.current.getPaintProperty('itinerary-highlight', 'line-opacity')
        

      } catch (paintError) {
        console.warn('⚠️ Could not verify itinerary highlight paint properties:', paintError)
        // This is not critical, so we don't fail the highlighting
      }
      

    } catch (error) {
      console.error('❌ Failed to highlight itinerary:', itineraryId, error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        itineraryId,
        mapAvailable: !!map.current,
        layerExists: map.current ? !!map.current.getLayer('itinerary-highlight') : false,
        sourceExists: map.current ? !!map.current.getSource('country-border') : false
      })
      
      // Graceful degradation - clear the stored ID if highlighting failed
      selectedItineraryIdRef.current = null
      
      // Don't re-throw the error to ensure graceful degradation
    }
  }, [clearAllHighlights])

  // Legacy function for backward compatibility
  const clearHighlights = clearAllHighlights

  // Zoom to location function
  const zoomToLocation = useCallback((lng: number, lat: number, zoom: number = 12) => {
    if (!map.current) {
      console.warn('⚠️ Map not available for zoom')
      return
    }

    try {
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
        duration: 1500 // Animation duration in ms
      })

    } catch (error) {
      console.error('Failed to zoom to location:', error)
    }
  }, [])

  // Handle map clicks
  const handleMapClick = useCallback((e: maplibregl.MapMouseEvent) => {
    if (!map.current) return

    const features = map.current.queryRenderedFeatures(e.point)

    // Look for border post features FIRST (highest priority - smallest targets)
    // Try GeoJSON source first (has complete data including translations)
    let borderPostFeature = features.find(f => f.source === 'border-posts')
    // Fallback to vector tile source if GeoJSON not found
    if (!borderPostFeature) {
      borderPostFeature = features.find(f => f.source === 'country-border' && f.sourceLayer === 'border_post')
    }
    
    if (borderPostFeature) {
      console.log('📍 Border post clicked:', borderPostFeature.properties)
      console.log('📍 Border post source:', borderPostFeature.source, borderPostFeature.sourceLayer)
      const borderPostId = borderPostFeature.properties?.id
      if (borderPostId) {
        highlightBorderPost(borderPostId) // Highlight the clicked border post (white circle)
        if (onBorderPostClick) {

          onBorderPostClick(borderPostId, null, borderPostFeature)
        }
      }
      return
    }

    // Look for zone features SECOND (high priority - restricted areas)
    const zoneFeature = features.find(f => f.source === 'country-border' && f.sourceLayer === 'zones')
    if (zoneFeature) {
      const zoneId = zoneFeature.properties?.id
      if (zoneId) {
        highlightZone(zoneId) // Highlight the clicked zone immediately
        if (onZoneClick) {
          onZoneClick(zoneId, null, zoneFeature)
        }
      }
      return
    }

    // Look for itinerary features THIRD (high priority - travel routes)
    const itineraryFeature = features.find(f => f.source === 'country-border' && f.sourceLayer === 'itinerary')
    if (itineraryFeature) {
      try {
        // Use the Firestore document ID (stored in 'itineraryDocId' property)
        // The 'itineraryDocId' property contains the Firestore document ID like "0ANgc4146W8cMQqwfaB0"
        // The 'itineraryId' property contains the human-readable ID like "G6"
        const itineraryDocId = itineraryFeature.properties?.itineraryDocId
        
        if (itineraryDocId && typeof itineraryDocId === 'string' && itineraryDocId.trim() !== '') {

          
          // Clear all other highlights first
          try {
            clearAllHighlights()
          } catch (clearError) {
            console.error('❌ Failed to clear highlights before itinerary click:', clearError)
            // Continue with click handling even if clear fails
          }
          
          if (onItineraryClick && typeof onItineraryClick === 'function') {
            try {
              onItineraryClick(itineraryDocId, null, itineraryFeature)
            } catch (callbackError) {
              console.error('❌ Error in onItineraryClick callback:', callbackError)
            }
          } else {
            console.warn('⚠️ onItineraryClick callback not available or not a function')
          }
        } else {
          console.warn('⚠️ Itinerary feature missing or invalid document ID:', {
            itineraryDocId,
            properties: itineraryFeature.properties,
            hasProperties: !!itineraryFeature.properties
          })
        }
      } catch (error) {
        console.error('❌ Error handling itinerary click:', error)
        console.error('❌ Itinerary click error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          feature: itineraryFeature,
          properties: itineraryFeature?.properties,
          mapAvailable: !!map.current
        })
      }
      return
    }

    // Look for border features FOURTH (medium priority)
    const borderFeature = features.find(f => f.source === 'country-border' && f.sourceLayer === 'border')
    if (borderFeature) {
      console.log('🚧 Border clicked:', borderFeature.properties)
      const borderId = borderFeature.properties?.id
      if (borderId) {
        highlightBorder(borderId) // Highlight the clicked border (white, wider line)
        if (onBorderClick) {

          onBorderClick(borderId, null, borderFeature)
        }
      }
      return
    }

    // Look for country features LAST (lowest priority - largest targets)
    const countryFeature = features.find(f => f.source === 'country-border' && f.sourceLayer === 'country')
    if (countryFeature) {
      console.log('🏛️ Country clicked:', countryFeature.properties)
      const countryId = countryFeature.properties?.ADM0_A3 || countryFeature.properties?.ISO_A3 || countryFeature.properties?.id
      if (countryId) {
        highlightCountry(countryId) // Highlight the clicked country (darker blue fill)
        if (onCountryClick) {

          onCountryClick(countryId, null, countryFeature)
        }
      }
      return
    }

    // Clear selection if clicking on empty area
    clearAllHighlights()
    if (onSelectionClear) {
      onSelectionClear()
    }
  }, [onCountryClick, onBorderClick, onBorderPostClick, onZoneClick, onItineraryClick, onSelectionClear, highlightBorder, highlightCountry, highlightBorderPost, clearAllHighlights])


  // Helper function to create darker color expressions for highlights
  const darkenColor = (color: string): string => {
    // Convert hex to RGB, darken by 30%, convert back to hex
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    const darkenedR = Math.floor(r * 0.7)
    const darkenedG = Math.floor(g * 0.7)
    const darkenedB = Math.floor(b * 0.7)

    return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`
  }

  // Generate color expression for overlanding scheme
  const generateOverlandingColorExpression = useCallback(() => {
    const overlandingColors = COLOR_SCHEMES.overlanding.colors
    return [
      'case',
      // Handle overlanding value 0 (Forbidden) - black
      ['any',
        ['==', ['get', 'overlanding'], 0],
        ['==', ['get', 'overlanding'], '0']
      ], overlandingColors[0].color,
      // Handle overlanding value 1 (Unsafe) - red
      ['any',
        ['==', ['get', 'overlanding'], 1],
        ['==', ['get', 'overlanding'], '1']
      ], overlandingColors[1].color,
      // Handle overlanding value 2 (Restrictions Apply) - yellow
      ['any',
        ['==', ['get', 'overlanding'], 2],
        ['==', ['get', 'overlanding'], '2']
      ], overlandingColors[2].color,
      // Handle overlanding value 3 (Open) - green
      ['any',
        ['==', ['get', 'overlanding'], 3],
        ['==', ['get', 'overlanding'], '3']
      ], overlandingColors[3].color,
      // Fallback to default (Unknown)
      overlandingColors.default.color
    ]
  }, [])

  // Generate color expression for carnet scheme
  const generateCarnetColorExpression = useCallback(() => {
    const carnetColors = COLOR_SCHEMES.carnet.colors
    return [
      'case',
      // Handle carnet value -1 (Access Forbidden) - black
      ['any',
        ['==', ['get', 'carnet'], -1],
        ['==', ['get', 'carnet'], '-1']
      ], carnetColors[3].color,
      // Handle null, 0, or missing carnet field - gray (no carnet required)
      ['any',
        ['==', ['get', 'carnet'], null],
        ['==', ['get', 'carnet'], 0],
        ['==', ['get', 'carnet'], '0'],
        ['!', ['has', 'carnet']]
      ], carnetColors[0].color,
      // Handle carnet value 1 (Required in Some Situations) - light pink
      ['any',
        ['==', ['get', 'carnet'], 1],
        ['==', ['get', 'carnet'], '1']
      ], carnetColors[1].color,
      // Handle carnet value 2 (Mandatory) - dark pink
      ['any',
        ['==', ['get', 'carnet'], 2],
        ['==', ['get', 'carnet'], '2']
      ], carnetColors[2].color,
      // Fallback to default (no carnet required - gray)
      carnetColors.default.color
    ]
  }, [])

  // Generate darker version of color expression for highlights
  const generateDarkerColorExpression = useCallback((scheme: ColorScheme) => {
    const baseExpression = scheme === 'overlanding'
      ? generateOverlandingColorExpression()
      : generateCarnetColorExpression()

    // Create a darker version by applying darken function to each color
    const darkerExpression = [...baseExpression]
    for (let i = 0; i < darkerExpression.length; i++) {
      const item = darkerExpression[i]
      if (typeof item === 'string' && item.startsWith('#')) {
        darkerExpression[i] = darkenColor(item)
      }
    }
    return darkerExpression
  }, [generateOverlandingColorExpression, generateCarnetColorExpression])

  // Update map colors based on selected color scheme
  const updateMapColors = useCallback((scheme: ColorScheme) => {
    if (!map.current) {
      console.warn('⚠️ Map not available for color update')
      return
    }

    // Only update colors for overlanding and carnet modes
    if (scheme === 'climate' || scheme === 'itineraries') {

      return
    }

    if (!map.current.getLayer('country')) {
      console.warn('⚠️ Country layer not found for color update, scheme:', scheme)
      return
    }

    try {
      const baseColorExpression = scheme === 'overlanding'
        ? generateOverlandingColorExpression()
        : generateCarnetColorExpression()

      // If a country is selected, create a conditional expression
      if (selectedCountryIdRef.current) {
        try {
          const darkerColorExpression = generateDarkerColorExpression(scheme)
          const conditionalColorExpression = [
            'case',
              ['==', ['get', 'ADM0_A3'], selectedCountryIdRef.current],
            darkerColorExpression,
            baseColorExpression
          ]
          
          map.current.setPaintProperty('country', 'fill-color', conditionalColorExpression as any)
          map.current.setPaintProperty('country', 'fill-opacity', 0.6)
          

        } catch (error) {
          console.error('❌ Failed to apply country selection colors, falling back to base colors:', error)
          // Fallback to base colors if selection highlighting fails
          map.current.setPaintProperty('country', 'fill-color', baseColorExpression as any)
          map.current.setPaintProperty('country', 'fill-opacity', 0.6)
        }
      } else {
        // No selection, use base colors
        try {
          map.current.setPaintProperty('country', 'fill-color', baseColorExpression as any)
          map.current.setPaintProperty('country', 'fill-opacity', 0.6)
          

        } catch (error) {
          console.error('❌ Failed to apply base colors for scheme:', scheme, error)
        }
      }
    } catch (error) {
      console.error('❌ Failed to update map colors for scheme:', scheme, error)
    }
  }, [generateOverlandingColorExpression, generateCarnetColorExpression, generateDarkerColorExpression])

  // Store updateMapColors in ref for use by clearAllHighlights and highlightCountry
  useEffect(() => {
    updateMapColorsRef.current = updateMapColors
  }, [updateMapColors])

  // Track previous color scheme to detect changes
  const previousColorSchemeRef = useRef<ColorScheme>(colorScheme)

  // Handle color scheme changes from context
  useEffect(() => {
    if (!map.current || !isLoaded) return
    
    const previousScheme = previousColorSchemeRef.current
    if (previousScheme === colorScheme) return
    

    previousColorSchemeRef.current = colorScheme

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const supportedLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'ru', 'ja']
    
    if (colorScheme === 'climate') {
      // Save current map position before switching style
      const currentCenter = map.current.getCenter()
      const currentZoom = map.current.getZoom()
      
      // Switch to climate style with language support - always include language suffix
      const climateLangSuffix = supportedLanguages.includes(language) ? `-${language}` : '-en'
      const climateStyleUrl = `${basePath}/styles/climate${climateLangSuffix}.json`
      console.log('🌡️ Switching to climate style:', climateStyleUrl)
      
      // Set style and restore position after load
      map.current.once('style.load', () => {
        if (map.current) {
          map.current.setCenter(currentCenter)
          map.current.setZoom(currentZoom)
          console.log(`📍 Position restored after climate style load`)
        }
      })
      map.current.setStyle(climateStyleUrl)
    } else if (previousScheme === 'climate') {
      // Save current map position before switching style
      const currentCenter = map.current.getCenter()
      const currentZoom = map.current.getZoom()
      
      // Switching from climate to overlanding/carnet - reload basemap
      const basemapLangSuffix = supportedLanguages.includes(language) && language !== 'en' ? `-${language}` : ''
      const styleUrl = `${basePath}/styles/basemap${basemapLangSuffix}.json`

      
      // Set style and restore position after load, then re-add custom layers
      const handleStyleLoad = () => {
        console.log('🎬 styledata event fired!')
        if (!map.current) {
          console.error('❌ map.current is null in styledata handler')
          return
        }
        
        try {
          // Restore position
          map.current.setCenter(currentCenter)
          map.current.setZoom(currentZoom)
          console.log(`📍 Position restored after basemap style load`)
          
          // Re-add all custom layers that were in the basemap
          

        
        // Re-create diagonal stripe patterns with different colors
        const createDiagonalPattern = (color: string) => {
          const canvas = document.createElement('canvas')
          const size = 16
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          
          if (ctx) {
            // Clear background (transparent)
            ctx.clearRect(0, 0, size, size)
            
            // Draw diagonal stripes with the specified color
            ctx.strokeStyle = color
            ctx.lineWidth = 3
            
            // Draw multiple diagonal lines to create stripe pattern
            ctx.beginPath()
            ctx.moveTo(0, size)
            ctx.lineTo(size, 0)
            ctx.stroke()
            
            ctx.beginPath()
            ctx.moveTo(-size/2, size/2)
            ctx.lineTo(size/2, -size/2)
            ctx.stroke()
            
            ctx.beginPath()
            ctx.moveTo(size/2, size * 1.5)
            ctx.lineTo(size * 1.5, size/2)
            ctx.stroke()
            
            return ctx.getImageData(0, 0, size, size)
          }
          return null
        }
        
        // Add all colored stripe patterns
        const redPattern = createDiagonalPattern('rgba(239, 68, 68, 1)')
        if (redPattern && !map.current.hasImage('diagonal-stripe-red')) {
          map.current.addImage('diagonal-stripe-red', redPattern)
        }
        
        const blackPattern = createDiagonalPattern('rgba(0, 0, 0, 0.8)')
        if (blackPattern && !map.current.hasImage('diagonal-stripe-black')) {
          map.current.addImage('diagonal-stripe-black', blackPattern)
        }
        
        const whitePattern = createDiagonalPattern('rgba(255, 255, 255, 1)')
        if (whitePattern && !map.current.hasImage('diagonal-stripe-white')) {
          map.current.addImage('diagonal-stripe-white', whitePattern)
        }
        
        const bluePattern = createDiagonalPattern('rgba(59, 130, 246, 1)')
        if (bluePattern && !map.current.hasImage('diagonal-stripe-blue')) {
          map.current.addImage('diagonal-stripe-blue', bluePattern)
        }

        // Re-create highlighted diagonal stripe patterns with gray background
        const createHighlightedDiagonalPattern = (color: string) => {
          const canvas = document.createElement('canvas')
          const size = 16
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          
          if (ctx) {
            // Fill background with gray for highlighted state
            ctx.fillStyle = 'rgba(156, 163, 175, 0.8)' // More visible gray background
            ctx.fillRect(0, 0, size, size)
            
            // Draw diagonal stripes with the specified color
            ctx.strokeStyle = color
            ctx.lineWidth = 3
            
            // Draw multiple diagonal lines to create stripe pattern
            ctx.beginPath()
            ctx.moveTo(0, size)
            ctx.lineTo(size, 0)
            ctx.stroke()
            
            ctx.beginPath()
            ctx.moveTo(-size/2, size/2)
            ctx.lineTo(size/2, -size/2)
            ctx.stroke()
            
            ctx.beginPath()
            ctx.moveTo(size/2, size * 1.5)
            ctx.lineTo(size * 1.5, size/2)
            ctx.stroke()
            
            return ctx.getImageData(0, 0, size, size)
          }
          return null
        }

        // Create highlighted versions with gray background
        const redHighlightPattern = createHighlightedDiagonalPattern('rgba(239, 68, 68, 1)')
        if (redHighlightPattern && !map.current.hasImage('diagonal-stripe-red-highlight')) {
          map.current.addImage('diagonal-stripe-red-highlight', redHighlightPattern)
        }
        
        const blackHighlightPattern = createHighlightedDiagonalPattern('rgba(0, 0, 0, 1)')
        if (blackHighlightPattern && !map.current.hasImage('diagonal-stripe-black-highlight')) {
          map.current.addImage('diagonal-stripe-black-highlight', blackHighlightPattern)
        }
        
        const greyHighlightPattern = createHighlightedDiagonalPattern('rgba(156, 163, 175, 1)')
        if (greyHighlightPattern && !map.current.hasImage('diagonal-stripe-white-highlight')) {
          map.current.addImage('diagonal-stripe-white-highlight', greyHighlightPattern)
        }
        
        const blueHighlightPattern = createHighlightedDiagonalPattern('rgba(59, 130, 246, 1)')
        if (blueHighlightPattern && !map.current.hasImage('diagonal-stripe-blue-highlight')) {
          map.current.addImage('diagonal-stripe-blue-highlight', blueHighlightPattern)
        }
        
        // Re-add country-border source (only if it doesn't exist)
        if (!map.current.getSource('country-border')) {
          map.current.addSource('country-border', {
            type: 'vector',
            url: 'pmtiles://https://overlanding.io/country-borders.pmtiles'
          })
        }
        
        // Re-add hillshade source (only if it doesn't exist)
        if (!map.current.getSource('hillshadeSource')) {
          map.current.addSource('hillshadeSource', {
            type: 'raster-dem',
            url: 'https://tiles.mapterhorn.com/tilejson.json'
          })
        }
        
        // Re-add terrain source (only if it doesn't exist)
        if (!map.current.getSource('terrainSource')) {
          map.current.addSource('terrainSource', {
            type: 'raster-dem',
            url: 'https://tiles.mapterhorn.com/tilejson.json'
          })
        }
        
        // Re-add hillshade layer (only if it doesn't exist) - insert before waterway_river
        if (!map.current.getLayer('hillshade')) {
          map.current.addLayer({
          id: 'hillshade',
          type: 'hillshade',
          source: 'hillshadeSource',
          layout: {
            'visibility': 'none' // Hidden when switching from climate/itineraries to overlanding/carnet
          }
          }, 'waterway_river')
        }
        
        // Re-add country layer (only if it doesn't exist) - insert before waterway_river
        if (!map.current.getLayer('country')) {
          try {
            // Check if insertion point exists
            const hasWaterwayRiver = map.current.getLayer('waterway_river')
            
            if (hasWaterwayRiver) {
              map.current.addLayer({
                id: 'country',
                type: 'fill',
                source: 'country-border',
                'source-layer': 'country',
                paint: {
                  'fill-color': generateOverlandingColorExpression() as any,
                  'fill-opacity': 0.6
                }
              }, 'waterway_river')
            } else {
              // Add without insertion point if waterway_river doesn't exist
              map.current.addLayer({
                id: 'country',
                type: 'fill',
                source: 'country-border',
                'source-layer': 'country',
                paint: {
                  'fill-color': generateOverlandingColorExpression() as any,
                  'fill-opacity': 0.6
                }
              })
            }
          } catch (error) {
            console.error('❌ Error adding country layer:', error)
          }
        }
        
        // Re-add zones layer (only if it doesn't exist) - above countries, before waterway
        if (!map.current.getLayer('zones')) {
          map.current.addLayer({
          id: 'zones',
          type: 'fill',
          source: 'country-border',
          'source-layer': 'zones',
          paint: {
            // Background color based on zone type
            'fill-color': [
              'case',
              ['==', ['get', 'type'], 0], '#ef4444', // Closed - red
              ['==', ['get', 'type'], 1], '#000000', // Guide/Escort - black
              ['==', ['get', 'type'], 2], '#9ca3af', // Permit - grey
              ['==', ['get', 'type'], 3], '#3b82f6', // Restrictions - blue
              '#9ca3af' // Default - grey
            ],
            // Pattern based on zone type
            'fill-pattern': [
              'case',
              ['==', ['get', 'type'], 0], 'diagonal-stripe-red',
              ['==', ['get', 'type'], 1], 'diagonal-stripe-black',
              ['==', ['get', 'type'], 2], 'diagonal-stripe-white',
              ['==', ['get', 'type'], 3], 'diagonal-stripe-blue',
              'diagonal-stripe-white' // Default
            ],
            'fill-opacity': 0.7
          }
          })
        }
        
        // Re-add border layer (only if it doesn't exist)
        if (!map.current.getLayer('border')) {
          map.current.addLayer({
          id: 'border',
          type: 'line',
          source: 'country-border',
          'source-layer': 'border',
          paint: {
            'line-color': [
              'case',
              ['any', ['==', ['get', 'is_open'], 2], ['==', ['get', 'is_open'], '2']], '#15803d',
              ['any', ['==', ['get', 'is_open'], 1], ['==', ['get', 'is_open'], '1']], '#eab308',
              ['any', ['==', ['get', 'is_open'], 3], ['==', ['get', 'is_open'], '3']], '#eab308',
              ['any', ['==', ['get', 'is_open'], -1], ['==', ['get', 'is_open'], '-1']], '#9ca3af',
              '#ef4444'
            ],
            'line-width': 2,
            'line-opacity': 0.8
          }
          })
        }
        
        // Re-add border post layer (only if it doesn't exist)
        if (!map.current.getLayer('border_post')) {
          map.current.addLayer(getBorderPostLayerConfig())
        }
        
        // Re-add itinerary layer (only if it doesn't exist)
        if (!map.current.getLayer('itinerary')) {
          map.current.addLayer({
          id: 'itinerary',
          type: 'line',
          source: 'country-border',
          'source-layer': 'itinerary',
          paint: {
            'line-color': '#1e3a8a',
            'line-width': 5,
            'line-opacity': 0.5
          },
          layout: {
            'visibility': 'none' // Hidden when switching from climate/itineraries to overlanding/carnet
          }
          })
        }
        
        // Re-add highlight layers (only if they don't exist)
        if (!map.current.getLayer('border-highlight')) {
          map.current.addLayer({
          id: 'border-highlight',
          type: 'line',
          source: 'country-border',
          'source-layer': 'border',
          paint: {
            'line-color': '#ffffff',
            'line-width': 4,
            'line-opacity': 1.0
          },
          filter: ['==', ['get', 'id'], '']
          })
        }
        
        if (!map.current.getLayer('border-post-highlight')) {
          map.current.addLayer(getBorderPostHighlightLayerConfig())
        }
        
        if (!map.current.getLayer('zone-highlight')) {
          map.current.addLayer({
          id: 'zone-highlight',
          type: 'fill',
          source: 'country-border',
          'source-layer': 'zones',
          paint: {
            'fill-color': '#ffffff', // White color for better visibility
            'fill-opacity': 0.5 // 50% opacity for solid white fill
          },
          filter: ['==', ['get', 'id'], '']
          }, 'border') // Position before border layer to ensure it's above zones but below borders
        }
        
        if (!map.current.getLayer('itinerary-highlight')) {
          map.current.addLayer({
          id: 'itinerary-highlight',
          type: 'line',
          source: 'country-border',
          'source-layer': 'itinerary',
          paint: {
            'line-color': '#ffffff', // White color for visibility
            'line-width': 6, // Wider than default itinerary line (4px)
            'line-opacity': 1.0 // Full opacity for better visibility
          },
          filter: ['==', ['get', 'itineraryDocId'], ''] // Initially show nothing
          })
        }
        

        

          
          // Wait a tick for layers to be fully registered, then apply colors and visibility
          setTimeout(() => {
            if (map.current && map.current.getLayer('country')) {
              updateMapColors(colorScheme)
              
              // If switching to itineraries mode, explicitly set layer visibility
              if (colorScheme === 'itineraries') {
                // Note: Layer visibility is now handled by the enhanced itinerary layer management effect
                
                // Set terrain for itineraries mode
                if (map.current.getSource('terrainSource')) {
                  map.current.setTerrain({
                    source: 'terrainSource',
                    exaggeration: 1
                  })
                }
              }
            }
          }, 0)
        } catch (error) {
          console.error('❌ Error re-adding layers:', error)
        }
      }
      
      map.current.once('styledata', handleStyleLoad)
      map.current.setStyle(styleUrl)
    } else {
      // Just update colors for overlanding/carnet switch (no style reload needed)
      console.log('🎨 Updating colors only (no style reload)')
      updateMapColors(colorScheme)
    }
  }, [colorScheme, isLoaded, language, updateMapColors])



  // Handle language changes - reload map style with new language
  useEffect(() => {
    if (!map.current || !isLoaded) return
    
    // Check if language actually changed (not initial load)
    if (previousLanguageRef.current === language) {
      return
    }
    
    console.log(`🌐 Language changed from ${previousLanguageRef.current} to ${language}`)
    previousLanguageRef.current = language
    
    // Save current map position before reloading style
    const currentCenter = map.current.getCenter()
    const currentZoom = map.current.getZoom()
    
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const supportedLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'ru', 'ja']
    
    // Reload style with new language for both climate and basemap modes
    if (colorScheme === 'climate') {
      // Climate mode - always include language suffix
      const climateLangSuffix = supportedLanguages.includes(language) ? `-${language}` : '-en'
      const climateStyleUrl = `${basePath}/styles/climate${climateLangSuffix}.json`
      console.log('🌐 Reloading climate style for language change:', climateStyleUrl)
      
      // Restore position after style loads
      map.current.once('style.load', () => {
        if (map.current) {
          map.current.setCenter(currentCenter)
          map.current.setZoom(currentZoom)
        }
      })
      map.current.setStyle(climateStyleUrl)
    } else {
      // For overlanding/carnet, we need to reload basemap and re-add all custom layers
      const basemapLangSuffix = supportedLanguages.includes(language) && language !== 'en' ? `-${language}` : ''
      const styleUrl = `${basePath}/styles/basemap${basemapLangSuffix}.json`
      console.log('🌐 Reloading basemap style for language change:', styleUrl)
      
      // Create a handler to restore position and re-add layers after style loads
      const handleLanguageStyleLoad = () => {
        console.log('🎬 styledata event fired for language change!')
        if (!map.current) {
          console.error('❌ map.current is null in language styledata handler')
          return
        }
        
        try {
          // Restore position
          map.current.setCenter(currentCenter)
          map.current.setZoom(currentZoom)
          console.log(`📍 Position restored after language style load`)
          
          // Re-add all custom layers that were in the basemap
          
          // Re-create diagonal stripe patterns with different colors
          const createDiagonalPattern = (color: string) => {
            const canvas = document.createElement('canvas')
            const size = 16
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext('2d')
            
            if (ctx) {
              // Clear background (transparent)
              ctx.clearRect(0, 0, size, size)
              
              // Draw diagonal stripes with the specified color
              ctx.strokeStyle = color
              ctx.lineWidth = 3
              
              // Draw multiple diagonal lines to create stripe pattern
              ctx.beginPath()
              ctx.moveTo(0, size)
              ctx.lineTo(size, 0)
              ctx.stroke()
              
              ctx.beginPath()
              ctx.moveTo(-size/2, size/2)
              ctx.lineTo(size/2, -size/2)
              ctx.stroke()
              
              ctx.beginPath()
              ctx.moveTo(size/2, size * 1.5)
              ctx.lineTo(size * 1.5, size/2)
              ctx.stroke()
              
              return ctx.getImageData(0, 0, size, size)
            }
            return null
          }
          
          // Add all colored stripe patterns
          const redPattern = createDiagonalPattern('rgba(239, 68, 68, 1)')
          if (redPattern && !map.current.hasImage('diagonal-stripe-red')) {
            map.current.addImage('diagonal-stripe-red', redPattern)
          }
          
          const blackPattern = createDiagonalPattern('rgba(0, 0, 0, 0.8)')
          if (blackPattern && !map.current.hasImage('diagonal-stripe-black')) {
            map.current.addImage('diagonal-stripe-black', blackPattern)
          }
          
          const whitePattern = createDiagonalPattern('rgba(255, 255, 255, 1)')
          if (whitePattern && !map.current.hasImage('diagonal-stripe-white')) {
            map.current.addImage('diagonal-stripe-white', whitePattern)
          }
          
          const bluePattern = createDiagonalPattern('rgba(59, 130, 246, 1)')
          if (bluePattern && !map.current.hasImage('diagonal-stripe-blue')) {
            map.current.addImage('diagonal-stripe-blue', bluePattern)
          }

          // Re-create highlighted diagonal stripe patterns with gray background
          const createHighlightedDiagonalPattern = (color: string) => {
            const canvas = document.createElement('canvas')
            const size = 16
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext('2d')
            
            if (ctx) {
              // Fill background with gray for highlighted state
              ctx.fillStyle = 'rgba(156, 163, 175, 0.8)' // More visible gray background
              ctx.fillRect(0, 0, size, size)
              
              // Draw diagonal stripes with the specified color
              ctx.strokeStyle = color
              ctx.lineWidth = 3
              
              // Draw multiple diagonal lines to create stripe pattern
              ctx.beginPath()
              ctx.moveTo(0, size)
              ctx.lineTo(size, 0)
              ctx.stroke()
              
              ctx.beginPath()
              ctx.moveTo(-size/2, size/2)
              ctx.lineTo(size/2, -size/2)
              ctx.stroke()
              
              ctx.beginPath()
              ctx.moveTo(size/2, size * 1.5)
              ctx.lineTo(size * 1.5, size/2)
              ctx.stroke()
              
              return ctx.getImageData(0, 0, size, size)
            }
            return null
          }

          // Create highlighted versions with gray background
          const redHighlightPattern = createHighlightedDiagonalPattern('rgba(239, 68, 68, 1)')
          if (redHighlightPattern && !map.current.hasImage('diagonal-stripe-red-highlight')) {
            map.current.addImage('diagonal-stripe-red-highlight', redHighlightPattern)
          }
          
          const blackHighlightPattern = createHighlightedDiagonalPattern('rgba(0, 0, 0, 1)')
          if (blackHighlightPattern && !map.current.hasImage('diagonal-stripe-black-highlight')) {
            map.current.addImage('diagonal-stripe-black-highlight', blackHighlightPattern)
          }
          
          const greyHighlightPattern = createHighlightedDiagonalPattern('rgba(156, 163, 175, 1)')
          if (greyHighlightPattern && !map.current.hasImage('diagonal-stripe-white-highlight')) {
            map.current.addImage('diagonal-stripe-white-highlight', greyHighlightPattern)
          }
          
          const blueHighlightPattern = createHighlightedDiagonalPattern('rgba(59, 130, 246, 1)')
          if (blueHighlightPattern && !map.current.hasImage('diagonal-stripe-blue-highlight')) {
            map.current.addImage('diagonal-stripe-blue-highlight', blueHighlightPattern)
          }
          
          // Re-add country-border source (only if it doesn't exist)
          if (!map.current.getSource('country-border')) {
            map.current.addSource('country-border', {
              type: 'vector',
              url: 'pmtiles://https://overlanding.io/country-borders.pmtiles'
            })
          }
          
          // Re-add hillshade source (only if it doesn't exist)
          if (!map.current.getSource('hillshadeSource')) {
            map.current.addSource('hillshadeSource', {
              type: 'raster-dem',
              url: 'https://tiles.mapterhorn.com/tilejson.json'
            })
          }
          
          // Re-add terrain source (only if it doesn't exist)
          if (!map.current.getSource('terrainSource')) {
            map.current.addSource('terrainSource', {
              type: 'raster-dem',
              url: 'https://tiles.mapterhorn.com/tilejson.json'
            })
          }
          
          // Re-add hillshade layer (only if it doesn't exist) - insert before waterway_river
          if (!map.current.getLayer('hillshade')) {
            map.current.addLayer({
            id: 'hillshade',
            type: 'hillshade',
            source: 'hillshadeSource',
            layout: {
              'visibility': 'none' // Hidden when switching from climate/itineraries to overlanding/carnet
            }
            }, 'waterway_river')
          }
          
          // Re-add country layer (only if it doesn't exist) - insert before waterway_river
          if (!map.current.getLayer('country')) {
            try {
              // Check if insertion point exists
              const hasWaterwayRiver = map.current.getLayer('waterway_river')
              
              if (hasWaterwayRiver) {
                map.current.addLayer({
                  id: 'country',
                  type: 'fill',
                  source: 'country-border',
                  'source-layer': 'country',
                  paint: {
                    'fill-color': generateOverlandingColorExpression() as any,
                    'fill-opacity': 0.6
                  }
                }, 'waterway_river')
              } else {
                // Add without insertion point if waterway_river doesn't exist
                map.current.addLayer({
                  id: 'country',
                  type: 'fill',
                  source: 'country-border',
                  'source-layer': 'country',
                  paint: {
                    'fill-color': generateOverlandingColorExpression() as any,
                    'fill-opacity': 0.6
                  }
                })
              }
            } catch (error) {
              console.error('❌ Error adding country layer:', error)
            }
          }
          
          // Re-add zones layer (only if it doesn't exist) - above countries, before waterway
          if (!map.current.getLayer('zones')) {
            map.current.addLayer({
            id: 'zones',
            type: 'fill',
            source: 'country-border',
            'source-layer': 'zones',
            paint: {
              // Background color based on zone type
              'fill-color': [
                'case',
                ['==', ['get', 'type'], 0], '#ef4444', // Closed - red
                ['==', ['get', 'type'], 1], '#000000', // Guide/Escort - black
                ['==', ['get', 'type'], 2], '#9ca3af', // Permit - grey
                ['==', ['get', 'type'], 3], '#3b82f6', // Restrictions - blue
                '#9ca3af' // Default - grey
              ],
              // Pattern based on zone type
              'fill-pattern': [
                'case',
                ['==', ['get', 'type'], 0], 'diagonal-stripe-red',
                ['==', ['get', 'type'], 1], 'diagonal-stripe-black',
                ['==', ['get', 'type'], 2], 'diagonal-stripe-white',
                ['==', ['get', 'type'], 3], 'diagonal-stripe-blue',
                'diagonal-stripe-white' // Default
              ],
              'fill-opacity': 0.7
            }
            })
          }
          
          // Re-add border layer (only if it doesn't exist)
          if (!map.current.getLayer('border')) {
            map.current.addLayer({
            id: 'border',
            type: 'line',
            source: 'country-border',
            'source-layer': 'border',
            paint: {
              'line-color': [
                'case',
                ['any', ['==', ['get', 'is_open'], 2], ['==', ['get', 'is_open'], '2']], '#15803d',
                ['any', ['==', ['get', 'is_open'], 1], ['==', ['get', 'is_open'], '1']], '#eab308',
                ['any', ['==', ['get', 'is_open'], 3], ['==', ['get', 'is_open'], '3']], '#eab308',
                ['any', ['==', ['get', 'is_open'], -1], ['==', ['get', 'is_open'], '-1']], '#9ca3af',
                '#ef4444'
              ],
              'line-width': 2,
              'line-opacity': 0.8
            }
            })
          }
          
          // Re-add border post layer (only if it doesn't exist)
          if (!map.current.getLayer('border_post')) {
            map.current.addLayer(getBorderPostLayerConfig())
          }
          
          // Re-add itinerary layer (only if it doesn't exist)
          if (!map.current.getLayer('itinerary')) {
            map.current.addLayer({
            id: 'itinerary',
            type: 'line',
            source: 'country-border',
            'source-layer': 'itinerary',
            paint: {
              'line-color': '#1e3a8a',
              'line-width': 5,
              'line-opacity': 0.5
            },
            layout: {
              'visibility': 'none' // Hidden when switching from climate/itineraries to overlanding/carnet
            }
            })
          }
          
          // Re-add highlight layers (only if they don't exist)
          if (!map.current.getLayer('border-highlight')) {
            map.current.addLayer({
            id: 'border-highlight',
            type: 'line',
            source: 'country-border',
            'source-layer': 'border',
            paint: {
              'line-color': '#ffffff',
              'line-width': 4,
              'line-opacity': 1.0
            },
            filter: ['==', ['get', 'id'], '']
            })
          }
          
          if (!map.current.getLayer('border-post-highlight')) {
            map.current.addLayer(getBorderPostHighlightLayerConfig())
          }
          
          if (!map.current.getLayer('zone-highlight')) {
            map.current.addLayer({
            id: 'zone-highlight',
            type: 'fill',
            source: 'country-border',
            'source-layer': 'zones',
            paint: {
              'fill-color': '#ffffff', // White color for better visibility
              'fill-opacity': 0.5 // 50% opacity for solid white fill
            },
            filter: ['==', ['get', 'id'], '']
            }, 'border') // Position before border layer to ensure it's above zones but below borders
          }
          
          if (!map.current.getLayer('itinerary-highlight')) {
            map.current.addLayer({
            id: 'itinerary-highlight',
            type: 'line',
            source: 'country-border',
            'source-layer': 'itinerary',
            paint: {
              'line-color': '#ffffff', // White color for visibility
              'line-width': 6, // Wider than default itinerary line (4px)
              'line-opacity': 1.0 // Full opacity for better visibility
            },
            filter: ['==', ['get', 'itineraryDocId'], ''] // Initially show nothing
            })
          }
          

          
          // Wait a tick for layers to be fully registered, then apply colors and visibility
          setTimeout(() => {
            if (map.current && map.current.getLayer('country')) {
              updateMapColors(colorScheme)
              
              // If switching to itineraries mode, explicitly set layer visibility
              if (colorScheme === 'itineraries') {
                // Note: Layer visibility is now handled by the enhanced itinerary layer management effect
                
                // Set terrain for itineraries mode
                if (map.current.getSource('terrainSource')) {
                  map.current.setTerrain({
                    source: 'terrainSource',
                    exaggeration: 1
                  })
                }
              }
            }
          }, 0)
        } catch (error) {
          console.error('❌ Error re-adding layers after language change:', error)
        }
      }
      
      map.current.once('styledata', handleLanguageStyleLoad)
      map.current.setStyle(styleUrl)
    }
  }, [language, isLoaded, colorScheme, generateOverlandingColorExpression, updateMapColors])

  // Apply color scheme when map becomes loaded (initial load only)
  useEffect(() => {
    if (isLoaded && map.current && !initialColorsAppliedRef.current && colorScheme !== 'climate' && colorScheme !== 'itineraries') {
      console.log(`🎨 Applying ${colorScheme} color scheme to loaded map (initial load)`)
      updateMapColors(colorScheme)
      initialColorsAppliedRef.current = true
    }
  }, [isLoaded, colorScheme, updateMapColors])

  // Handle prop-driven highlighting (for URL navigation)
  // Implements Requirements: 3.1, 3.2, 3.3, 3.4, 5.3
  useEffect(() => {
    if (!isLoaded || !map.current) return

    const startTime = performance.now()

    try {
      // Clear all highlights first
      clearAllHighlights()

      // Apply highlights based on props
      if (selectedCountryId) {
        console.log('🎯 Prop-driven country highlight:', selectedCountryId)
        try {
          highlightCountry(selectedCountryId)
        } catch (error) {
          console.error('❌ Failed to apply prop-driven country highlight:', selectedCountryId, error)
        }
      } else if (selectedBorderId) {
        console.log('🎯 Prop-driven border highlight:', selectedBorderId)
        try {
          highlightBorder(selectedBorderId)
        } catch (error) {
          console.error('❌ Failed to apply prop-driven border highlight:', selectedBorderId, error)
        }
      } else if (selectedBorderPostId) {
        console.log('🎯 Prop-driven border post highlight:', selectedBorderPostId)
        try {
          highlightBorderPost(selectedBorderPostId)
        } catch (error) {
          console.error('❌ Failed to apply prop-driven border post highlight:', selectedBorderPostId, error)
        }
      } else if (selectedZoneId) {
        console.log('🎯 Prop-driven zone highlight:', selectedZoneId)
        try {
          highlightZone(selectedZoneId)
        } catch (error) {
          console.error('❌ Failed to apply prop-driven zone highlight:', selectedZoneId, error)
        }
      } else if (selectedItineraryId) {
        console.log('🎯 Prop-driven itinerary highlight:', selectedItineraryId)
        try {
          // Validate itinerary ID before highlighting
          if (typeof selectedItineraryId !== 'string' || selectedItineraryId.trim() === '') {
            console.warn('⚠️ Invalid prop-driven itinerary ID:', selectedItineraryId)
            return
          }
          
          // Check if highlighting function is available
          if (typeof highlightItinerary !== 'function') {
            console.error('❌ highlightItinerary function not available for prop-driven highlight')
            return
          }
          
          highlightItinerary(selectedItineraryId)
        } catch (error) {
          console.error('❌ Failed to apply prop-driven itinerary highlight:', selectedItineraryId, error)
          console.error('❌ Prop-driven highlight error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            itineraryId: selectedItineraryId,
            mapAvailable: !!map.current,
            isLoaded,
            highlightFunctionType: typeof highlightItinerary
          })
        }
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      if (duration > 100) {
        console.warn(`⚠️ Prop-driven highlight took ${duration.toFixed(2)}ms (target: <100ms)`)
      } else {

      }
    } catch (error) {
      console.error('❌ Unexpected error in prop-driven highlighting effect:', error)
    }
  }, [isLoaded, selectedCountryId, selectedBorderId, selectedBorderPostId, selectedZoneId, selectedItineraryId, highlightCountry, highlightBorder, highlightBorderPost, highlightZone, highlightItinerary, clearAllHighlights])

  // Toggle border posts layer visibility
  useEffect(() => {
    if (!map.current || !isLoaded) return

    // Hide border posts when carnet, climate, or itineraries is selected, or when toggle is off
    const visibility = (showBorderPosts && colorScheme !== 'carnet' && colorScheme !== 'climate' && colorScheme !== 'itineraries') ? 'visible' : 'none'

    if (map.current.getLayer('border_post')) {
      map.current.setLayoutProperty('border_post', 'visibility', visibility)
    }
    if (map.current.getLayer('border-post-highlight')) {
      map.current.setLayoutProperty('border-post-highlight', 'visibility', visibility)
    }
  }, [showBorderPosts, colorScheme, isLoaded])

  // Handle month selection and data type for climate layers
  useEffect(() => {
    if (!map.current || !isLoaded || colorScheme !== 'climate') return
    
    // Only control climate layer visibility when in climate mode
    for (let i = 1; i <= 12; i++) {
      const monthNumber = String(i).padStart(2, '0') // 01, 02, ..., 12
      const isSelectedMonth = (i - 1) === selectedMonth
      
      // Temperature layers
      const tempLayerId = `climate-temp-${monthNumber}`
      if (map.current!.getLayer(tempLayerId)) {
        const visibility = (climateDataType === 'temperature' && isSelectedMonth) ? 'visible' : 'none'
        map.current!.setLayoutProperty(tempLayerId, 'visibility', visibility)
      }
      
      // Precipitation layers
      const precipLayerId = `climate-precip-${monthNumber}`
      if (map.current!.getLayer(precipLayerId)) {
        const visibility = (climateDataType === 'precipitation' && isSelectedMonth) ? 'visible' : 'none'
        map.current!.setLayoutProperty(precipLayerId, 'visibility', visibility)
      }
    }
  }, [selectedMonth, colorScheme, climateDataType, isLoaded])

  // Handle zones layer visibility for overlanding mode
  useEffect(() => {
    if (!map.current || !isLoaded || colorScheme === 'climate') return
    
    // Show zones layer only for overlanding scheme (not in climate, carnet, or itineraries mode)
    if (map.current.getLayer('zones')) {
      const zonesVisibility = colorScheme === 'overlanding' ? 'visible' : 'none'
      map.current.setLayoutProperty('zones', 'visibility', zonesVisibility)
    }
    
    // Also control zone-highlight layer visibility
    if (map.current.getLayer('zone-highlight')) {
      const zonesVisibility = colorScheme === 'overlanding' ? 'visible' : 'none'
      map.current.setLayoutProperty('zone-highlight', 'visibility', zonesVisibility)
    }
  }, [colorScheme, isLoaded])

  // Centralized itinerary layer visibility management with enhanced debounced cleanup
  // Consolidates all itinerary-related layer visibility logic into a single effect
  // Implements Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.4, 3.2, 3.4
  useEffect(() => {
    if (!map.current || !isLoaded || colorScheme === 'climate') return
    
    const isItinerariesMode = colorScheme === 'itineraries'
    
    // Use enhanced debounced color scheme manager for better stability
    const operationId = import('../lib/layer-visibility-utils').then(({ debouncedColorSchemeManager }) => {
      return debouncedColorSchemeManager.scheduleColorSchemeChange(
        colorScheme,
        async () => {
          if (!map.current) return
          
          try {

            
            if (isItinerariesMode) {
              // === SWITCHING TO ITINERARIES MODE ===
              
              // Import layer visibility utilities dynamically
              const { verifyAndCreateItineraryLayers, verifyItineraryModeTransition } = await import('../lib/layer-visibility-utils')
              
              // 1. Verify and create missing itinerary layers before making them visible
              const creationResults = await verifyAndCreateItineraryLayers(map.current, {
                context: `switching to ${colorScheme} mode`
              })
              
              const creationFailed = creationResults.some(result => !result.success)
              if (creationFailed) {
                console.error('❌ Some itinerary layers could not be created/verified')
                creationResults.forEach(result => {
                  if (!result.success) {
                    console.error(`❌ Layer ${result.layerId}: ${result.error}`)
                  }
                })
              }
              
              // 2. Hide all overlanding layers first
              const overlandingLayers = ['country', 'border', 'border-highlight', 'zones', 'zone-highlight', 'border_post', 'border-post-highlight']
              for (const layerId of overlandingLayers) {
                if (map.current.getLayer(layerId)) {
                  map.current.setLayoutProperty(layerId, 'visibility', 'none')

                }
              }
              
              // 3. Show itinerary layers (only if they exist)
              if (map.current.getLayer('itinerary')) {
                map.current.setLayoutProperty('itinerary', 'visibility', 'visible')

              }
              
              if (map.current.getLayer('itinerary-highlight')) {
                map.current.setLayoutProperty('itinerary-highlight', 'visibility', 'visible')

              }
              
              if (map.current.getLayer('itinerary-labels')) {
                map.current.setLayoutProperty('itinerary-labels', 'visibility', 'visible')

              }
              
              // 4. Configure hillshade for itineraries mode
              if (map.current.getLayer('hillshade')) {
                map.current.setLayoutProperty('hillshade', 'visibility', 'visible')

              }
              
              // 5. Enable terrain for itineraries mode
              if (map.current.getSource('terrainSource')) {
                try {
                  map.current.setTerrain({
                    source: 'terrainSource',
                    exaggeration: 1
                  })

                } catch (error) {
                  console.error('❌ Error enabling terrain:', error)
                }
              }
              
              // 6. Verify that the transition was successful
              const verificationResult = await verifyItineraryModeTransition(map.current, 'itineraries', {
                context: `switching to ${colorScheme} mode`
              })
              
              if (!verificationResult.success) {
                console.error(`❌ Itinerary mode transition verification failed: ${verificationResult.failureCount} failures`)
              }
              
            } else {
              // === SWITCHING AWAY FROM ITINERARIES MODE ===
              
              // Import enhanced cleanup function
              const { performItineraryCleanup } = await import('../lib/layer-visibility-utils')
              
              // 1. Perform enhanced cleanup with verification
              const cleanupResult = await performItineraryCleanup(map.current, {
                context: `switching from itineraries to ${colorScheme} mode`
              })
              
              if (!cleanupResult.success) {
                console.error(`❌ Enhanced itinerary cleanup failed: ${cleanupResult.failureCount} failures`)
                cleanupResult.results.forEach(result => {
                  if (!result.success) {
                    console.error(`❌ Cleanup failed for ${result.layerId}: ${result.error}`)
                  }
                })
              }
              
              // 2. Show overlanding layers based on current mode
              const overlandingLayers = ['country', 'border', 'border-highlight']
              for (const layerId of overlandingLayers) {
                if (map.current.getLayer(layerId)) {
                  map.current.setLayoutProperty(layerId, 'visibility', 'visible')

                }
              }
              
              // 3. Apply appropriate colors for overlanding/carnet modes
              if (colorScheme === 'overlanding' || colorScheme === 'carnet') {
                // Small delay to ensure layers are visible before applying colors
                setTimeout(() => {
                  if (map.current && map.current.getLayer('country')) {
                    updateMapColors(colorScheme)

                  }
                }, 50)
              }
            }
            

            
          } catch (error) {
            console.error('❌ Error in enhanced itinerary layer management:', error)
          }
        },
        {
          debounceMs: 150, // Enhanced debounce timing for better stability
          context: `itinerary-layer-management-${colorScheme}`,
          maxPendingOperations: 3
        }
      )
    })
    
    // Cleanup function to cancel pending operations
    return () => {
      operationId.then(id => {
        import('../lib/layer-visibility-utils').then(({ debouncedColorSchemeManager }) => {
          debouncedColorSchemeManager.cancelOperation(id)
        })
      }).catch(() => {
        // Ignore errors during cleanup
      })
    }
  }, [colorScheme, isLoaded, updateMapColors])

  // Set initial legend visibility based on screen size
  useEffect(() => {
    if (initialLegendSetRef.current) return
    
    const checkScreenSize = () => {
      // Show legend on desktop/tablet (768px and above), hide on mobile
      const isDesktopOrTablet = window.innerWidth >= 768
      setShowLegend(isDesktopOrTablet)
      initialLegendSetRef.current = true
    }
    
    // Check immediately
    checkScreenSize()
    
    // Also listen for resize events in case the user rotates their device
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])



  useEffect(() => {
    if (!mapContainer.current || map.current) return



    try {
      // Register PMTiles protocol
      const protocol = new Protocol()
      maplibregl.addProtocol('pmtiles', protocol.tile)



      // Load style from JSON file based on color scheme and language
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const supportedLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'ru', 'ja']
      let styleUrl: string
      
      if (colorScheme === 'climate') {
        // Load climate style with language support - always include language suffix for climate
        const climateLangSuffix = supportedLanguages.includes(language) ? `-${language}` : '-en'
        styleUrl = `${basePath}/styles/climate${climateLangSuffix}.json`

      } else {
        // Load basemap style with language support for overlanding/carnet modes
        const basemapLangSuffix = supportedLanguages.includes(language) && language !== 'en' ? `-${language}` : ''
        styleUrl = `${basePath}/styles/basemap${basemapLangSuffix}.json`

      }

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: [0, 20],
        zoom: 2,
        maxZoom: 18
      })

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

      map.current.on('load', () => {


        // Call onMapReady with map interactions BEFORE setting isLoaded
        // This ensures the interactions are available before any effects that depend on isLoaded
        if (onMapReady) {
          try {
            // Verify all highlight functions are available before creating interactions object
            const missingFunctions = []
            if (typeof clearAllHighlights !== 'function') missingFunctions.push('clearAllHighlights')
            if (typeof highlightCountry !== 'function') missingFunctions.push('highlightCountry')
            if (typeof highlightBorder !== 'function') missingFunctions.push('highlightBorder')
            if (typeof highlightBorderPost !== 'function') missingFunctions.push('highlightBorderPost')
            if (typeof highlightZone !== 'function') missingFunctions.push('highlightZone')
            if (typeof highlightItinerary !== 'function') missingFunctions.push('highlightItinerary')
            if (typeof zoomToLocation !== 'function') missingFunctions.push('zoomToLocation')

            if (missingFunctions.length > 0) {
              console.error('❌ Missing highlight functions:', missingFunctions)
              console.warn('⚠️ Some map interactions may not work properly')
            }

            // Verify map and layer availability for better error reporting
            const mapDiagnostics = {
              mapAvailable: !!map.current,
              itineraryHighlightLayerExists: map.current ? !!map.current.getLayer('itinerary-highlight') : false,
              countryBorderSourceExists: map.current ? !!map.current.getSource('country-border') : false
            }
            
            if (!mapDiagnostics.itineraryHighlightLayerExists) {
              console.warn('⚠️ Itinerary highlight layer not available during interactions setup')
            }
            


            const interactions = {
              clearAllHighlights,
              clearSelection: clearAllHighlights, // Alias for backward compatibility
              highlightCountry,
              highlightBorder,
              highlightBorderPost,
              highlightZone,
              highlightItinerary,
              zoomToLocation,
              calculateItineraryBounds,
              fitBounds,
              // Add placeholder functions for missing functionality
              selectCountryByISO3: (iso3: string) => {
                console.warn('⚠️ selectCountryByISO3 not implemented yet:', iso3)
              }
            }
            

            
            onMapReady(interactions)
          } catch (error) {
            console.error('❌ Failed to create or pass map interactions:', error)
            console.error('❌ Interactions error details:', {
              message: error instanceof Error ? error.message : 'Unknown error',
              mapAvailable: !!map.current,
              onMapReadyType: typeof onMapReady
            })
            
            // Still call onMapReady with a minimal interactions object to prevent complete failure
            try {
              onMapReady({
                clearAllHighlights: () => console.warn('⚠️ Highlight functions unavailable due to initialization error'),
                highlightItinerary: () => console.warn('⚠️ Itinerary highlighting unavailable due to initialization error')
              })
            } catch (fallbackError) {
              console.error('❌ Even fallback onMapReady call failed:', fallbackError)
            }
          }
        }

        setIsLoaded(true)

        // Add country-border source from PMTiles
        if (map.current) {
          // Create diagonal stripe patterns for zones with different colors
          const createDiagonalPattern = (color: string) => {
            const canvas = document.createElement('canvas')
            const size = 16
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext('2d')
            
            if (ctx) {
              // Clear background (transparent)
              ctx.clearRect(0, 0, size, size)
              
              // Draw diagonal stripes with the specified color
              ctx.strokeStyle = color
              ctx.lineWidth = 3
              
              // Draw multiple diagonal lines to create stripe pattern
              ctx.beginPath()
              ctx.moveTo(0, size)
              ctx.lineTo(size, 0)
              ctx.stroke()
              
              ctx.beginPath()
              ctx.moveTo(-size/2, size/2)
              ctx.lineTo(size/2, -size/2)
              ctx.stroke()
              
              ctx.beginPath()
              ctx.moveTo(size/2, size * 1.5)
              ctx.lineTo(size * 1.5, size/2)
              ctx.stroke()
              
              return ctx.getImageData(0, 0, size, size)
            }
            return null
          }

          // Create highlighted diagonal stripe patterns with gray background
          const createHighlightedDiagonalPattern = (color: string) => {
            const canvas = document.createElement('canvas')
            const size = 16
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext('2d')
            
            if (ctx) {
              // Fill background with gray for highlighted state
              ctx.fillStyle = 'rgba(156, 163, 175, 0.8)' // More visible gray background
              ctx.fillRect(0, 0, size, size)
              
              // Draw diagonal stripes with the specified color
              ctx.strokeStyle = color
              ctx.lineWidth = 3
              
              // Draw multiple diagonal lines to create stripe pattern
              ctx.beginPath()
              ctx.moveTo(0, size)
              ctx.lineTo(size, 0)
              ctx.stroke()
              
              ctx.beginPath()
              ctx.moveTo(-size/2, size/2)
              ctx.lineTo(size/2, -size/2)
              ctx.stroke()
              
              ctx.beginPath()
              ctx.moveTo(size/2, size * 1.5)
              ctx.lineTo(size * 1.5, size/2)
              ctx.stroke()
              
              return ctx.getImageData(0, 0, size, size)
            }
            return null
          }

          // Skip adding layers if in climate mode - climate.json style handles everything
          if (colorScheme !== 'climate') {
            // Wait for style to be fully loaded before adding custom layers
            const addCustomLayers = () => {
              if (!map.current) return
              
              // Double-check that style is loaded
              if (!map.current.isStyleLoaded()) {
                console.log('⚠️ Style not fully loaded, waiting longer...')
                setTimeout(addCustomLayers, 200)
                return
              }
              

            // Add diagonal stripe patterns for each zone type
            // Type 0: Closed - Red stripes
            const redPattern = createDiagonalPattern('rgba(239, 68, 68, 1)')
            if (redPattern && !map.current.hasImage('diagonal-stripe-red')) {
              map.current.addImage('diagonal-stripe-red', redPattern)
            }
            
            // Type 1: Guide/Escort - Black stripes
            const blackPattern = createDiagonalPattern('rgba(0, 0, 0, 1)')
            if (blackPattern && !map.current.hasImage('diagonal-stripe-black')) {
              map.current.addImage('diagonal-stripe-black', blackPattern)
            }
            
            // Type 2: Permit - Grey stripes
            const whitePattern = createDiagonalPattern('rgba(255, 255, 255, 1)')
            if (whitePattern && !map.current.hasImage('diagonal-stripe-white')) {
              map.current.addImage('diagonal-stripe-white', whitePattern)
            }
            
            // Type 3: Restrictions - Blue stripes
            const bluePattern = createDiagonalPattern('rgba(59, 130, 246, 1)')
            if (bluePattern && !map.current.hasImage('diagonal-stripe-blue')) {
              map.current.addImage('diagonal-stripe-blue', bluePattern)
            }

            // Create highlighted versions with gray background
            // Type 0: Closed - Red stripes with gray background
            const redHighlightPattern = createHighlightedDiagonalPattern('rgba(239, 68, 68, 1)')
            if (redHighlightPattern && !map.current.hasImage('diagonal-stripe-red-highlight')) {
              map.current.addImage('diagonal-stripe-red-highlight', redHighlightPattern)
            }
            
            // Type 1: Guide/Escort - Black stripes with gray background
            const blackHighlightPattern = createHighlightedDiagonalPattern('rgba(0, 0, 0, 1)')
            if (blackHighlightPattern && !map.current.hasImage('diagonal-stripe-black-highlight')) {
              map.current.addImage('diagonal-stripe-black-highlight', blackHighlightPattern)
            }
            
            // Type 2: Permit - Grey stripes with gray background
            const greyHighlightPattern = createHighlightedDiagonalPattern('rgba(156, 163, 175, 1)')
            if (greyHighlightPattern && !map.current.hasImage('diagonal-stripe-white-highlight')) {
              map.current.addImage('diagonal-stripe-white-highlight', greyHighlightPattern)
            }
            
            // Type 3: Restrictions - Blue stripes with gray background
            const blueHighlightPattern = createHighlightedDiagonalPattern('rgba(59, 130, 246, 1)')
            if (blueHighlightPattern && !map.current.hasImage('diagonal-stripe-blue-highlight')) {
              map.current.addImage('diagonal-stripe-blue-highlight', blueHighlightPattern)
            }


            try {
              map.current.addSource('country-border', {
                type: 'vector',
                url: 'pmtiles://https://overlanding.io/country-borders.pmtiles'
              })

              
            } catch (error) {
              console.error('❌ Failed to add country-border source:', error)
            }

            try {
              map.current.addSource('hillshadeSource', {
                type: 'raster-dem',
                url: 'https://tiles.mapterhorn.com/tilejson.json'
              })

            } catch (error) {
              console.error('❌ Failed to add hillshadeSource:', error)
            }
            
            try {
              map.current.addSource('terrainSource', {
                type: 'raster-dem',
                url: 'https://tiles.mapterhorn.com/tilejson.json'
              })

            } catch (error) {
              console.error('❌ Failed to add terrainSource:', error)
            }

              // Add hillshade layer (above basemap, below all other layers)
              try {
                if (!map.current.getLayer('hillshade')) {
                  const insertionPoint = map.current.getLayer('waterway_river') ? 'waterway_river' : undefined
                  
                  map.current.addLayer({
                    id: 'hillshade',
                    type: 'hillshade',
                    source: 'hillshadeSource',
                    layout: {
                      'visibility': colorScheme === 'itineraries' ? 'visible' : 'none'
                    }
                  }, insertionPoint)
                }
              } catch (error) {
                console.error('❌ Error adding hillshade layer:', error)
              }

              // Add country layer (bottom layer)
              try {
                if (!map.current.getLayer('country')) {
                  const insertionPoint = map.current.getLayer('waterway_river') ? 'waterway_river' : undefined
                  
                  map.current.addLayer({
                    id: 'country',
                    type: 'fill',
                    source: 'country-border',
                    'source-layer': 'country',
                    paint: {
                      'fill-color': generateOverlandingColorExpression() as any,
                      'fill-opacity': 0.6
                    }
                  }, insertionPoint)
                }
              } catch (error) {
                console.error('❌ Error adding country layer:', error)
              }

              // Add zones layer (restricted areas) with color-coded diagonal stripe patterns
              try {
                if (!map.current.getLayer('zones')) {
                  const insertionPoint = map.current.getLayer('waterway_river') ? 'waterway_river' : undefined
                  
                  map.current.addLayer({
                    id: 'zones',
                    type: 'fill',
                    source: 'country-border',
                    'source-layer': 'zones',
                    paint: {
                      // Background color based on zone type
                      'fill-color': [
                        'case',
                        ['==', ['get', 'type'], 0], '#ef4444', // Closed - red
                        ['==', ['get', 'type'], 1], '#000000', // Guide/Escort - black
                        ['==', ['get', 'type'], 2], '#9ca3af', // Permit - grey
                        ['==', ['get', 'type'], 3], '#3b82f6', // Restrictions - blue
                        '#9ca3af' // Default - grey
                      ],
                      // Pattern based on zone type
                      'fill-pattern': [
                        'case',
                        ['==', ['get', 'type'], 0], 'diagonal-stripe-red',
                        ['==', ['get', 'type'], 1], 'diagonal-stripe-black',
                        ['==', ['get', 'type'], 2], 'diagonal-stripe-blue',
                        ['==', ['get', 'type'], 3], 'diagonal-stripe-white',
                        'diagonal-stripe-white' // Default
                      ],
                      'fill-opacity': 0.7
                    }
                  }, insertionPoint)
                }
              } catch (error) {
                console.error('❌ Error adding zones layer:', error)
              }
          
          console.log('✅ Zones layer added with diagonal stripe pattern')
          


              // Add border layer (middle layer)
              try {
                if (!map.current.getLayer('border')) {
                  map.current.addLayer({
                    id: 'border',
                    type: 'line',
                    source: 'country-border',
                    'source-layer': 'border',
                    paint: {
                      'line-color': [
                        'case',
                        // Open (2) - dark green
                        ['any',
                          ['==', ['get', 'is_open'], 2],
                          ['==', ['get', 'is_open'], '2']
                        ], '#15803d',
                        // Dangerous/Bilateral (1) - yellow
                        ['any',
                          ['==', ['get', 'is_open'], 1],
                          ['==', ['get', 'is_open'], '1']
                        ], '#eab308',
                        // Restrictions apply (3) - yellow
                        ['any',
                          ['==', ['get', 'is_open'], 3],
                          ['==', ['get', 'is_open'], '3']
                        ], '#eab308',
                        // Unknown (-1) - grey
                        ['any',
                          ['==', ['get', 'is_open'], -1],
                          ['==', ['get', 'is_open'], '-1']
                        ], '#9ca3af',
                        // Closed (0) or default - red
                        '#ef4444'
                      ],
                      'line-width': 2,
                      'line-opacity': 0.8
                    }
                  })
                }
              } catch (error) {
                console.error('❌ Error adding border layer:', error)
              }

              // Add border post layer (top layer - most important for clicking)
              try {
                if (!map.current.getLayer('border_post')) {
                  map.current.addLayer(getBorderPostLayerConfig())
                }
              } catch (error) {
                console.error('❌ Error adding border post layer:', error)
              }



              // Add itinerary layer (for itineraries mode)
              try {
                if (!map.current.getLayer('itinerary')) {
                  map.current.addLayer({
                    id: 'itinerary',
                    type: 'line',
                    source: 'country-border',
                    'source-layer': 'itinerary',
                    paint: {
                      'line-color': '#1e3a8a',
                      'line-width': 5,
                      'line-opacity': 0.5
                    },
                    layout: {
                      'visibility': colorScheme === 'itineraries' ? 'visible' : 'none'
                    }
                  })
                }
              } catch (error) {
                console.error('❌ Error adding itinerary layer:', error)
              }



          // Add itinerary labels layer only if it doesn't exist and source is available
          if (!map.current.getLayer('itinerary-labels') && map.current.getSource('country-border')) {
            try {
              map.current.addLayer({
              id: 'itinerary-labels',
              type: 'symbol',
              source: 'country-border',
              'source-layer': 'itinerary',
              layout: {
                'text-field': [
                  'case',
                  ['has', 'itineraryId'], ['get', 'itineraryId'], // First try itineraryId
                  ['has', 'id'], ['get', 'id'], // Fallback to id
                  '' // Empty string if neither exists
                ],
                'text-font': [
                  'Roboto Regular'
                ],
                // Zoom-responsive text sizing
                'text-size': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  6, 8,   // At zoom 6, text size 8
                  8, 10,  // At zoom 8, text size 10
                  10, 12, // At zoom 10, text size 12
                  12, 14, // At zoom 12, text size 14
                  14, 16, // At zoom 14, text size 16
                  16, 18  // At zoom 16, text size 18
                ],
                'text-anchor': 'center',
                'text-offset': [0, 0],
                // Do not set symbol-placement to avoid errors
                'text-rotation-alignment': 'map',
                'text-pitch-alignment': 'viewport',
                'text-allow-overlap': false,
                'text-ignore-placement': false,
                // Zoom-responsive symbol spacing
                'symbol-spacing': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  6, 200,  // At zoom 6, spacing 200
                  10, 150, // At zoom 10, spacing 150
                  14, 100, // At zoom 14, spacing 100
                  16, 80   // At zoom 16, spacing 80
                ],
                // Zoom-responsive text padding
                'text-padding': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  6, 4,   // At zoom 6, padding 4
                  10, 6,  // At zoom 10, padding 6
                  14, 8,  // At zoom 14, padding 8
                  16, 10  // At zoom 16, padding 10
                ],
                'visibility': colorScheme === 'itineraries' ? 'visible' : 'none'
              },
              paint: {
                'text-color': '#ffffff',
                'text-halo-color': '#000000', // Black halo for better contrast
                // Zoom-responsive halo width
                'text-halo-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  6, 1,   // At zoom 6, halo width 1
                  10, 1.5, // At zoom 10, halo width 1.5
                  14, 2,   // At zoom 14, halo width 2
                  16, 2.5  // At zoom 16, halo width 2.5
                ],
                // Zoom-responsive opacity
                'text-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  6, 0.7,  // At zoom 6, opacity 0.7
                  8, 0.8,  // At zoom 8, opacity 0.8
                  10, 0.9, // At zoom 10, opacity 0.9
                  12, 1.0  // At zoom 12+, opacity 1.0
                ]
              }
            })
            } catch (error) {
              console.error('❌ Failed to add itinerary labels layer:', error)
              // Continue execution even if layer creation fails
            }
          }



              // Add highlight layers (on top of regular layers)
              try {
                // Border highlight layer - white, wider line for selected borders
                if (!map.current.getLayer('border-highlight')) {
                  map.current.addLayer({
                    id: 'border-highlight',
                    type: 'line',
                    source: 'country-border',
                    'source-layer': 'border',
                    paint: {
                      'line-color': '#ffffff', // Plain white
                      'line-width': 4, // Double the default width
                      'line-opacity': 1.0
                    },
                    filter: ['==', ['get', 'id'], ''] // Initially show nothing
                  })
                }
              } catch (error) {
                console.error('❌ Error adding border highlight layer:', error)
              }

              try {
                // Border post highlight layer - white circle for selected border posts
                if (!map.current.getLayer('border-post-highlight')) {
                  map.current.addLayer(getBorderPostHighlightLayerConfig())
                }
              } catch (error) {
                console.error('❌ Error adding border post highlight layer:', error)
              }

              try {
                // Zone highlight layer - solid white fill for selected zones
                if (!map.current.getLayer('zone-highlight')) {
                  const insertionPoint = map.current.getLayer('border') ? 'border' : undefined
                  map.current.addLayer({
                    id: 'zone-highlight',
                    type: 'fill',
                    source: 'country-border',
                    'source-layer': 'zones',
                    paint: {
                      'fill-color': '#ffffff', // White color for better visibility
                      'fill-opacity': 0.5 // 50% opacity for solid white fill
                    },
                    filter: ['==', ['get', 'id'], ''] // Initially show nothing
                  }, insertionPoint) // Position before border layer to ensure it's above zones but below borders
                }
              } catch (error) {
                console.error('❌ Error adding zone highlight layer:', error)
              }

              try {
                // Itinerary highlight layer - white, wider line for selected itineraries
                if (!map.current.getLayer('itinerary-highlight')) {
                  // Check if source exists before adding layer
                  if (!map.current.getSource('country-border')) {
                    console.error('❌ Cannot add itinerary highlight layer: country-border source not found')
                    throw new Error('country-border source not available')
                  }

                  map.current.addLayer({
                    id: 'itinerary-highlight',
                    type: 'line',
                    source: 'country-border',
                    'source-layer': 'itinerary',
                    paint: {
                      'line-color': '#ffffff', // White color for visibility
                      'line-width': 6, // Wider than default itinerary line (4px)
                      'line-opacity': 1.0 // Full opacity for better visibility
                    },
                    filter: ['==', ['get', 'itineraryDocId'], ''] // Initially show nothing
                  })
                }
              } catch (error) {
                console.error('❌ Failed to add itinerary highlight layer:', error)
                console.error('❌ Layer creation error details:', {
                  message: error instanceof Error ? error.message : 'Unknown error',
                  sourceExists: !!map.current.getSource('country-border'),
                  mapAvailable: !!map.current,
                  existingLayers: (() => {
                    try {
                      return map.current?.getStyle()?.layers?.map(l => l.id) || []
                    } catch (styleError) {
                      console.warn('⚠️ Could not get style layers:', styleError)
                      return []
                    }
                  })()
                })
                
                // Set error state to indicate highlighting may not work
                console.warn('⚠️ Itinerary highlighting functionality may be impaired due to layer creation failure')
              }


            }
            
            // Start the process
            addCustomLayers()
          }

          // Add click handler
          map.current.on('click', handleMapClick)

          // Add cursor pointer for clickable layers
          const clickableLayers = ['country', 'border', 'border_post', 'zones', 'itinerary']

          clickableLayers.forEach(layerId => {
            // Change cursor to pointer when hovering over clickable features
            map.current!.on('mouseenter', layerId, () => {
              map.current!.getCanvas().style.cursor = 'pointer'
            })

            // Change cursor back to default when leaving clickable features
            map.current!.on('mouseleave', layerId, () => {
              map.current!.getCanvas().style.cursor = ''
            })
          })
        }
      })

      map.current.on('error', (e) => {
        console.error('❌ Map error:', e)
        setError(e.error?.message || 'Map failed to load')
      })

    } catch (err) {
      console.error('❌ Failed to create map:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }

    return () => {
      if (map.current) {

        map.current.remove()
        map.current = null
        setIsLoaded(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-8">
          <div className="text-red-600 text-xl mb-4">⚠️ Map Error</div>
          <div className="text-gray-700">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} relative`}>
      <div ref={mapContainer} className="w-full h-full" />

      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-700">{getTranslatedLabel('loading_map', language)}</div>
          </div>
        </div>
      )}



      {/* Legend Toggle Button */}
      <button
        onClick={() => setShowLegend(!showLegend)}
        className="absolute top-20 left-4 bg-white bg-opacity-95 rounded-lg shadow-lg z-20 p-2 hover:bg-opacity-100 transition-all"
        title={showLegend ? "Hide Legend" : "Show Legend"}
      >
        <svg 
          className="w-5 h-5 text-gray-700" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6h16M4 12h16M4 18h16" 
          />
        </svg>
      </button>

      {/* Legend Panel */}
      {showLegend && (
        <div className="absolute top-20 left-16 bg-white bg-opacity-95 rounded-lg shadow-lg z-10 max-w-sm">
          <div className="p-3">
          {/* Color Scheme Selector */}
          <div className="mb-4">
            <div className="flex space-x-1 mb-3">
              <button
                onClick={() => setColorScheme('overlanding')}
                className={`px-3 py-1 text-xs rounded transition-colors ${colorScheme === 'overlanding'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {getTranslatedLabel('overlanding', language)}
              </button>
              <button
                onClick={() => setColorScheme('carnet')}
                className={`px-3 py-1 text-xs rounded transition-colors ${colorScheme === 'carnet'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {getTranslatedLabel('carnet', language)}
              </button>
              <button
                onClick={() => setColorScheme('climate')}
                className={`px-3 py-1 text-xs rounded transition-colors ${colorScheme === 'climate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {getTranslatedLabel('climate', language)}
              </button>
              <button
                onClick={() => setColorScheme('itineraries')}
                className={`px-3 py-1 text-xs rounded transition-colors ${colorScheme === 'itineraries'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {getTranslatedLabel('itineraries', language)}
              </button>
              <button
                onClick={() => setShowColorSchemeHelp(true)}
                className="ml-2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 transition-colors"
                title={getTranslatedLabel('help_button_title', language)}
              >
                ?
              </button>
            </div>

            {/* Climate Data Type Selector */}
            {colorScheme === 'climate' && (
              <div className="mb-3">
                <div className="flex space-x-1 mb-2">
                  <button
                    onClick={() => setClimateDataType('temperature')}
                    className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${climateDataType === 'temperature'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {getTranslatedLabel('temperature', language)}
                  </button>
                  <button
                    onClick={() => setClimateDataType('precipitation')}
                    className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${climateDataType === 'precipitation'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {getTranslatedLabel('precipitation', language)}
                  </button>
                </div>
              </div>
            )}

            {/* Month Selector for Climate */}
            {colorScheme === 'climate' && (
              <div className="mb-3">
                <div className="grid grid-cols-6 gap-1">
                  {getTranslatedMonths(language).map((month, index) => (
                    <button
                      key={month}
                      onClick={() => setSelectedMonth(index)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${selectedMonth === index
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colorScheme !== 'itineraries' && (
              <div className="flex items-center mb-2">
                <h3 className="text-sm font-semibold">
                  {colorScheme === 'overlanding' ? getTranslatedLabel('overlanding', language) : colorScheme === 'carnet' ? getTranslatedLabel('carnet', language) : `${getTranslatedLabel('climate', language)} - ${climateDataType === 'temperature' ? getTranslatedLabel('temperature', language) : getTranslatedLabel('precipitation', language)}`}
                </h3>
                {(colorScheme === 'overlanding' || colorScheme === 'carnet') && (
                  <button
                    onClick={() => handleLegendGroupClick(colorScheme)}
                    className="ml-2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    title="Click for detailed explanations"
                  >
                    ?
                  </button>
                )}
              </div>
            )}

            <div className="space-y-1 text-xs">
              {colorScheme === 'itineraries' ? (
                <>
                  {/* Mobile App Promotion */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-800 mb-3">
                      {getTranslatedLabel('itinerary_app_promotion', language)}
                    </p>
                    <AppStoreButtons size="small" />
                  </div>
                </>
              ) : colorScheme === 'climate' ? (
                <>
                  {climateDataType === 'temperature' ? (
                    <div className="text-gray-700 space-y-2">
                      <p className="text-xs text-gray-600 mb-3">{getTranslatedLabel('monthly_max_temperature', language)}</p>
                      <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(16,39,69)' }}></div>
                          <span>-45°C</span>
                        </div>
                        <span className="text-gray-500">-50°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(69,117,180)' }}></div>
                          <span>-20°C</span>
                        </div>
                        <span className="text-gray-500">-4°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(153,196,225)' }}></div>
                          <span>-10°C</span>
                        </div>
                        <span className="text-gray-500">14°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(219,237,237)' }}></div>
                          <span>0°C</span>
                        </div>
                        <span className="text-gray-500">32°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(255,243,182)' }}></div>
                          <span>10°C</span>
                        </div>
                        <span className="text-gray-500">50°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(253,195,116)' }}></div>
                          <span>20°C</span>
                        </div>
                        <span className="text-gray-500">68°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(241,104,65)' }}></div>
                          <span>30°C</span>
                        </div>
                        <span className="text-gray-500">86°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(115,27,21)' }}></div>
                          <span>45°C</span>
                        </div>
                        <span className="text-gray-500">113°F</span>
                      </div>
                    </div>
                    </div>
                  ) : (
                    <div className="text-gray-700 space-y-2">
                      <p className="text-xs text-gray-600 mb-3">{getTranslatedLabel('monthly_precipitation', language)} (mm)</p>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(255,255,204)' }}></div>
                          <span>0 mm</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(199,233,180)' }}></div>
                          <span>10 mm</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(65,182,196)' }}></div>
                          <span>50 mm</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(37,52,148)' }}></div>
                          <span>200 mm</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(197,27,125)' }}></div>
                          <span>800 mm</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(128,0,38)' }}></div>
                          <span>2200 mm</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : colorScheme === 'overlanding' ? (
                <div 
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                  onClick={() => handleLegendGroupClick('overlanding')}
                  title="Click for detailed explanations"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#16a34a' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('open', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#eab308' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('restricted_access', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#dc2626' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('war_dangerous', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1a1a1a' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('forbidden', language)}</span>
                  </div>
                </div>
              ) : (
                <div 
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                  onClick={() => handleLegendGroupClick('carnet')}
                  title="Click for detailed explanations"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#9ca3af' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('not_required', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#dc8dc7' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('required_in_some_situations', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#0c15c3' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('mandatory', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#000000' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('access_forbidden', language)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {colorScheme === 'overlanding' && (
            <>
              <div 
                className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                onClick={() => handleLegendGroupClick('borders')}
                title="Click for detailed explanations"
              >
                <div className="flex items-center mb-2">
                  <h3 className="text-sm font-semibold">{getTranslatedLabel('borders', language)}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLegendGroupClick('borders')
                    }}
                    className="ml-2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    title="Click for detailed explanations"
                  >
                    ?
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-2" style={{ backgroundColor: '#15803d' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('open', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-2" style={{ backgroundColor: '#eab308' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('restricted', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-2" style={{ backgroundColor: '#ef4444' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('closed', language)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBorderPosts}
                      onChange={(e) => setShowBorderPosts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <h3 className="text-sm font-semibold ml-2">{getTranslatedLabel('border_posts', language)}</h3>
                  <button
                    onClick={() => handleLegendGroupClick('border_posts')}
                    className="ml-2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    title="Click for detailed explanations"
                  >
                    ?
                  </button>
                </div>
                <div 
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors space-y-1 text-xs"
                  onClick={() => handleLegendGroupClick('border_posts')}
                  title="Click for detailed explanations"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('open', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('bilateral', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('restricted', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('closed', language)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div 
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                  onClick={() => handleLegendGroupClick('zones')}
                  title="Click for detailed explanations"
                >
                  <div className="flex items-center mb-2">
                    <h3 className="text-sm font-semibold">{getTranslatedLabel('restricted_areas', language)}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLegendGroupClick('zones')
                      }}
                      className="ml-2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 transition-colors"
                      title="Click for detailed explanations"
                    >
                      ?
                    </button>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-sm" style={{ 
                        background: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
                        border: '1px solid #ef4444'
                      }}></div>
                      <span className="text-gray-700">{getTranslatedLabel('zone_closed', language)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-sm" style={{ 
                        background: 'repeating-linear-gradient(45deg, #000000, #000000 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
                        border: '1px solid #000000'
                      }}></div>
                      <span className="text-gray-700">{getTranslatedLabel('zone_guide_escort', language)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-sm" style={{ 
                        background: 'repeating-linear-gradient(45deg, #3b82f6, #3b82f6 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
                        border: '1px solid #3b82f6'
                      }}></div>
                      <span className="text-gray-700">{getTranslatedLabel('zone_permit', language)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-sm" style={{ 
                        background: 'repeating-linear-gradient(45deg, #9ca3af, #9ca3af 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
                        border: '1px solid #9ca3af'
                      }}></div>
                      <span className="text-gray-700">{getTranslatedLabel('zone_restrictions', language)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      )}

      {/* Legend Explanation Popup */}
      <LegendExplanationPopup
        isOpen={explanationPopup.isOpen}
        onClose={closeExplanationPopup}
        category={explanationPopup.category}
      />

      {/* Color Scheme Help Popup */}
      <ColorSchemeHelpPopup
        isOpen={showColorSchemeHelp}
        onClose={() => setShowColorSchemeHelp(false)}
      />
    </div>
  )
}