'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import 'maplibre-gl/dist/maplibre-gl.css'
import TopMenu from './TopMenu'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslatedLabel } from '../lib/i18n'


type ColorScheme = 'overlanding' | 'carnet' | 'climate'

interface SimpleMapContainerProps {
  className?: string
  onCountryClick?: (iso3: string, countryData: any, feature: any) => void
  onBorderClick?: (borderId: string, borderData: any, feature: any) => void
  onBorderPostClick?: (borderPostId: string, borderPostData: any, feature: any) => void
  onZoneClick?: (zoneId: string, zoneData: any, feature: any) => void
  onSelectionClear?: () => void
  onMapReady?: (interactions: any) => void
  // Selection props for URL-driven highlighting
  selectedCountryId?: string | null
  selectedBorderId?: string | null
  selectedBorderPostId?: string | null
}

export default function SimpleMapContainer({
  className = "map-container",
  onCountryClick,
  onBorderClick,
  onBorderPostClick,
  onZoneClick,
  onSelectionClear,
  onMapReady,
  selectedCountryId,
  selectedBorderId,
  selectedBorderPostId
}: SimpleMapContainerProps) {
  const { language } = useLanguage()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [colorScheme, setColorScheme] = useState<ColorScheme>('overlanding')
  const [showBorderPosts, setShowBorderPosts] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<number>(0) // 0 = January, 11 = December
  const [climateDataType, setClimateDataType] = useState<'temperature' | 'precipitation'>('temperature')

  // Store selected country ID in a ref for paint property updates
  const selectedCountryIdRef = useRef<string | null>(null)
  // Store updateMapColors ref to avoid circular dependencies
  const updateMapColorsRef = useRef<((scheme: ColorScheme) => void) | null>(null)

  // Clear all highlights function
  const clearAllHighlights = useCallback(() => {
    if (!map.current) return

    console.log('🧹 Clearing all highlights')
    selectedCountryIdRef.current = null
    
    // Clear border highlights
    if (map.current.getLayer('border-highlight')) {
      map.current.setFilter('border-highlight', ['==', ['get', 'id'], ''])
    }
    // Clear border post highlights
    if (map.current.getLayer('border-post-highlight')) {
      map.current.setFilter('border-post-highlight', ['==', ['get', 'id'], ''])
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
    console.log('🖱️ Map clicked at:', e.lngLat, 'features found:', features.length)

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
      console.log('🚫 Zone clicked:', zoneFeature.properties)
      const zoneId = zoneFeature.properties?.id
      if (zoneId && onZoneClick) {
        console.log('🔄 Calling onZoneClick with:', zoneId)
        onZoneClick(zoneId, null, zoneFeature)
      }
      return
    }

    // Look for border features THIRD (medium priority)
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
    console.log('🧹 No features clicked, clearing selection')
    clearAllHighlights()
    if (onSelectionClear) {
      onSelectionClear()
    }
  }, [onCountryClick, onBorderClick, onBorderPostClick, onZoneClick, onSelectionClear, highlightBorder, highlightCountry, highlightBorderPost, clearAllHighlights])


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
    return [
      'case',
      // Handle overlanding value 0 (Forbidden) - black
      ['any',
        ['==', ['get', 'overlanding'], 0],
        ['==', ['get', 'overlanding'], '0']
      ], '#1a1a1a',
      // Handle overlanding value 1 (War/Dangerous) - red
      ['any',
        ['==', ['get', 'overlanding'], 1],
        ['==', ['get', 'overlanding'], '1']
      ], '#dc2626',
      // Handle overlanding value 2 (Restricted) - yellow
      ['any',
        ['==', ['get', 'overlanding'], 2],
        ['==', ['get', 'overlanding'], '2']
      ], '#eab308',
      // Handle overlanding value 3 (Open) - green
      ['any',
        ['==', ['get', 'overlanding'], 3],
        ['==', ['get', 'overlanding'], '3']
      ], '#16a34a',
      // Fallback to default (Unknown)
      '#9ca3af'
    ]
  }, [])

  // Generate color expression for carnet scheme
  const generateCarnetColorExpression = useCallback(() => {
    return [
      'case',
      // Handle carnet value -1 (Access Forbidden) - black
      ['any',
        ['==', ['get', 'carnet'], -1],
        ['==', ['get', 'carnet'], '-1']
      ], '#000000',
      // Handle null, 0, or missing carnet field - gray (no carnet required)
      ['any',
        ['==', ['get', 'carnet'], null],
        ['==', ['get', 'carnet'], 0],
        ['==', ['get', 'carnet'], '0'],
        ['!', ['has', 'carnet']]
      ], '#9ca3af',
      // Handle carnet value 1 (Required in Some Situations) - bright purple
      ['any',
        ['==', ['get', 'carnet'], 1],
        ['==', ['get', 'carnet'], '1']
      ], '#ec05f8',
      // Handle carnet value 2 (Mandatory) - bright blue
      ['any',
        ['==', ['get', 'carnet'], 2],
        ['==', ['get', 'carnet'], '2']
      ], '#0732e2',
      // Fallback to default (no carnet required - gray)
      '#9ca3af'
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
          [
            'any',
            ['==', ['get', 'ADM0_A3'], selectedCountryIdRef.current],
            ['==', ['get', 'ISO_A3'], selectedCountryIdRef.current],
            ['==', ['get', 'id'], selectedCountryIdRef.current]
          ],
          darkerColorExpression,
          baseColorExpression
        ]
        map.current.setPaintProperty('country', 'fill-color', conditionalColorExpression as any)
        map.current.setPaintProperty('country', 'fill-opacity', 0.8)
      } else {
        // No selection, use base colors
        map.current.setPaintProperty('country', 'fill-color', baseColorExpression as any)
        map.current.setPaintProperty('country', 'fill-opacity', 0.6)
      }

      console.log(`🎨 Map colors updated to ${scheme} scheme`)
    } catch (error) {
      console.error('❌ Failed to update map colors:', error)
    }
  }, [generateOverlandingColorExpression, generateCarnetColorExpression, generateDarkerColorExpression])

  // Store updateMapColors in ref for use by clearAllHighlights and highlightCountry
  useEffect(() => {
    updateMapColorsRef.current = updateMapColors
  }, [updateMapColors])

  // Handle color scheme change
  const handleColorSchemeChange = useCallback((scheme: ColorScheme) => {
    console.log(`🔄 Changing color scheme to: ${scheme}`)
    setColorScheme(scheme)

    // Only update colors if map is loaded
    if (isLoaded) {
      updateMapColors(scheme)
    } else {
      console.warn('⚠️ Map not loaded yet, color scheme will be applied when ready')
    }
  }, [updateMapColors, isLoaded])



  // Apply color scheme when map becomes loaded
  useEffect(() => {
    if (isLoaded && map.current) {
      console.log(`🎨 Applying ${colorScheme} color scheme to loaded map`)
      updateMapColors(colorScheme)
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
  }, [isLoaded, selectedCountryId, selectedBorderId, selectedBorderPostId, highlightCountry, highlightBorder, highlightBorderPost, clearAllHighlights])

  // Toggle border posts layer visibility
  useEffect(() => {
    if (!map.current || !isLoaded) return

    // Hide border posts when carnet or climate is selected, or when toggle is off
    const visibility = (showBorderPosts && colorScheme !== 'carnet' && colorScheme !== 'climate') ? 'visible' : 'none'

    if (map.current.getLayer('border_post')) {
      map.current.setLayoutProperty('border_post', 'visibility', visibility)
    }
    if (map.current.getLayer('border-post-highlight')) {
      map.current.setLayoutProperty('border-post-highlight', 'visibility', visibility)
    }
  }, [showBorderPosts, colorScheme, isLoaded])

  // Handle month selection and data type for climate layers
  useEffect(() => {
    if (!map.current || !isLoaded) return
    
    // Show/hide climate layers based on selected month, data type, and color scheme
    for (let i = 1; i <= 12; i++) {
      const monthNumber = String(i).padStart(2, '0') // 01, 02, ..., 12
      const isSelectedMonth = (i - 1) === selectedMonth
      
      // Temperature layers
      const tempLayerId = `climate-temp-${monthNumber}`
      if (map.current!.getLayer(tempLayerId)) {
        const visibility = (colorScheme === 'climate' && climateDataType === 'temperature' && isSelectedMonth) ? 'visible' : 'none'
        map.current!.setLayoutProperty(tempLayerId, 'visibility', visibility)
      }
      
      // Precipitation layers
      const precipLayerId = `climate-precip-${monthNumber}`
      if (map.current!.getLayer(precipLayerId)) {
        const visibility = (colorScheme === 'climate' && climateDataType === 'precipitation' && isSelectedMonth) ? 'visible' : 'none'
        map.current!.setLayoutProperty(precipLayerId, 'visibility', visibility)
      }
    }

    // Hide country layer when climate is selected, show it otherwise
    if (map.current.getLayer('country')) {
      const countryVisibility = colorScheme === 'climate' ? 'none' : 'visible'
      map.current.setLayoutProperty('country', 'visibility', countryVisibility)
    }

    // Show zones layer only for overlanding scheme
    if (map.current.getLayer('zones')) {
      const zonesVisibility = colorScheme === 'overlanding' ? 'visible' : 'none'
      map.current.setLayoutProperty('zones', 'visibility', zonesVisibility)
    }

    // Show top-water layer only for climate scheme
    if (map.current.getLayer('top-water')) {
      const topWaterVisibility = colorScheme === 'climate' ? 'visible' : 'none'
      map.current.setLayoutProperty('top-water', 'visibility', topWaterVisibility)
    }
  }, [selectedMonth, colorScheme, climateDataType, isLoaded])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    console.log('🗺️ Initializing simple map...')

    try {
      // Register PMTiles protocol
      const protocol = new Protocol()
      maplibregl.addProtocol('pmtiles', protocol.tile)
      console.log('✅ PMTiles protocol registered')

      // Load style from JSON file based on language
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      // Supported languages with translation files
      const supportedLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'ru']
      // Use default basemap.json for unsupported languages (e.g., Chinese)
      const languageSuffix = supportedLanguages.includes(language) && language !== 'en' ? `-${language}` : ''
      const styleUrl = `${basePath}/styles/basemap${languageSuffix}.json`

      console.log('📄 Loading style from:', styleUrl, 'for language:', language)

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
            zoomToLocation
          }
          console.log('🔄 Calling onMapReady with interactions:', Object.keys(interactions))
          onMapReady(interactions)
        }

        setIsLoaded(true)

        // Add country-border source from PMTiles
        if (map.current) {
          // Create horizontal stripe patterns for zones
          const createStripePattern = (color: string) => {
            const width = 1 // Pattern width (minimal for tiling)
            const height = 12 // Pattern height (4px colored + 8px semi-transparent white)
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            
            if (ctx) {
              // Fill with transparent background
              ctx.clearRect(0, 0, width, height)
              
              // Draw horizontal stripe (colored part at top) - narrower
              ctx.fillStyle = color
              ctx.fillRect(0, 0, width, 4) // 4px colored stripe (narrower)
              
              // Draw semi-transparent white for the gap (50% opacity)
              ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
              ctx.fillRect(0, 4, width, 8) // 8px semi-transparent white (1:2 ratio)
              
              // Return ImageData
              return ctx.getImageData(0, 0, width, height)
            }
            
            return null
          }

          // Add stripe patterns as images
          const redStripe = createStripePattern('#ef4444')      // Type 0: Red - Closed
          const blackStripe = createStripePattern('#000000')    // Type 1: Black - Guide/Escort Needed
          const whiteStripe = createStripePattern('#ffffff')    // Type 2: White - Permit Needed
          const blueStripe = createStripePattern('#3b82f6')     // Type 3: Blue - Restrictions apply

          if (redStripe) map.current.addImage('stripe-red', redStripe)
          if (blackStripe) map.current.addImage('stripe-black', blackStripe)
          if (whiteStripe) map.current.addImage('stripe-white', whiteStripe)
          if (blueStripe) map.current.addImage('stripe-blue', blueStripe)

          console.log('✅ Stripe patterns created')

          console.log('➕ Adding country-border source')
          map.current.addSource('country-border', {
            type: 'vector',
            url: 'pmtiles://https://overlanding.io/country-borders.pmtiles'
          })

          // Add climate temperature sources for each month
          for (let i = 1; i <= 12; i++) {
            const monthNumber = String(i).padStart(2, '0') // 01, 02, ..., 12
            map.current!.addSource(`climate-temp-${monthNumber}`, {
              type: 'raster',
              tiles: [`https://pmtiles-cloudflare.overlandmap.workers.dev/tas/${monthNumber}/{z}/{x}/{y}.webp`],
              tileSize: 512
            })
          }
          console.log('✅ Climate temperature sources added for all 12 months')

          // Add climate precipitation sources for each month
          for (let i = 1; i <= 12; i++) {
            const monthNumber = String(i).padStart(2, '0') // 01, 02, ..., 12
            map.current!.addSource(`climate-precip-${monthNumber}`, {
              type: 'raster',
              tiles: [`https://pmtiles-cloudflare.overlandmap.workers.dev/pr/${monthNumber}/{z}/{x}/{y}.webp`],
              tileSize: 512
            })
          }
          console.log('✅ Climate precipitation sources added for all 12 months')

          // Add country layer (bottom layer)
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

          // Add climate temperature layers right after country layer (initially hidden)
          for (let i = 1; i <= 12; i++) {
            const monthNumber = String(i).padStart(2, '0') // 01, 02, ..., 12
            map.current.addLayer({
              id: `climate-temp-${monthNumber}`,
              type: 'raster',
              source: `climate-temp-${monthNumber}`,
              layout: {
                visibility: i === 1 ? 'visible' : 'none' // Show January by default
              },
              paint: {
                'raster-opacity': 1.0 // Full opacity for visibility
              }
            })
          }
          console.log('✅ Climate temperature layers added for all 12 months (after country layer)')

          // Add climate precipitation layers right after temperature layers (initially hidden)
          for (let i = 1; i <= 12; i++) {
            const monthNumber = String(i).padStart(2, '0') // 01, 02, ..., 12
            map.current.addLayer({
              id: `climate-precip-${monthNumber}`,
              type: 'raster',
              source: `climate-precip-${monthNumber}`,
              layout: {
                visibility: 'none' // Hidden by default
              },
              paint: {
                'raster-opacity': 1.0 // Full opacity for visibility
              }
            })
          }
          console.log('✅ Climate precipitation layers added for all 12 months (after temperature layers)')

          // Add zones layer (restricted areas) with diagonal stripe patterns - above countries
          map.current.addLayer({
            id: 'zones',
            type: 'fill',
            source: 'country-border',
            'source-layer': 'zones',
            paint: {
              'fill-pattern': [
                'case',
                ['==', ['get', 'type'], 1], 'stripe-black',   // Type 1: Black - Guide/Escort Needed
                ['==', ['get', 'type'], 2], 'stripe-white',   // Type 2: White - Permit Needed
                ['==', ['get', 'type'], 3], 'stripe-blue',    // Type 3: Blue - Restrictions apply
                'stripe-red'  // Type 0: Red - Closed (default)
              ],
              'fill-opacity': 1.0
            }
          }, 'waterway_river')

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
              'circle-radius': 12,
              'circle-stroke-width': 3,
              'circle-stroke-color': '#1e40af'
            },
            filter: ['==', ['get', 'id'], ''] // Initially show nothing
          })

          map.current.addLayer({
            "id": "top-water",
            "type": "fill",
            "metadata": {},
            "source": "planet",
            "source-layer": "water",
            "layout": {
                "visibility": "visible"
            },
            "paint": {
                "fill-color": "rgb(158,189,255)"
            },
        })

      //     map.current.addLayer({
      //       id: 'top-country',
      //       type: 'line',
      //       source: 'planet',
      //       'source-layer': 'boundary',
      //       paint: {
      //         'line-color': '#ffffff', // Plain white
      //         'line-width': 1, // Double the default width
      //         'line-opacity': 1.0
      //       },
      //             "filter": [
      //   "all",
      //   [
      //     "==",
      //     "admin_level",
      //     2
      //   ]
      // ],
