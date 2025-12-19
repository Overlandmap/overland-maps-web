/**
 * Data loading utilities for accessing generated static data files
 * Used by Next.js components to load country and border data
 */

import { CountryData, BorderData, ISO3Lookup } from '../types'

// Cache for loaded data to avoid repeated fetches
const dataCache = new Map<string, any>()

// Loading states to prevent duplicate requests
const loadingStates = new Map<string, Promise<any>>()

// Configuration - use absolute path with base path for subdirectory deployment
function getDataBasePath(): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${basePath}/data`
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000

interface CacheEntry {
  data: any
  timestamp: number
  expiresAt: number
}

interface LoadingOptions {
  useCache?: boolean
  timeout?: number
  retries?: number
}

/**
 * Enhanced data loading with caching, retries, and timeout
 */
async function loadDataWithRetry<T>(
  url: string, 
  cacheKey: string, 
  options: LoadingOptions = {}
): Promise<T> {
  const { useCache = true, timeout = 10000, retries = MAX_RETRY_ATTEMPTS } = options
  
  // Check cache first
  if (useCache && dataCache.has(cacheKey)) {
    const entry = dataCache.get(cacheKey) as CacheEntry
    if (Date.now() < entry.expiresAt) {
      return entry.data
    } else {
      // Cache expired, remove it
      dataCache.delete(cacheKey)
    }
  }
  
  // Check if already loading
  if (loadingStates.has(cacheKey)) {
    return loadingStates.get(cacheKey)
  }
  
  // Create loading promise
  const loadingPromise = performLoadWithRetry<T>(url, retries, timeout)
  loadingStates.set(cacheKey, loadingPromise)
  
  try {
    const data = await loadingPromise
    
    // Cache the result
    if (useCache) {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRY_MS
      }
      dataCache.set(cacheKey, entry)
    }
    
    return data
  } finally {
    // Clean up loading state
    loadingStates.delete(cacheKey)
  }
}

/**
 * Perform fetch with retry logic
 */
async function performLoadWithRetry<T>(url: string, retries: number, timeout: number): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
      
    } catch (error) {
      lastError = error as Error
      
      if (attempt === retries) {
        break
      }
      
      // Wait before retry (exponential backoff)
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1)
      console.warn(`Attempt ${attempt} failed for ${url}, retrying in ${delay}ms...`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new Error(`Failed to load ${url} after ${retries} attempts: ${lastError?.message || 'Unknown error'}`)
}

/**
 * Check if we should load fresh data from Firestore
 */
function shouldLoadFreshData(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if there's a flag indicating recent updates
  const needsFreshData = localStorage.getItem('needsFreshData')
  if (needsFreshData === 'true') {
    console.log('🔄 Fresh data flag detected, will load from Firestore')
    return true
  }
  
  return false
}

/**
 * Mark that fresh data should be loaded on next page load
 */
export function markDataAsStale(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('needsFreshData', 'true')
    console.log('🏷️ Marked data as stale - will load fresh data on next page load')
  }
}

/**
 * Clear the fresh data flag
 */
export function clearFreshDataFlag(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('needsFreshData')
    console.log('🧹 Cleared fresh data flag')
  }
}

/**
 * Load country data with smart freshness checking
 */
export async function loadCountryData(options?: LoadingOptions): Promise<{
  countries: CountryData[]
  metadata: any
}> {
  // Check if we should load fresh data (only on initial load, not when explicitly bypassing cache)
  if (options?.useCache !== false && shouldLoadFreshData()) {
    console.log('🔄 Loading fresh data due to recent updates...')
    try {
      const freshData = await loadFreshCountryData()
      
      // Cache the fresh data
      const cacheEntry: CacheEntry = {
        data: freshData,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRY_MS
      }
      dataCache.set('countries', cacheEntry)
      
      // Clear the flag since we've loaded fresh data
      clearFreshDataFlag()
      
      return freshData
    } catch (error) {
      console.warn('Failed to load fresh data, falling back to static files:', error)
      // Clear the flag even on failure to prevent infinite retries
      clearFreshDataFlag()
      // Fall through to static file loading
    }
  }
  
  // Load from static files (default behavior)
  return loadDataWithRetry(`${getDataBasePath()}/countries.json`, 'countries', options)
}

/**
 * Load static border data with enhanced caching and error handling
 */
export async function loadBorderData(options?: LoadingOptions): Promise<{
  borders: BorderData[]
  metadata: any
}> {
  return loadDataWithRetry(`${getDataBasePath()}/borders.json`, 'borders', options)
}

/**
 * Load ISO3 lookup table with enhanced caching and error handling
 */
export async function loadISO3Lookup(options?: LoadingOptions): Promise<{
  lookup: ISO3Lookup
  metadata: any
}> {
  return loadDataWithRetry(`${getDataBasePath()}/iso3-lookup.json`, 'iso3-lookup', options)
}

/**
 * Load zone data with enhanced caching and error handling
 */
export async function loadZoneData(options?: LoadingOptions): Promise<Record<string, any>> {
  return loadDataWithRetry(`${getDataBasePath()}/zones.json`, 'zones', options)
}

/**
 * Get zone by ID from loaded zone data
 */
export async function getZoneById(zoneId: string, options?: LoadingOptions): Promise<any | null> {
  try {
    const zones = await loadZoneData(options)
    return zones[zoneId] || null
  } catch (error) {
    console.error(`Failed to load zone ${zoneId}:`, error)
    return null
  }
}

/**
 * Load itinerary data with enhanced caching and error handling
 */
export async function loadItineraryData(options?: LoadingOptions): Promise<{
  itineraries: any[]
  metadata: any
}> {
  return loadDataWithRetry(`${getDataBasePath()}/itineraries.json`, 'itineraries', options)
}

/**
 * Get itinerary by ID from loaded itinerary data
 */
export async function getItineraryById(itineraryId: string, options?: LoadingOptions): Promise<any | null> {
  try {
    const data = await loadItineraryData(options)
    const itinerary = data.itineraries.find((item: any) => item.id === itineraryId)
    return itinerary || null
  } catch (error) {
    console.error(`Failed to load itinerary ${itineraryId}:`, error)
    return null
  }
}

/**
 * Load track pack data with enhanced caching and error handling
 */
export async function loadTrackPackData(options?: LoadingOptions): Promise<{
  trackPacks: any[]
  metadata: any
}> {
  return loadDataWithRetry(`${getDataBasePath()}/trackpack.json`, 'trackpacks', options)
}

/**
 * Get track pack by ID from loaded track pack data
 */
export async function getTrackPackById(trackPackId: string, options?: LoadingOptions): Promise<any | null> {
  try {
    const data = await loadTrackPackData(options)
    const trackPack = data.trackPacks.find((item: any) => item.id === trackPackId)
    return trackPack || null
  } catch (error) {
    console.error(`Failed to load track pack ${trackPackId}:`, error)
    return null
  }
}

/**
 * Load border GeoJSON for MapLibre with enhanced error handling
 */
export async function loadBorderGeoJSON(
  optimized: boolean = true, 
  options?: LoadingOptions
): Promise<GeoJSON.FeatureCollection> {
  const filename = optimized ? 'borders-optimized.geojson' : 'borders.geojson'
  const cacheKey = `geojson-${filename}`
  
  return loadDataWithRetry(`${getDataBasePath()}/${filename}`, cacheKey, {
    ...options,
    timeout: 30000 // Longer timeout for potentially large GeoJSON files
  })
}

/**
 * Load border post GeoJSON for MapLibre with enhanced error handling
 */
export async function loadBorderPostGeoJSON(
  optimized: boolean = true, 
  options?: LoadingOptions
): Promise<GeoJSON.FeatureCollection> {
  const filename = optimized ? 'border-posts-optimized.geojson' : 'border-posts.geojson'
  const cacheKey = `geojson-${filename}`
  
  return loadDataWithRetry(`${getDataBasePath()}/${filename}`, cacheKey, {
    ...options,
    timeout: 15000 // Border posts are smaller than borders
  })
}

/**
 * Get country data by ISO3 code with enhanced error handling
 */
export async function getCountryByISO3(iso3: string, options?: LoadingOptions): Promise<CountryData | null> {
  if (!iso3 || typeof iso3 !== 'string') {
    console.warn('Invalid ISO3 code provided:', iso3)
    return null
  }
  
  try {
    const { lookup } = await loadISO3Lookup(options)
    const normalizedISO3 = iso3.trim().toUpperCase()
    return lookup[normalizedISO3] || null
  } catch (error) {
    console.error(`Failed to get country by ISO3 ${iso3}:`, error)
    return null
  }
}

/**
 * Get country data by ADM0_A3 code (preferred method for map interactions)
 */
export async function getCountryByADM0A3(adm0a3: string, options?: LoadingOptions): Promise<CountryData | null> {
  if (!adm0a3 || typeof adm0a3 !== 'string') {
    console.warn('Invalid ADM0_A3 code provided:', adm0a3)
    return null
  }
  
  try {
    const { countries } = await loadCountryData(options)
    const normalizedADM0A3 = adm0a3.trim().toUpperCase()
    
    console.log(`🔍 Searching for ADM0_A3: "${normalizedADM0A3}" in ${countries.length} countries`)
    
    // Search for country by adm0_a3 field
    const country = countries.find(c => {
      const matches = c.parameters?.adm0_a3?.toUpperCase() === normalizedADM0A3 ||
                     c.id?.toUpperCase() === normalizedADM0A3 ||
                     c.iso_a3?.toUpperCase() === normalizedADM0A3
      
      if (matches) {
        console.log(`✅ Found match:`, {
          id: c.id,
          name: c.name,
          iso_a3: c.iso_a3,
          adm0_a3: c.parameters?.adm0_a3
        })
      }
      
      return matches
    })
    
    if (!country) {
      console.log(`❌ No match found for ADM0_A3: "${normalizedADM0A3}"`)
    }
    
    return country || null
  } catch (error) {
    console.error(`Failed to get country by ADM0_A3 ${adm0a3}:`, error)
    return null
  }
}

/**
 * Search countries by name (fuzzy search)
 */
export async function searchCountriesByName(
  query: string, 
  options?: LoadingOptions
): Promise<CountryData[]> {
  if (!query || typeof query !== 'string') {
    return []
  }
  
  try {
    const { countries } = await loadCountryData(options)
    const normalizedQuery = query.toLowerCase().trim()
    
    return countries.filter(country => 
      country.name.toLowerCase().includes(normalizedQuery) ||
      (country.parameters?.name_long && 
       country.parameters.name_long.toLowerCase().includes(normalizedQuery))
    ).slice(0, 10) // Limit results
  } catch (error) {
    console.error(`Failed to search countries by name "${query}":`, error)
    return []
  }
}

/**
 * Get border data by ID
 */
export async function getBorderById(
  borderId: string, 
  options?: LoadingOptions
): Promise<BorderData | null> {
  if (!borderId || typeof borderId !== 'string') {
    console.warn('Invalid border ID provided:', borderId)
    return null
  }
  
  try {
    const { borders } = await loadBorderData(options)
    const border = borders.find(border => border.id === borderId)
    
    if (border) {
      // Flatten the structure to match what the border page expects
      return {
        id: border.id,
        ...border.properties  // Spread properties to top level
      }
    }
    
    return null
  } catch (error) {
    console.error(`Failed to get border by ID ${borderId}:`, error)
    return null
  }
}

/**
 * Get border posts by IDs from Firestore
 */
export async function getBorderPostsByIds(
  borderPostIds: string[]
): Promise<any[]> {
  if (!borderPostIds || borderPostIds.length === 0) {
    return []
  }
  
  try {
    // Fetch from Firestore API
    // Note: This only works with a dynamic server, not static export
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const response = await fetch(`${basePath}/api/border-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: borderPostIds })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch border posts: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.borderPosts || []
  } catch (error) {
    console.error('Failed to get border posts by IDs:', error)
    return []
  }
}

