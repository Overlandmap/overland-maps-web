'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import 'maplibre-gl/dist/maplibre-gl.css'

import { useLanguage } from '../contexts/LanguageContext'
import { useColorScheme } from '../contexts/ColorSchemeContext'
import { getTranslatedLabel } from '../lib/i18n'
import { COLOR_SCHEMES } from '../lib/color-expressions'


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

  // Store selected country ID in a ref for paint property updates
  const selectedCountryIdRef = useRef<string | null>(null)
  // Store selected zone ID in a ref for pattern updates
  const selectedZoneIdRef = useRef<string | null>(null)
  // Store updateMapColors ref to avoid circular dependencies
  const updateMapColorsRef = useRef<((scheme: ColorScheme) => void) | null>(null)
  // Track previous language to detect changes
  const previousLanguageRef = useRef<string>(language)
  // Track if initial colors have been applied
  const initialColorsAppliedRef = useRef<boolean>(false)
  // Track if initial legend visibility has been set
  const initialLegendSetRef = useRef<boolean>(false)

  // Clear all highlights function
  const clearAllHighlights = useCallback(() => {
    if (!map.current) return

    selectedCountryIdRef.current = null
    selectedZoneIdRef.current = null
    
    // Clear border highlights
    if (map.current.getLayer('border-highlight')) {
      map.current.setFilter('border-highlight', ['==', ['get', 'id'], ''])
    }
    // Clear border post highlights
    if (map.current.getLayer('border-post-highlight')) {
      map.current.setFilter('border-post-highlight', ['==', ['get', 'id'], ''])
    }
    // Clear zone highlights
    if (map.current.getLayer('zone-highlight')) {
      map.current.setFilter('zone-highlight', ['==', ['get', 'id'], ''])
      // Reset zone highlight paint properties to default
      map.current.setPaintProperty('zone-highlight', 'fill-color', '#ffffff')
      map.current.setPaintProperty('zone-highlight', 'fill-opacity', 0.5)
    }
    // Reset country colors to base (no selection)
    if (updateMapColorsRef.current) {
      updateMapColorsRef.current(colorScheme)
    }
  }, [colorScheme])

  // Highlighting functions
  const highlightBorder = useCallback((borderId: string) => {
    if (!map.current || !borderId) return

    console.log('🎯 Highlighting border:', borderId)
    // Clear all other highlights first
    clearAllHighlights()
    // Highlight the selected border (white, wider line)
    if (map.current.getLayer('border-highlight')) {
      map.current.setFilter('border-highlight', ['==', ['get', 'id'], borderId])
    }
  }, [clearAllHighlights])

  const highlightCountry = useCallback((countryId: string) => {
    if (!map.current || !countryId) return

    console.log('🎯 Highlighting country:', countryId)
    
    // Clear all other highlights first (but not country colors)
    if (map.current.getLayer('border-highlight')) {
      map.current.setFilter('border-highlight', ['==', ['get', 'id'], ''])
    }
    if (map.current.getLayer('border-post-highlight')) {
      map.current.setFilter('border-post-highlight', ['==', ['get', 'id'], ''])
    }
    
    // Store the selected country ID and update colors
    selectedCountryIdRef.current = countryId
    
    // Update colors using the ref
    if (updateMapColorsRef.current) {
      updateMapColorsRef.current(colorScheme)
    }
  }, [colorScheme])

  const highlightBorderPost = useCallback((borderPostId: string) => {
    if (!map.current || !borderPostId) return

    console.log('🎯 Highlighting border post:', borderPostId)
    // Clear all other highlights first
    clearAllHighlights()
    // Highlight the selected border post (white circle)
    if (map.current.getLayer('border-post-highlight')) {
      map.current.setFilter('border-post-highlight', ['==', ['get', 'id'], borderPostId])
    }
  }, [clearAllHighlights])

  const highlightZone = useCallback((zoneId: string) => {
    if (!map.current || !zoneId) return

    // Clear all other highlights first
    clearAllHighlights()
    
    // Store the selected zone ID
    selectedZoneIdRef.current = zoneId
    
    // Use the zone-highlight layer with a more visible highlight
    if (map.current.getLayer('zone-highlight')) {
      map.current.setFilter('zone-highlight', ['==', ['get', 'id'], zoneId])
      
      // Make the highlight more visible by updating paint properties
      map.current.setPaintProperty('zone-highlight', 'fill-color', '#ffffff')
      map.current.setPaintProperty('zone-highlight', 'fill-opacity', 0.5)
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
      console.log(`✅ Zoomed to location [${lng}, ${lat}] with zoom level ${zoom}`)
    } catch (error) {
      console.error('Failed to zoom to location:', error)
    }
  }, [])

  // Handle map clicks
  const handleMapClick = useCallback((e: maplibregl.MapMouseEvent) => {
    if (!map.current) return

    const features = map.current.queryRenderedFeatures(e.point)

    // Look for border post features FIRST (highest priority - smallest targets)
    const borderPostFeature = features.find(f => f.source === 'country-border' && f.sourceLayer === 'border_post')
    if (borderPostFeature) {
      console.log('📍 Border post clicked:', borderPostFeature.properties)
      const borderPostId = borderPostFeature.properties?.id
      if (borderPostId) {
        highlightBorderPost(borderPostId) // Highlight the clicked border post (white circle)
        if (onBorderPostClick) {
          console.log('🔄 Calling onBorderPostClick with:', borderPostId)
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
    // Look for itinerary features THIRD (high priority - travel routes)
    const itineraryFeature = features.find(f => f.source === 'country-border' && f.sourceLayer === 'itinerary')
    if (itineraryFeature) {
      // Use the Firestore document ID (stored in 'itineraryDocId' property)
      // The 'itineraryDocId' property contains the Firestore document ID like "0ANgc4146W8cMQqwfaB0"
      // The 'itineraryId' property contains the human-readable ID like "G6"
      const itineraryDocId = itineraryFeature.properties?.itineraryDocId
      
      if (itineraryDocId) {
        // Clear all other highlights first
        clearAllHighlights()
        if (onItineraryClick) {
          onItineraryClick(itineraryDocId, null, itineraryFeature)
        }
      } else {
        console.warn('⚠️ Itinerary feature missing document ID:', itineraryFeature.properties)
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
          console.log('🔄 Calling onBorderClick with:', borderId)
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
          console.log('🔄 Calling onCountryClick with:', countryId)
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
      ], carnetColors['-1'].color,
      // Handle null, 0, or missing carnet field - gray (no carnet required)
      ['any',
        ['==', ['get', 'carnet'], null],
        ['==', ['get', 'carnet'], 0],
        ['==', ['get', 'carnet'], '0'],
        ['!', ['has', 'carnet']]
      ], carnetColors[0].color,
      // Handle carnet value 1 (Required in Some Situations) - bright purple
      ['any',
        ['==', ['get', 'carnet'], 1],
        ['==', ['get', 'carnet'], '1']
      ], carnetColors[1].color,
      // Handle carnet value 2 (Mandatory) - bright blue
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
      console.warn('⚠️ Country layer not found for color update')
      return
    }

    const baseColorExpression = scheme === 'overlanding'
      ? generateOverlandingColorExpression()
      : generateCarnetColorExpression()

    try {
      // If a country is selected, create a conditional expression
      if (selectedCountryIdRef.current) {
        const darkerColorExpression = generateDarkerColorExpression(scheme)
        const conditionalColorExpression = [
          'case',
            ['==', ['get', 'ADM0_A3'], selectedCountryIdRef.current],
          darkerColorExpression,
          baseColorExpression
        ]
        map.current.setPaintProperty('country', 'fill-color', conditionalColorExpression as any)
        map.current.setPaintProperty('country', 'fill-opacity', 0.6)
      } else {
        // No selection, use base colors
        map.current.setPaintProperty('country', 'fill-color', baseColorExpression as any)
        map.current.setPaintProperty('country', 'fill-opacity', 0.6)
      }

      console.log(`� Map  colors updated to ${scheme} scheme`)
    } catch (error) {
      console.error('❌ Failed to update map colors:', error)
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
    
    console.log(`🔄 Color scheme changed from ${previousScheme} to: ${colorScheme}`)
    previousColorSchemeRef.current = colorScheme

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const supportedLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'ru']
    
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
      console.log('🗺️ Switching back to basemap style:', styleUrl)
      
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
          console.log('🔄 Re-adding custom layers after style switch')
          

        
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
        
        const greyPattern = createDiagonalPattern('rgba(156, 163, 175, 1)')
        if (greyPattern && !map.current.hasImage('diagonal-stripe-grey')) {
          map.current.addImage('diagonal-stripe-grey', greyPattern)
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
        if (greyHighlightPattern && !map.current.hasImage('diagonal-stripe-grey-highlight')) {
          map.current.addImage('diagonal-stripe-grey-highlight', greyHighlightPattern)
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
              ['==', ['get', 'type'], 2], 'diagonal-stripe-grey',
              ['==', ['get', 'type'], 3], 'diagonal-stripe-blue',
              'diagonal-stripe-grey' // Default
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
          map.current.addLayer({
          id: 'border_post',
          type: 'circle',
          source: 'country-border',
          'source-layer': 'border_post',
          paint: {
            'circle-color': [
              'case',
              ['==', ['get', 'is_open'], 1], '#3b82f6',
              ['==', ['get', 'is_open'], 2], '#22c55e',
              ['==', ['get', 'is_open'], 3], '#eab308',
              '#ef4444'
            ],
            'circle-radius': 6,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff'
          }
          })
        }
        
        // Re-add itinerary layer (only if it doesn't exist)
        if (!map.current.getLayer('itinerary')) {
          map.current.addLayer({
          id: 'itinerary',
          type: 'line',
          source: 'country-border',
          'source-layer': 'itinerary',
          paint: {
            'line-color': '#ef4444',
            'line-width': 4,
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
          map.current.addLayer({
          id: 'border-post-highlight',
          type: 'circle',
          source: 'country-border',
          'source-layer': 'border_post',
          paint: {
            'circle-color': '#ffffff',
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#1e40af'
          },
          filter: ['==', ['get', 'id'], '']
          })
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
        

        
          console.log('✅ Custom layers re-added')
          
          // Wait a tick for layers to be fully registered, then apply colors and visibility
          setTimeout(() => {
            if (map.current && map.current.getLayer('country')) {
              updateMapColors(colorScheme)
              
              // If switching to itineraries mode, explicitly set layer visibility
              if (colorScheme === 'itineraries') {
                // Hide overlanding layers
                if (map.current.getLayer('country')) {
                  map.current.setLayoutProperty('country', 'visibility', 'none')
                }
                if (map.current.getLayer('border')) {
                  map.current.setLayoutProperty('border', 'visibility', 'none')
                }
                if (map.current.getLayer('border-highlight')) {
                  map.current.setLayoutProperty('border-highlight', 'visibility', 'none')
                }
                if (map.current.getLayer('zones')) {
                  map.current.setLayoutProperty('zones', 'visibility', 'none')
                }
                if (map.current.getLayer('zone-highlight')) {
                  map.current.setLayoutProperty('zone-highlight', 'visibility', 'none')
                }
                if (map.current.getLayer('border_post')) {
                  map.current.setLayoutProperty('border_post', 'visibility', 'none')
                }
                if (map.current.getLayer('border-post-highlight')) {
                  map.current.setLayoutProperty('border-post-highlight', 'visibility', 'none')
                }
                
                // Show itineraries layers
                if (map.current.getLayer('itinerary')) {
                  map.current.setLayoutProperty('itinerary', 'visibility', 'visible')
                }
                if (map.current.getLayer('hillshade')) {
                  map.current.setLayoutProperty('hillshade', 'visibility', 'visible')
                }
                
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
    const supportedLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'ru']
    
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
      // For overlanding/carnet, we need to reload basemap which will trigger re-adding layers
      const basemapLangSuffix = supportedLanguages.includes(language) && language !== 'en' ? `-${language}` : ''
      const styleUrl = `${basePath}/styles/basemap${basemapLangSuffix}.json`
      console.log('🌐 Reloading basemap style for language change:', styleUrl)
      
      // Restore position after style loads
      map.current.once('style.load', () => {
        if (map.current) {
          map.current.setCenter(currentCenter)
          map.current.setZoom(currentZoom)
        }
      })
      map.current.setStyle(styleUrl)
      
      // Note: The 'load' event handler will re-add all custom layers automatically
    }
  }, [language, isLoaded, colorScheme])

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
        highlightCountry(selectedCountryId)
      } else if (selectedBorderId) {
        console.log('🎯 Prop-driven border highlight:', selectedBorderId)
        highlightBorder(selectedBorderId)
      } else if (selectedBorderPostId) {
        console.log('🎯 Prop-driven border post highlight:', selectedBorderPostId)
        highlightBorderPost(selectedBorderPostId)
      } else if (selectedZoneId) {
        highlightZone(selectedZoneId)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      if (duration > 100) {
        console.warn(`⚠️ Prop-driven highlight took ${duration.toFixed(2)}ms (target: <100ms)`)
      } else {
        console.log(`✅ Prop-driven highlight applied in ${duration.toFixed(2)}ms`)
      }
    } catch (error) {
      console.error('❌ Error applying prop-driven highlight:', error)
    }
  }, [isLoaded, selectedCountryId, selectedBorderId, selectedBorderPostId, selectedZoneId, highlightCountry, highlightBorder, highlightBorderPost, highlightZone, clearAllHighlights])

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
            console.log(`🔄 Enhanced itinerary layer management - mode: ${colorScheme}`)
            
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
                  console.log(`✅ Hidden ${layerId} for itineraries mode`)
                }
              }
              
              // 3. Show itinerary layers (only if they exist)
              if (map.current.getLayer('itinerary')) {
                map.current.setLayoutProperty('itinerary', 'visibility', 'visible')
                console.log('✅ Itinerary layer shown')
              }
              
              if (map.current.getLayer('itinerary-labels')) {
                map.current.setLayoutProperty('itinerary-labels', 'visibility', 'visible')
                console.log('✅ Itinerary labels layer shown')
              }
              
              // 4. Configure hillshade for itineraries mode
              if (map.current.getLayer('hillshade')) {
                map.current.setLayoutProperty('hillshade', 'visibility', 'visible')
                console.log('✅ Hillshade shown for itineraries mode')
              }
              
              // 5. Enable terrain for itineraries mode
              if (map.current.getSource('terrainSource')) {
                try {
                  map.current.setTerrain({
                    source: 'terrainSource',
                    exaggeration: 1
                  })
                  console.log('✅ Terrain enabled for itineraries mode')
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
                  console.log(`✅ Shown ${layerId} for ${colorScheme} mode`)
                }
              }
              
              // 3. Apply appropriate colors for overlanding/carnet modes
              if (colorScheme === 'overlanding' || colorScheme === 'carnet') {
                // Small delay to ensure layers are visible before applying colors
                setTimeout(() => {
                  if (map.current && map.current.getLayer('country')) {
                    updateMapColors(colorScheme)
                    console.log(`✅ Applied ${colorScheme} colors`)
                  }
                }, 50)
              }
            }
            
            console.log(`✅ Enhanced itinerary layer management completed for ${colorScheme} mode`)
            
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

  // Performance monitoring for layer visibility changes
  // Requirements: 3.1 - Add metrics for debugging performance issues
  useEffect(() => {
    if (!isLoaded) return

    // Log performance stats periodically (every 30 seconds) for debugging
    const performanceLogInterval = setInterval(() => {
      import('../lib/layer-visibility-utils').then(({ getLayerVisibilityPerformanceStats }) => {
        const stats = getLayerVisibilityPerformanceStats();
        
        // Only log if there have been operations
        if (stats.totalOperations > 0) {
          console.group('📊 Layer Visibility Performance (Periodic Report)');
          console.log(`Operations: ${stats.totalOperations} (${stats.successfulOperations} successful, ${stats.failedOperations} failed)`);
          console.log(`Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
          console.log(`Slow Operations: ${stats.slowOperations} (${stats.slowOperationPercentage.toFixed(1)}%)`);
          
          if (stats.slowOperationPercentage > 20) {
            console.warn(`⚠️ High percentage of slow operations detected: ${stats.slowOperationPercentage.toFixed(1)}%`);
          }
          
          console.groupEnd();
        }
      }).catch(() => {
        // Ignore import errors
      });
    }, 30000); // 30 seconds

    return () => {
      clearInterval(performanceLogInterval);
    };
  }, [isLoaded])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    console.log('🗺️ Initializing simple map...')

    try {
      // Register PMTiles protocol
      const protocol = new Protocol()
      maplibregl.addProtocol('pmtiles', protocol.tile)
      console.log('✅ PMTiles protocol registered')

      // Load style from JSON file based on color scheme and language
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const supportedLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'ru']
      let styleUrl: string
      
      if (colorScheme === 'climate') {
        // Load climate style with language support - always include language suffix for climate
        const climateLangSuffix = supportedLanguages.includes(language) ? `-${language}` : '-en'
        styleUrl = `${basePath}/styles/climate${climateLangSuffix}.json`
        console.log('📄 Loading climate style:', styleUrl, 'for language:', language)
      } else {
        // Load basemap style with language support for overlanding/carnet modes
        const basemapLangSuffix = supportedLanguages.includes(language) && language !== 'en' ? `-${language}` : ''
        styleUrl = `${basePath}/styles/basemap${basemapLangSuffix}.json`
        console.log('📄 Loading basemap style:', styleUrl, 'for language:', language)
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
        console.log('✅ Simple map loaded')

        // Call onMapReady with map interactions BEFORE setting isLoaded
        // This ensures the interactions are available before any effects that depend on isLoaded
        if (onMapReady) {
          const interactions = {
            clearAllHighlights,
            highlightCountry,
            highlightBorder,
            highlightBorderPost,
            highlightZone,
            zoomToLocation
          }
          console.log('🔄 Calling onMapReady with interactions:', Object.keys(interactions))
          onMapReady(interactions)
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
            const greyPattern = createDiagonalPattern('rgba(156, 163, 175, 1)')
            if (greyPattern && !map.current.hasImage('diagonal-stripe-grey')) {
              map.current.addImage('diagonal-stripe-grey', greyPattern)
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
            if (greyHighlightPattern && !map.current.hasImage('diagonal-stripe-grey-highlight')) {
              map.current.addImage('diagonal-stripe-grey-highlight', greyHighlightPattern)
            }
            
            // Type 3: Restrictions - Blue stripes with gray background
            const blueHighlightPattern = createHighlightedDiagonalPattern('rgba(59, 130, 246, 1)')
            if (blueHighlightPattern && !map.current.hasImage('diagonal-stripe-blue-highlight')) {
              map.current.addImage('diagonal-stripe-blue-highlight', blueHighlightPattern)
            }

            console.log('✅ Colored stripe patterns created (red, black, grey, blue) with highlighted versions')

            console.log('➕ Adding country-border source')
            map.current.addSource('country-border', {
              type: 'vector',
              url: 'pmtiles://https://overlanding.io/country-borders.pmtiles'
            })

            console.log('➕ Adding hillshade source')
            map.current.addSource('hillshadeSource', {
              type: 'raster-dem',
              url: 'https://tiles.mapterhorn.com/tilejson.json'
            })

            console.log('➕ Adding terrain source')
            map.current.addSource('terrainSource', {
              type: 'raster-dem',
              url: 'https://tiles.mapterhorn.com/tilejson.json'
            })

          // Add hillshade layer (above basemap, below all other layers) - insert before waterway_river
          map.current.addLayer({
            id: 'hillshade',
            type: 'hillshade',
            source: 'hillshadeSource',
            layout: {
              'visibility': colorScheme === 'itineraries' ? 'visible' : 'none'
            }
          }, 'waterway_river')

          // Add country layer (bottom layer) - insert before waterway_river
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

          // Add zones layer (restricted areas) with color-coded diagonal stripe patterns - above countries, before waterway
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
                ['==', ['get', 'type'], 3], 'diagonal-stripe-grey',
                'diagonal-stripe-grey' // Default
              ],
              'fill-opacity': 0.7
            }
          }, 'waterway_river')
          
          console.log('✅ Zones layer added with diagonal stripe pattern')
          
          // Debug: Check if zones layer has features
          setTimeout(() => {
            if (map.current) {
              const features = map.current.querySourceFeatures('country-border', {
                sourceLayer: 'zones'
              })
              console.log('🔍 Zones features found:', features.length)
              if (features.length > 0) {
                console.log('🔍 Sample zone feature:', features[0])
              }
            }
          }, 2000)

          // Add border layer (middle layer)
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

          // Add border post layer (top layer - most important for clicking)
          map.current.addLayer({
            id: 'border_post',
            type: 'circle',
            source: 'country-border',
            'source-layer': 'border_post',
            paint: {
              'circle-color': [
                'case',
                ['==', ['get', 'is_open'], 1], '#3b82f6',  // Bilateral - blue
                ['==', ['get', 'is_open'], 2], '#22c55e',  // Open - green
                ['==', ['get', 'is_open'], 3], '#eab308',  // Restrictions - yellow
                '#ef4444'  // Closed (0) or null - red (default)
              ],
              'circle-radius': 6,
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#ffffff'
            }
          })

          console.log('✅ PMTiles layers added: country, zones, border, border_post')

          // Add itinerary layer (for itineraries mode)
          map.current.addLayer({
            id: 'itinerary',
            type: 'line',
            source: 'country-border',
            'source-layer': 'itinerary',
            paint: {
              'line-color': '#ef4444',
              'line-width': 4,
              'line-opacity': 0.5
            },
            layout: {
              'visibility': colorScheme === 'itineraries' ? 'visible' : 'none'
            }
          })

          console.log('✅ Itinerary layer added')

          // Add highlight layers (on top of regular layers)
          // Border highlight layer - white, wider line for selected borders
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

          // Border post highlight layer - white circle for selected border posts
          map.current.addLayer({
            id: 'border-post-highlight',
            type: 'circle',
            source: 'country-border',
            'source-layer': 'border_post',
            paint: {
              'circle-color': '#ffffff',
              'circle-radius': 8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#1e40af'
            },
            filter: ['==', ['get', 'id'], ''] // Initially show nothing
          })

          // Zone highlight layer - solid white fill for selected zones
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
          }, 'border') // Position before border layer to ensure it's above zones but below borders

          console.log('✅ Highlight layers added: border-highlight, border-post-highlight, zone-highlight')
          } else {
            console.log('🌡️ Climate mode: Using climate.json style, no additional layers needed')
          }

          // Add click handler
          map.current.on('click', handleMapClick)

          // Add cursor pointer for clickable layers
          const clickableLayers = ['country', 'border', 'border_post', 'zones', 'itinerary']

          clickableLayers.forEach(layerId => {
            // Change cursor to pointer when hovering over clickable features
            map.current!.on('mouseenter', layerId, (e) => {
              console.log(`🖱️ Mouse entered ${layerId}:`, e.features?.[0]?.properties)
              map.current!.getCanvas().style.cursor = 'pointer'
            })

            // Change cursor back to default when leaving clickable features
            map.current!.on('mouseleave', layerId, (e) => {
              console.log(`🖱️ Mouse left ${layerId}`)
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
        console.log('🧹 Cleaning up simple map on unmount')
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
        className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg shadow-lg z-20 p-2 hover:bg-opacity-100 transition-all"
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
        <div className="absolute top-4 left-16 bg-white bg-opacity-95 rounded-lg shadow-lg z-10 max-w-sm">
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
                Climate
              </button>
              <button
                onClick={() => setColorScheme('itineraries')}
                className={`px-3 py-1 text-xs rounded transition-colors ${colorScheme === 'itineraries'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Itineraries
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
                    Temperature
                  </button>
                  <button
                    onClick={() => setClimateDataType('precipitation')}
                    className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${climateDataType === 'precipitation'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Precipitation
                  </button>
                </div>
              </div>
            )}

            {/* Month Selector for Climate */}
            {colorScheme === 'climate' && (
              <div className="mb-3">
                <div className="grid grid-cols-6 gap-1">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
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

            <h3 className="text-sm font-semibold mb-2">
              {colorScheme === 'overlanding' ? 'Overlanding' : colorScheme === 'carnet' ? 'Carnet de passage en Douane (CpD)' : colorScheme === 'itineraries' ? 'Travel Itineraries' : `Climate - ${climateDataType === 'temperature' ? 'Temperature' : 'Precipitation'}`}
            </h3>

            <div className="space-y-1 text-xs">
              {colorScheme === 'itineraries' ? (
                <>
                  <div className="text-gray-700 space-y-2">
                    <p className="text-xs text-gray-600 mb-3">Travel routes and itineraries</p>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-2 bg-red-500 opacity-50 rounded-sm"></div>
                        <span className="text-gray-700">Itinerary Route</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : colorScheme === 'climate' ? (
                <>
                  {climateDataType === 'temperature' ? (
                    <div className="text-gray-700 space-y-2">
                      <p className="text-xs text-gray-600 mb-3">Monthly average temperature (°C)</p>
                      <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(111,159,205)' }}></div>
                          <span>-20°C</span>
                        </div>
                        <span className="text-gray-500">-4°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(189,222,236)' }}></div>
                          <span>-10°C</span>
                        </div>
                        <span className="text-gray-500">14°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(243,246,212)' }}></div>
                          <span>0°C</span>
                        </div>
                        <span className="text-gray-500">32°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(254,227,149)' }}></div>
                          <span>10°C</span>
                        </div>
                        <span className="text-gray-500">50°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: 'rgb(250,153,87)' }}></div>
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
                    </div>
                    </div>
                  ) : (
                    <div className="text-gray-700 space-y-2">
                      <p className="text-xs text-gray-600 mb-3">Monthly precipitation (mm)</p>
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
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#16a34a' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('open', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#eab308' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('restricted_access', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#dc2626' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('war_dangerous', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1a1a1a' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('forbidden', language)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#9ca3af' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('not_required', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ec05f8' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('required_in_some_situations', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#0732e2' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('mandatory', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#000000' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('access_forbidden', language)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {colorScheme === 'overlanding' && (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-2">{getTranslatedLabel('borders', language)}</h3>
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
                </div>
                <div className="space-y-1 text-xs">
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
                    <span className="text-gray-700">{getTranslatedLabel('restrictions_apply', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('closed', language)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">{getTranslatedLabel('restricted_areas', language)}</h3>
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
            </>
          )}
          </div>
        </div>
      )}
    </div>
  )
}