'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import 'maplibre-gl/dist/maplibre-gl.css'
import TopMenu from './TopMenu'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslatedLabel } from '../lib/i18n'


type ColorScheme = 'overlanding' | 'carnet'

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

  // Clear all highlights function
  const clearAllHighlights = useCallback(() => {
    if (!map.current) return

    console.log('🧹 Clearing all highlights')
    // Clear border highlights
    if (map.current.getLayer('border-highlight')) {
      map.current.setFilter('border-highlight', ['==', ['get', 'id'], ''])
    }
    // Clear country highlights
    if (map.current.getLayer('countries-highlight')) {
      map.current.setFilter('countries-highlight', ['==', ['get', 'ADM0_A3'], ''])
    }
    // Clear border post highlights
    if (map.current.getLayer('border-post-highlight')) {
      map.current.setFilter('border-post-highlight', ['==', ['get', 'id'], ''])
    }
  }, [])

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
    // Clear all other highlights first
    clearAllHighlights()
    // Highlight the selected country (darker blue fill)
    // Try multiple field names to match the country
    if (map.current.getLayer('countries-highlight')) {
      map.current.setFilter('countries-highlight', [
        'any',
        ['==', ['get', 'ADM0_A3'], countryId],
        ['==', ['get', 'ISO_A3'], countryId],
        ['==', ['get', 'id'], countryId]
      ])
    }
  }, [clearAllHighlights])

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

    const colorExpression = scheme === 'overlanding'
      ? generateOverlandingColorExpression()
      : generateCarnetColorExpression()

    const darkerColorExpression = generateDarkerColorExpression(scheme)

    try {
      map.current.setPaintProperty('country', 'fill-color', colorExpression as any)

      // Update highlight layer with darker colors
      if (map.current.getLayer('countries-highlight')) {
        map.current.setPaintProperty('countries-highlight', 'fill-color', darkerColorExpression as any)
      }

      console.log(`🎨 Map colors updated to ${scheme} scheme`)
    } catch (error) {
      console.error('❌ Failed to update map colors:', error)
    }
  }, [generateOverlandingColorExpression, generateCarnetColorExpression, generateDarkerColorExpression])

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

    const visibility = showBorderPosts ? 'visible' : 'none'

    if (map.current.getLayer('border_post')) {
      map.current.setLayoutProperty('border_post', 'visibility', visibility)
    }
    if (map.current.getLayer('border-post-highlight')) {
      map.current.setLayoutProperty('border-post-highlight', 'visibility', visibility)
    }
  }, [showBorderPosts, isLoaded])

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

          // Add zones layer (restricted areas) with diagonal stripe patterns
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
          })

          console.log('✅ PMTiles layers added: country, zones, border, border_post')

          // Add highlight layers (on top of regular layers)
          // Country highlight layer - darker version of base color for selected countries
          map.current.addLayer({
            id: 'countries-highlight',
            type: 'fill',
            source: 'country-border',
            'source-layer': 'country',
            paint: {
              'fill-color': generateOverlandingColorExpression() as any, // Will be updated based on color scheme
              'fill-opacity': 0.7 // Higher opacity for darker appearance
            },
            filter: ['==', ['get', 'ADM0_A3'], ''] // Initially show nothing
          })

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

          console.log('✅ Highlight layers added: countries-highlight, border-highlight, border-post-highlight')

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
            </div>

            <h3 className="text-sm font-semibold mb-2">
              {colorScheme === 'overlanding' ? 'Overlanding' : 'Carnet de passage en Douane (CpD)'}
            </h3>

            <div className="space-y-1 text-xs">
              {colorScheme === 'overlanding' ? (
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