/**
 * Load data manifest with build information
 */
export async function loadDataManifest(options?: LoadingOptions): Promise<any> {
  return loadDataWithRetry(`${getDataBasePath()}/manifest.json`, 'manifest', options)
}

/**
 * Preload all essential data for better performance
 */
export async function preloadEssentialData(options?: LoadingOptions): Promise<{
  countries: CountryData[]
  iso3Lookup: ISO3Lookup
  borderPostGeoJSON: GeoJSON.FeatureCollection
  manifest: any
}> {
  console.log('🔄 Preloading essential data...')
  
  try {
    const startTime = Date.now()
    
    const [countryData, iso3Data, borderPostGeoJSON, manifest] = await Promise.all([
      loadCountryData(options),
      loadISO3Lookup(options),
      // Note: borders.geojson is NOT loaded - border data comes from Firestore
      loadBorderPostGeoJSON(false, options), // Use full quality version
      loadDataManifest(options)
    ])

    const loadTime = Date.now() - startTime
    console.log(`✅ Essential data preloaded in ${loadTime}ms`)
    
    return {
      countries: countryData.countries,
      iso3Lookup: iso3Data.lookup,
      borderPostGeoJSON: borderPostGeoJSON,
      manifest: manifest
    }
  } catch (error) {
    console.error('❌ Failed to preload essential data:', error)
    throw error
  }
}

