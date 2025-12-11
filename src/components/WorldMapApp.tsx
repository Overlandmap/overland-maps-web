'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CountryData, BorderData } from '../types'
import { loadCountryData, getBorderById, getZoneById } from '../lib/data-loader'
import { useLanguage } from '../contexts/LanguageContext'
import { ColorSchemeProvider } from '../contexts/ColorSchemeContext'
import SimpleMapContainer from './SimpleMapContainer'
import DetailSidebar from './DetailSidebar'
import DisclaimerPopup from './DisclaimerPopup'
import { generateEntityUrl } from '../lib/url-utils'

interface SelectedFeature {
  type: 'country' | 'border' | 'border-post' | 'zone' | 'itinerary'
  id: string
  data: CountryData | BorderData | any | null
  feature: any
}

interface AppState {
  isLoading: boolean
  error?: string
}

interface WorldMapAppProps {
  initialCountry?: string
  initialBorder?: string
  initialBorderPost?: string
  initialBorderPostData?: any
  initialZone?: string
  initialItinerary?: string
}

export default function WorldMapApp({ initialCountry, initialBorder, initialBorderPost, initialBorderPostData, initialZone, initialItinerary }: WorldMapAppProps = {}) {
  const { language } = useLanguage()
  const router = useRouter()
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [appState, setAppState] = useState<AppState>({ isLoading: true })
  const [mapInteractions, setMapInteractions] = useState<any>(null)
  const [isHandlingPopState, setIsHandlingPopState] = useState(false)
  const [hasHandledInitialSelection, setHasHandledInitialSelection] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  // Check if disclaimer has been shown before
  useEffect(() => {
    const disclaimerShown = localStorage.getItem('disclaimer-accepted')
    if (!disclaimerShown) {
      setShowDisclaimer(true)
    }
  }, [])

  // Handle disclaimer acceptance
  const handleDisclaimerAccept = useCallback(() => {
    localStorage.setItem('disclaimer-accepted', 'true')
    setShowDisclaimer(false)
  }, [])

  /**
   * Initialize the application
   */
  const initializeApp = useCallback(async () => {
    try {
      setAppState({ isLoading: true })
      
      // Pre-load country data for faster lookups
      await loadCountryData()
      
      setAppState({ isLoading: false })
      console.log('✅ App initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize app:', error)
      setAppState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }, [])

  /**
   * Handle country clicks
   */
  const handleCountryClick = useCallback(async (iso3: string, countryData: CountryData | null, feature: any) => {
    console.log('🌍 Country clicked:', iso3, countryData?.name)
    
    if (iso3) {
      // Update URL without navigation (unless handling popstate)
      if (!isHandlingPopState) {
        window.history.pushState({ type: 'country', id: iso3 }, '', generateEntityUrl('country', iso3))
      }
      
      // Load country data if not provided
      let data = countryData
      if (!data) {
        try {
          const { countries } = await loadCountryData()
          data = countries.find(c => 
            c.id === iso3 || 
            c.iso_a3 === iso3 ||
            c.parameters?.iso_a3 === iso3 ||
            c.parameters?.adm0_a3 === iso3
          ) || null
        } catch (error) {
          console.error('Failed to load country data:', error)
        }
      }
      
      // Show detail sidebar
      setSelectedFeature({
        type: 'country',
        id: iso3,
        data: data,
        feature: feature
      })
      setSidebarOpen(true)
    }
  }, [isHandlingPopState])

  /**
   * Handle border clicks
   */
  const handleBorderClick = useCallback(async (borderId: string, borderData: BorderData | null, feature: any) => {
    console.log('🔗 Border clicked:', borderId)
    
    if (borderId) {
      // Update URL without navigation (unless handling popstate)
      if (!isHandlingPopState) {
        window.history.pushState({ type: 'border', id: borderId }, '', generateEntityUrl('border', borderId))
      }
      
      // Load complete border data if needed
      let completeData = borderData
      if (!borderData || !borderData.id) {
        try {
          completeData = await getBorderById(borderId)
        } catch (error) {
          console.warn('Failed to load complete border data:', error)
        }
      }
      
      // Show detail sidebar
      setSelectedFeature({
        type: 'border',
        id: borderId,
        data: completeData,
        feature: feature
      })
      setSidebarOpen(true)
    }
  }, [isHandlingPopState])

  /**
   * Handle border post clicks
   */
  const handleBorderPostClick = useCallback(async (borderPostId: string, borderPostData: any | null, feature: any) => {
    console.log('📍 Border post clicked:', borderPostId)
    
    if (borderPostId) {
      // Update URL without navigation (unless handling popstate)
      if (!isHandlingPopState) {
        window.history.pushState({ type: 'border-post', id: borderPostId }, '', generateEntityUrl('border_post', borderPostId))
      }
      
      // Use feature properties as border post data
      const completeData = {
        id: borderPostId,
        name: feature?.properties?.name || 'Unnamed Border Post',
        is_open: feature?.properties?.is_open ?? -1,
        comment: feature?.properties?.comment,
        countries: feature?.properties?.countries,
        location: feature?.properties?.location,
        geometry: feature?.geometry,
        coordinates: feature?.geometry?.type === 'Point' ? feature.geometry.coordinates : null,
        ...feature?.properties
      }
      
      // Show detail sidebar
      setSelectedFeature({
        type: 'border-post',
        id: borderPostId,
        data: completeData,
        feature: feature
      })
      setSidebarOpen(true)
    }
  }, [isHandlingPopState])

  /**
   * Handle zone clicks
   */
  const handleZoneClick = useCallback(async (zoneId: string, zoneData: any | null, feature: any) => {
    console.log('🚫 Zone clicked:', zoneId)
    
    if (zoneId) {
      // Update URL without navigation (unless handling popstate)
      if (!isHandlingPopState) {
        window.history.pushState({ type: 'zone', id: zoneId }, '', generateEntityUrl('zone', zoneId))
      }
      
      // Load zone data if not provided
      let data = zoneData
      if (!data) {
        try {
          data = await getZoneById(zoneId)
        } catch (error) {
          console.error('Failed to load zone data:', error)
        }
      }
      
      // Merge feature properties with loaded data
      // Start with loaded data and its properties
      const baseData = {
        ...data,
        ...data?.properties
      }
      
      // Build complete data with proper fallbacks
      const completeData = {
        ...baseData,
        id: zoneId,
        name: feature?.properties?.name || baseData?.name || 'Unnamed Zone',
        type: feature?.properties?.type ?? baseData?.type ?? 0,
        comment: feature?.properties?.comment || baseData?.comment, // Preserve comment from loaded data
        country: feature?.properties?.country || baseData?.country,
        description: feature?.properties?.description || baseData?.description,
        geometry: feature?.geometry
      }
      
      console.log('🔍 Zone data merged:', { 
        hasComment: !!completeData.comment, 
        comment: completeData.comment,
        fromData: baseData?.comment,
        fromFeature: feature?.properties?.comment 
      })
      
      // Highlight the zone on the map
      if (mapInteractions?.highlightZone) {
        console.log('🎯 Calling highlightZone with zoneId:', zoneId)
        mapInteractions.highlightZone(zoneId)
      } else {
        console.warn('⚠️ highlightZone function not available in mapInteractions')
      }
      
      // Show detail sidebar
      setSelectedFeature({
        type: 'zone',
        id: zoneId,
        data: completeData,
        feature: feature
      })
      setSidebarOpen(true)
    }
  }, [isHandlingPopState])

  /**
   * Handle itinerary clicks
   */
  const handleItineraryClick = useCallback(async (itineraryId: string, itineraryData: any | null, feature: any) => {
    console.log('🛣️ Itinerary clicked:', itineraryId)
    
    if (itineraryId) {
      // Update URL without navigation (unless handling popstate)
      if (!isHandlingPopState) {
        window.history.pushState({ type: 'itinerary', id: itineraryId }, '', generateEntityUrl('itinerary', itineraryId))
      }
      
      // Use feature properties as itinerary data
      const completeData = {
        id: itineraryId,
        name: feature?.properties?.name || 'Unnamed Itinerary',
        length: feature?.properties?.length,
        nbSteps: feature?.properties?.nbSteps,
        titlePhotoUrl: feature?.properties?.titlePhotoUrl,
        geometry: feature?.geometry,
        ...feature?.properties
      }
      
      // Show detail sidebar
      setSelectedFeature({
        type: 'itinerary',
        id: itineraryId,
        data: completeData,
        feature: feature
      })
      setSidebarOpen(true)
    }
  }, [isHandlingPopState])

  /**
   * Handle selection clear
   */
  const handleSelectionClear = useCallback(() => {
    console.log('🧹 Selection cleared')
    setSelectedFeature(null)
    setSidebarOpen(false)
  }, [])

  /**
   * Handle sidebar close
   */
  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false)
    // Clear selected feature state
    setSelectedFeature(null)
    // Update URL to home (unless handling popstate)
    if (!isHandlingPopState) {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const homePath = basePath || '/'
      window.history.pushState({ type: 'home' }, '', homePath)
    }
    // Clear map selection
    if (mapInteractions?.clearSelection) {
      mapInteractions.clearSelection()
    }
  }, [mapInteractions, isHandlingPopState])

  /**
   * Handle country selection from sidebar
   */
  const handleCountrySelection = useCallback(async (countryCode: string) => {
    console.log('🌍 Country selected from sidebar:', countryCode)
    
    try {
      const { countries } = await loadCountryData()
      const country = countries.find(c => 
        c.id === countryCode || 
        c.iso_a3 === countryCode ||
        c.parameters?.iso_a3 === countryCode ||
        c.parameters?.adm0_a3 === countryCode
      )
      
      if (country && mapInteractions?.selectCountryByISO3) {
        await mapInteractions.selectCountryByISO3(countryCode)
      }
    } catch (error) {
      console.error('Failed to select country:', error)
    }
  }, [mapInteractions])

  /**
   * Handle border post zoom
   */
  const handleBorderPostZoom = useCallback(async (location: { lng: number, lat: number }) => {
    console.log('🔍 Border post zoom requested:', location)
    
    try {
      if (mapInteractions?.zoomToLocation) {
        await mapInteractions.zoomToLocation(location.lng, location.lat, 10)
        console.log(`✅ Zoomed to border post location [${location.lng}, ${location.lat}] with zoom level 10`)
      } else {
        console.warn('⚠️ zoomToLocation not available in map interactions')
      }
    } catch (error) {
      console.error('Failed to zoom to border post:', error)
    }
  }, [mapInteractions])

  /**
   * Handle map ready callback
   */
  const handleMapReady = useCallback((interactions: any) => {
    console.log('🗺️ Map interactions ready:', Object.keys(interactions))
    setMapInteractions(interactions)
  }, [])

  /**
   * Handle retry after error
   */
  const handleRetry = useCallback(() => {
    initializeApp()
  }, [initializeApp])

  // Update page title based on selected feature
  useEffect(() => {
    if (!selectedFeature) {
      document.title = 'Overland Maps'
      return
    }

    const getName = () => {
      if (selectedFeature.type === 'country') {
        const countryData = selectedFeature.data as CountryData
        return countryData?.name || countryData?.parameters?.name || selectedFeature.id
      } else if (selectedFeature.type === 'border') {
        const borderData = selectedFeature.data as any
        return borderData?.name || `Border ${selectedFeature.id}`
      } else if (selectedFeature.type === 'border-post') {
        const borderPostData = selectedFeature.data as any
        return borderPostData?.name || `Border Post ${selectedFeature.id}`
      }
      return 'Overland Maps'
    }

    const name = getName()
    document.title = `${name} - Overland Maps`
  }, [selectedFeature])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = async () => {
      const path = window.location.pathname
      console.log('🔙 Browser navigation detected:', path)
      
      // Set flag to prevent pushState in handlers
      setIsHandlingPopState(true)
      
      // Get base path from environment
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const homePath = basePath || '/'
      
      // Check if we're at the home path (with or without base path)
      if (path === homePath || path === '/' || path === basePath + '/') {
        // Back to home - close sidebar and clear selection
        setSidebarOpen(false)
        setSelectedFeature(null)
        document.title = 'Overland Maps'
        setIsHandlingPopState(false)
        return
      }

      // Remove base path from the pathname for matching
      const pathWithoutBase = basePath ? path.replace(basePath, '') : path
      
      // Parse the URL to determine what to load
      const countryMatch = pathWithoutBase.match(/^\/country\/([^\/]+)/)
      const borderMatch = pathWithoutBase.match(/^\/border\/([^\/]+)/)
      const borderPostMatch = pathWithoutBase.match(/^\/border_post\/([^\/]+)/)
      const zoneMatch = pathWithoutBase.match(/^\/zone\/([^\/]+)/)
      const itineraryMatch = pathWithoutBase.match(/^\/itinerary\/([^\/]+)/)

      if (countryMatch) {
        const countryCode = countryMatch[1]
        console.log('🌍 Loading country from URL:', countryCode)
        await handleCountryClick(countryCode, null, null)
      } else if (borderMatch) {
        const borderId = borderMatch[1]
        console.log('🔗 Loading border from URL:', borderId)
        await handleBorderClick(borderId, null, null)
      } else if (borderPostMatch) {
        const borderPostId = borderPostMatch[1]
        console.log('📍 Loading border post from URL:', borderPostId)
        await handleBorderPostClick(borderPostId, null, null)
      } else if (zoneMatch) {
        const zoneId = zoneMatch[1]
        console.log('🚫 Loading zone from URL:', zoneId)
        await handleZoneClick(zoneId, null, null)
      } else if (itineraryMatch) {
        const itineraryId = itineraryMatch[1]
        console.log('🛣️ Loading itinerary from URL:', itineraryId)
        await handleItineraryClick(itineraryId, null, null)
      }
      
      // Reset flag after handling
      setIsHandlingPopState(false)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [handleCountryClick, handleBorderClick, handleBorderPostClick, handleZoneClick, handleItineraryClick])

  // Initialize app on mount
  useEffect(() => {
    initializeApp()
  }, [initializeApp])

  // Handle initial country selection from URL
  useEffect(() => {
    if (initialCountry && !hasHandledInitialSelection) {
      console.log('🎯 Setting initial country selection:', initialCountry)
      handleCountryClick(initialCountry, null, null)
      setHasHandledInitialSelection(true)
    }
  }, [initialCountry, hasHandledInitialSelection, handleCountryClick])

  // Handle initial border selection from URL
  useEffect(() => {
    if (initialBorder && !hasHandledInitialSelection) {
      console.log('🎯 Setting initial border selection:', initialBorder)
      handleBorderClick(initialBorder, null, null)
      setHasHandledInitialSelection(true)
    }
  }, [initialBorder, hasHandledInitialSelection, handleBorderClick])

  // Handle initial border post selection from URL
  useEffect(() => {
    const loadInitialBorderPost = async () => {
      if (initialBorderPost && !hasHandledInitialSelection) {
        console.log('🎯 Setting initial border post selection:', initialBorderPost)
        setHasHandledInitialSelection(true)
        
        // If we have pre-loaded data with a name, use it
        if (initialBorderPostData && initialBorderPostData.name) {
          const feature = {
            properties: {
              id: initialBorderPostData.id,
              name: initialBorderPostData.name,
              is_open: initialBorderPostData.is_open,
              comment: initialBorderPostData.comment,
              countries: initialBorderPostData.countries,
              location: initialBorderPostData.location,
              coordinates: initialBorderPostData.coordinates
            },
            geometry: initialBorderPostData.geometry || {
              type: 'Point',
              coordinates: initialBorderPostData.coordinates
            }
          }
          
          const completeData = {
            ...initialBorderPostData,
            geometry: feature.geometry,
            coordinates: initialBorderPostData.coordinates
          }
          
          setSelectedFeature({
            type: 'border-post',
            id: initialBorderPost,
            data: completeData,
            feature: feature
          })
          setSidebarOpen(true)
        } else {
          // Fetch from API if no pre-loaded data
          // Note: This only works with a dynamic server, not static export
          try {
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
            const response = await fetch(`${basePath}/api/border-posts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: [initialBorderPost] })
            })
            
            if (response.ok) {
              const data = await response.json()
              if (data.borderPosts && data.borderPosts.length > 0) {
                const borderPost = data.borderPosts[0]
                
                const coordinates = borderPost.location?._longitude && borderPost.location?._latitude
                  ? [borderPost.location._longitude, borderPost.location._latitude]
                  : null
                
                const feature = {
                  properties: {
                    id: borderPost.id,
                    name: borderPost.name,
                    is_open: borderPost.is_open,
                    comment: borderPost.comment,
                    countries: borderPost.countries,
                    coordinates: coordinates
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: coordinates
                  }
                }
                
                const completeData = {
                  id: borderPost.id,
                  name: borderPost.name || 'Unnamed Border Post',
                  is_open: borderPost.is_open ?? -1,
                  comment: borderPost.comment,
                  countries: borderPost.countries,
                  location: borderPost.location,
                  geometry: feature.geometry,
                  coordinates: coordinates
                }
                
                setSelectedFeature({
                  type: 'border-post',
                  id: initialBorderPost,
                  data: completeData,
                  feature: feature
                })
                setSidebarOpen(true)
              }
            }
          } catch (error) {
            console.error('Failed to fetch border post:', error)
          }
        }
      }
    }
    
    loadInitialBorderPost()
  }, [initialBorderPost, initialBorderPostData, hasHandledInitialSelection])

  // Handle initial zone selection from URL
  useEffect(() => {
    if (initialZone && !hasHandledInitialSelection) {
      console.log('🎯 Setting initial zone selection:', initialZone)
      handleZoneClick(initialZone, null, null)
      setHasHandledInitialSelection(true)
    }
  }, [initialZone, hasHandledInitialSelection, handleZoneClick])

  // Handle initial itinerary selection from URL
  useEffect(() => {
    if (initialItinerary && !hasHandledInitialSelection) {
      console.log('🎯 Setting initial itinerary selection:', initialItinerary)
      handleItineraryClick(initialItinerary, null, null)
      setHasHandledInitialSelection(true)
    }
  }, [initialItinerary, hasHandledInitialSelection, handleItineraryClick])

  if (appState.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-700">Loading Overlanding Maps...</div>
        </div>
      </div>
    )
  }

  if (appState.error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <div className="text-gray-700 mb-4">{appState.error}</div>
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
    <ColorSchemeProvider>
      <div className="relative h-screen overflow-hidden">
        {/* Map Container */}
        <SimpleMapContainer
          className="w-full h-full"
          onCountryClick={handleCountryClick}
          onBorderClick={handleBorderClick}
          onBorderPostClick={handleBorderPostClick}
          onZoneClick={handleZoneClick}
          onItineraryClick={handleItineraryClick}
          onSelectionClear={handleSelectionClear}
          onMapReady={handleMapReady}
          selectedCountryId={selectedFeature?.type === 'country' ? selectedFeature.id : null}
          selectedBorderId={selectedFeature?.type === 'border' ? selectedFeature.id : null}
          selectedBorderPostId={selectedFeature?.type === 'border-post' ? selectedFeature.id : null}
          selectedZoneId={selectedFeature?.type === 'zone' ? selectedFeature.id : null}
          selectedItineraryId={selectedFeature?.type === 'itinerary' ? selectedFeature.id : null}
        />

        {/* Detail Sidebar */}
        <DetailSidebar
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
          selectedFeature={selectedFeature}
          onCountrySelect={handleCountrySelection}
          onBorderClick={handleBorderClick}
          onBorderPostClick={handleBorderPostClick}
          onBorderPostZoom={handleBorderPostZoom}
        />

        {/* Disclaimer Popup */}
        <DisclaimerPopup
          isOpen={showDisclaimer}
          onAccept={handleDisclaimerAccept}
        />
      </div>
    </ColorSchemeProvider>
  )
}