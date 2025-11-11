'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLanguage } from '../contexts/LanguageContext'
import { useColorScheme } from '../contexts/ColorSchemeContext'
import LanguageSelector from './LanguageSelector'
import { useMapInteractions } from '../hooks/useMapInteractions'
import MapManager from '../lib/mapManager'

interface MapContainerProps {
  onCountryClick?: (iso3: string, countryData: any, feature: any) => void
  onBorderClick?: (borderId: string, borderData: any, feature: any) => void
  onSelectionClear?: () => void
  onMapReady?: (mapInteractions: any) => void
  className?: string
  selectedCountryId?: string | null
  selectedBorderId?: string | null
}

export default function MapContainer({
  onCountryClick, 
  onBorderClick, 
  onSelectionClear,
  onMapReady,
  className = "map-container",
  selectedCountryId,
  selectedBorderId
}: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const mapManager = useRef<MapManager>(MapManager.getInstance())
  const [mapState, setMapState] = useState({
    isLoaded: false,
    isError: false,
    errorMessage: ''
  })

  const { language } = useLanguage()
  const { colorScheme } = useColorScheme()

  // Map interactions hook
  const {
    setupClickHandlers,
    setupHoverEffects,
    clearSelection,
    clearAllHighlights,
    selectCountryByISO3,
    selectBorderById,
    getSelectedFeature,
    highlightCountryById,
    highlightCountryFeature,
    highlightBorderFeature,
    zoomToLocation
  } = useMapInteractions(map, {
    onCountryClick,
    onBorderClick,
    onSelectionClear
  })

  /**
   * Initialize the map using MapManager singleton
   */
  const initializeMap = useCallback(async () => {
    if (!mapContainer.current) {
      console.log('🚫 Map container not available')
      return
    }

    try {
      console.log('🗺️ Initializing map with MapManager...')
      setMapState({ isLoaded: false, isError: false, errorMessage: '' })

      const mapInstance = await mapManager.current.initializeMap(
        mapContainer.current,
        () => {
          // On load callback
          console.log('✅ Map loaded via MapManager')
          
          // Get the map instance
          map.current = mapManager.current.getMap()
          
          if (map.current) {
            console.log('🗺️ Map instance ready, interactions will be set up separately')
          }

          setMapState({ isLoaded: true, isError: false, errorMessage: '' })
        },
        (error) => {
          // On error callback
          console.error('❌ Map error via MapManager:', error)
          setMapState({ 
            isLoaded: false, 
            isError: true, 
            errorMessage: error?.error?.message || error?.message || 'Failed to load map' 
          })
        }
      )

      if (mapInstance) {
        map.current = mapInstance
      }

    } catch (error) {
      console.error('❌ Failed to initialize map via MapManager:', error)
      setMapState({ 
        isLoaded: false, 
        isError: true, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }, []) // Empty dependency array to prevent infinite loops

  // Initialize map on mount
  useEffect(() => {
    initializeMap()

    // Cleanup function - but don't destroy the singleton
    return () => {
      console.log('🧹 Component unmounting, clearing local reference')
      map.current = null
    }
  }, [initializeMap])

  // Set up interactions when map is loaded
  useEffect(() => {
    if (mapState.isLoaded && map.current) {
      console.log('🔗 Setting up map interactions')
      
      // Setup interactions
      setupClickHandlers()
      setupHoverEffects()

      // Notify parent that map is ready
      onMapReady?.({
        highlightCountryById,
        clearSelection,
        selectCountryByISO3,
        selectBorderById,
        zoomToLocation
      })
    }
  }, [mapState.isLoaded, setupClickHandlers, setupHoverEffects, onMapReady, highlightCountryById, clearSelection, selectCountryByISO3, selectBorderById, zoomToLocation])

  // Update colors when color scheme changes
  useEffect(() => {
    if (!mapState.isLoaded) return

    mapManager.current.updateColors(colorScheme)
  }, [colorScheme, mapState.isLoaded])

  /**
   * Handle prop-driven highlighting for selectedCountryId and selectedBorderId
   * Implements Requirements: 3.1, 3.2, 3.3, 3.4, 5.3
   * 
   * This effect watches for changes to the selection props and updates the map highlighting accordingly.
   * It ensures that highlights are applied/cleared within 100ms of prop changes.
   */
  useEffect(() => {
    if (!map.current || !mapState.isLoaded) {
      console.log('⏳ Map not ready for prop-driven highlighting')
      return
    }

    const startTime = performance.now()

    try {
      // Clear all existing highlights first to ensure only one feature is highlighted at a time
      // This implements Requirement 3.1 (only one active selection highlight)
      clearAllHighlights()

      // Apply country highlighting if selectedCountryId is provided
      if (selectedCountryId) {
        console.log('🎯 Applying prop-driven country highlight:', selectedCountryId)
        
        // Wait for countries layer to be ready before highlighting
        const applyCountryHighlight = () => {
          if (map.current && map.current.getLayer('countries-highlight')) {
            highlightCountryById(selectedCountryId)
            
            const endTime = performance.now()
            const duration = endTime - startTime
            
            if (duration > 100) {
              console.warn(`⚠️ Prop-driven country highlight took ${duration.toFixed(2)}ms (target: <100ms)`)
            } else {
              console.log(`✅ Prop-driven country highlight applied in ${duration.toFixed(2)}ms`)
            }
          } else {
            console.warn('⚠️ countries-highlight layer not ready, retrying...')
            // Retry after a short delay if layer isn't ready yet
            setTimeout(applyCountryHighlight, 50)
          }
        }
        
        applyCountryHighlight()
      }
      // Apply border highlighting if selectedBorderId is provided
      else if (selectedBorderId) {
        console.log('🎯 Applying prop-driven border highlight:', selectedBorderId)
        
        // Wait for borders layer to be ready before highlighting
        const applyBorderHighlight = () => {
          if (map.current && map.current.getLayer('border-highlight')) {
            highlightBorderFeature(selectedBorderId)
            
            const endTime = performance.now()
            const duration = endTime - startTime
            
            if (duration > 100) {
              console.warn(`⚠️ Prop-driven border highlight took ${duration.toFixed(2)}ms (target: <100ms)`)
            } else {
              console.log(`✅ Prop-driven border highlight applied in ${duration.toFixed(2)}ms`)
            }
          } else {
            console.warn('⚠️ border-highlight layer not ready, retrying...')
            // Retry after a short delay if layer isn't ready yet
            setTimeout(applyBorderHighlight, 50)
          }
        }
        
        applyBorderHighlight()
      }
      // Clear highlights when both props are null (Requirement 3.2)
      else {
        console.log('🧹 Clearing highlights (no selection props provided)')
        
        const endTime = performance.now()
        const duration = endTime - startTime
        
        if (duration > 100) {
          console.warn(`⚠️ Prop-driven highlight clear took ${duration.toFixed(2)}ms (target: <100ms)`)
        } else {
          console.log(`✅ Prop-driven highlights cleared in ${duration.toFixed(2)}ms`)
        }
      }
    } catch (error) {
      console.error('❌ Error in prop-driven highlighting:', error)
      // Gracefully handle errors without breaking functionality
    }
  }, [selectedCountryId, selectedBorderId, mapState.isLoaded, clearAllHighlights, highlightCountryById, highlightBorderFeature])

  // Retry function
  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying map initialization')
    initializeMap()
  }, [initializeMap])

  if (mapState.isError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-8">
          <div className="text-red-600 text-xl mb-4">⚠️ Map Error</div>
          <div className="text-gray-700 mb-4">{mapState.errorMessage}</div>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} relative`}>
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading overlay */}
      {!mapState.isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-700">Loading map...</div>
          </div>
        </div>
      )}

      {/* Language selector */}
      <div className="absolute top-4 left-4 z-10">
        <LanguageSelector />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10">
        <h3 className="text-sm font-semibold mb-2">Overlanding Difficulty</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Easy (1)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <span>Moderate (2)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span>Difficult (3)</span>
          </div>
        </div>
      </div>
    </div>
  )
}