// 
          // })

          console.log('✅ Highlight layers added: border-highlight, border-post-highlight')

          // Add click handler
          map.current.on('click', handleMapClick)

          // Add cursor pointer for clickable layers
          const clickableLayers = ['country', 'border', 'border_post', 'zones']

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
        console.log('🧹 Cleaning up simple map for language change')
        map.current.remove()
        map.current = null
        setIsLoaded(false)
      }
    }
  }, [language, clearAllHighlights, generateOverlandingColorExpression, handleMapClick, highlightBorder, highlightBorderPost, highlightCountry, onMapReady, zoomToLocation])

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

      {/* Top Menu (Language + User) */}
      <div className="absolute top-4 right-16 z-10">
        <TopMenu />
      </div>

      <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg shadow-lg z-10 max-w-xs">
        <div className="p-3">
          {/* Color Scheme Selector */}
          <div className="mb-4">
            <div className="flex space-x-1 mb-3">
              <button
                onClick={() => handleColorSchemeChange('overlanding')}
                className={`px-3 py-1 text-xs rounded transition-colors ${colorScheme === 'overlanding'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {getTranslatedLabel('overlanding', language)}
              </button>
              <button
                onClick={() => handleColorSchemeChange('carnet')}
                className={`px-3 py-1 text-xs rounded transition-colors ${colorScheme === 'carnet'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {getTranslatedLabel('carnet', language)}
              </button>
              <button
                onClick={() => handleColorSchemeChange('climate')}
                className={`px-3 py-1 text-xs rounded transition-colors ${colorScheme === 'climate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Climate
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
              {colorScheme === 'overlanding' ? 'Overlanding' : colorScheme === 'carnet' ? 'Carnet de passage en Douane (CpD)' : `Climate - ${climateDataType === 'temperature' ? 'Temperature' : 'Precipitation'}`}
            </h3>

            <div className="space-y-1 text-xs">
              {colorScheme === 'climate' ? (
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
                      background: 'repeating-linear-gradient(45deg, #9ca3af, #9ca3af 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
                      border: '1px solid #9ca3af'
                    }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('zone_permit', language)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ 
                      background: 'repeating-linear-gradient(45deg, #3b82f6, #3b82f6 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
                      border: '1px solid #3b82f6'
                    }}></div>
                    <span className="text-gray-700">{getTranslatedLabel('zone_restrictions', language)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}