/**
 * Preload data in background (non-blocking)
 */
export function preloadDataInBackground(options?: LoadingOptions): void {
  preloadEssentialData(options).catch(error => {
    console.warn('Background data preload failed:', error)
  })
}

/**
 * Clear data cache (useful for development)
 */
export function clearDataCache(): void {
  dataCache.clear()
  loadingStates.clear()
  console.log('🧹 Data cache cleared')
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(cacheKey: string): void {
  dataCache.delete(cacheKey)
  loadingStates.delete(cacheKey)
  console.log(`🧹 Cache entry cleared: ${cacheKey}`)
}

/**
 * Load fresh country data from Firestore API (bypassing static files)
 */
export async function loadFreshCountryData(): Promise<{
  countries: CountryData[]
  metadata: any
}> {
  console.log('🔄 Loading fresh country data from Firestore API...')
  
  try {
    const response = await fetch('/api/countries', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error(`API Error (${response.status}): Failed to fetch fresh country data`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }
    
    console.log(`✅ Loaded ${data.countries.length} countries from Firestore API`)
    return data
    
  } catch (error) {
    console.error('❌ Failed to load fresh country data:', error)
    throw error
  }
}

/**
 * Invalidate country data cache and reload fresh data from Firestore
 */
export async function refreshCountryData(): Promise<{
  countries: CountryData[]
  metadata: any
}> {
  console.log('🔄 Refreshing country data with fresh Firestore data...')
  clearCacheEntry('countries')
  
  try {
    // Load fresh data from Firestore API instead of static files
    const freshData = await loadFreshCountryData()
    
    // Update the cache with fresh data
    const cacheEntry: CacheEntry = {
      data: freshData,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_EXPIRY_MS
    }
    dataCache.set('countries', cacheEntry)
    
    // Clear the fresh data flag since we've loaded fresh data
    clearFreshDataFlag()
    
    return freshData
  } catch (error) {
    console.warn('Failed to load fresh data, falling back to static files:', error)
    // Fallback to static files if API fails
    return loadCountryData({ useCache: false })
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number
  keys: string[]
  totalMemory: number
  entries: Array<{ key: string; size: number; age: number }>
} {
  const entries = Array.from(dataCache.entries()).map(([key, entry]) => {
    const size = JSON.stringify(entry.data).length
    const age = Date.now() - entry.timestamp
    return { key, size, age }
  })
  
  const totalMemory = entries.reduce((sum, entry) => sum + entry.size, 0)
  
  return {
    size: dataCache.size,
    keys: Array.from(dataCache.keys()),
    totalMemory,
    entries
  }
}

/**
 * Check if data is available (cached or can be loaded)
 */
export async function checkDataAvailability(): Promise<{
  countries: boolean
  borders: boolean
  borderPosts: boolean
  iso3Lookup: boolean
  borderGeoJSON: boolean
  borderPostGeoJSON: boolean
  manifest: boolean
}> {
  // In static export environment, assume all data files are available
  // since they're bundled with the export
  const isStaticExport = typeof window !== 'undefined' && 
    (window.location.protocol === 'file:' || 
     !window.location.origin.includes('localhost:3000'))
  
  if (isStaticExport) {
    console.log('📦 Static export detected, assuming all data files are available')
    return {
      countries: true,
      borders: true,
      borderPosts: true,
      iso3Lookup: true,
      borderGeoJSON: true,
      borderPostGeoJSON: true,
      manifest: true
    }
  }
  
  const checks = {
    countries: false,
    borders: false,
    borderPosts: false,
    iso3Lookup: false,
    borderGeoJSON: false,
    borderPostGeoJSON: false,
    manifest: false
  }
  
  try {
    // Quick check - just try to fetch headers
    const promises = [
      fetch(`${getDataBasePath()}/countries.json`, { method: 'HEAD' }),
      fetch(`${getDataBasePath()}/borders.json`, { method: 'HEAD' }),
      fetch(`${getDataBasePath()}/border-posts.json`, { method: 'HEAD' }),
      fetch(`${getDataBasePath()}/iso3-lookup.json`, { method: 'HEAD' }),
      fetch(`${getDataBasePath()}/border-posts.geojson`, { method: 'HEAD' }),
      fetch(`${getDataBasePath()}/manifest.json`, { method: 'HEAD' })
    ]
    
    const results = await Promise.allSettled(promises)
    
    checks.countries = results[0].status === 'fulfilled' && (results[0].value as Response).ok
    checks.borders = results[1].status === 'fulfilled' && (results[1].value as Response).ok
    checks.borderPosts = results[2].status === 'fulfilled' && (results[2].value as Response).ok
    checks.iso3Lookup = results[3].status === 'fulfilled' && (results[3].value as Response).ok
    checks.borderGeoJSON = false // Not generated - borders loaded from Firestore
    checks.borderPostGeoJSON = results[4].status === 'fulfilled' && (results[4].value as Response).ok
    checks.manifest = results[5].status === 'fulfilled' && (results[5].value as Response).ok
    
  } catch (error) {
    console.warn('Data availability check failed:', error)
  }
  
  return checks
}

/**
 * Warm up the cache by preloading critical data
 */
export async function warmUpCache(): Promise<void> {
  console.log('🔥 Warming up data cache...')
  
  try {
    // Load in priority order
    await loadISO3Lookup({ useCache: true })
    await loadCountryData({ useCache: true })
    
    // Note: borders.geojson is NOT loaded - border data comes from Firestore
    
    console.log('✅ Cache warmed up successfully')
  } catch (error) {
    console.warn('⚠️ Cache warm-up partially failed:', error)
  }
}