/**
 * Singleton Map Manager to prevent WebGL context leaks
 * This ensures only one map instance exists at a time
 */

import maplibregl from 'maplibre-gl'

class MapManager {
  private static instance: MapManager
  private map: maplibregl.Map | null = null

  private isInitializing = false
  private currentContainer: HTMLDivElement | null = null

  private constructor() {}

  static getInstance(): MapManager {
    if (!MapManager.instance) {
      MapManager.instance = new MapManager()
    }
    return MapManager.instance
  }

  async initializeMap(
    container: HTMLDivElement,
    onLoad: () => void,
    onError: (error: any) => void
  ): Promise<maplibregl.Map | null> {
    // If we already have a map and it's in a different container, clean it up
    if (this.map && this.currentContainer !== container) {
      console.log('🔄 Moving map to new container')
      this.cleanup()
    }

    // If map already exists and is in the same container, return it
    if (this.map && this.currentContainer === container) {
      console.log('♻️ Reusing existing map instance')
      return this.map
    }

    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      console.log('⏳ Map initialization already in progress')
      return null
    }

    this.isInitializing = true
    this.currentContainer = container

    try {
      console.log('🗺️ Creating new map instance')

      // No PMTiles protocol needed for GeoJSON approach
      console.log('✅ Using GeoJSON data sources (no PMTiles)')

      // Create map instance with simple raster style (no PMTiles)
      this.map = new maplibregl.Map({
        container: container,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }
          ]
        },
        center: [0, 20],
        zoom: 2,
        maxZoom: 18
      })

      // Add controls
      this.map.addControl(new maplibregl.NavigationControl(), 'top-right')
      this.map.addControl(new maplibregl.ScaleControl(), 'bottom-left')

      // Set up event handlers
      this.map.on('load', () => {
        console.log('✅ Map loaded successfully')
        this.addLayers()
        onLoad()
      })

      this.map.on('error', (e) => {
        console.error('❌ Map error:', e)
        onError(e)
      })

      return this.map

    } catch (error) {
      console.error('❌ Failed to initialize map:', error)
      onError(error)
      return null
    } finally {
      this.isInitializing = false
    }
  }

  private async addLayers() {
    if (!this.map) return

    try {
      console.log('🔄 Adding GeoJSON sources and layers...')
      
      // Get base path from environment for subdirectory deployment
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      
      // Add countries GeoJSON source and layer
      this.map.addSource('countries', {
        type: 'geojson',
        data: `${basePath}/data/countries-merged.geojson`
      })

      // Add borders GeoJSON source and layer  
      this.map.addSource('borders', {
        type: 'geojson',
        data: `${basePath}/data/borders.geojson`
      })

      console.log('✅ GeoJSON sources added')

      // Add country fill layer
      this.map.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'countries',
        paint: {
          'fill-color': [
            'case',
            ['has', 'overlanding'],
            [
              'case',
              ['==', ['get', 'overlanding'], 1], '#22c55e', // Green for easy
              ['==', ['get', 'overlanding'], 2], '#f59e0b', // Orange for moderate
              ['==', ['get', 'overlanding'], 3], '#ef4444', // Red for difficult
              '#9ca3af' // Gray for unknown
            ],
            '#e5e7eb' // Light gray for no data
          ],
          'fill-opacity': 0.6
        }
      })

      // Add country borders
      this.map.addLayer({
        id: 'countries-stroke',
        type: 'line',
        source: 'countries',
        paint: {
          'line-color': '#374151',
          'line-width': 0.5
        }
      })

      // Add border lines
      this.map.addLayer({
        id: 'border-lines',
        type: 'line',
        source: 'borders',
        paint: {
          'line-color': [
            'case',
            ['has', 'is_open'],
            [
              'case',
              ['==', ['get', 'is_open'], 1], '#22c55e', // Green for open
              ['==', ['get', 'is_open'], 2], '#f59e0b', // Orange for restricted
              ['==', ['get', 'is_open'], 0], '#ef4444', // Red for closed
              '#6b7280' // Gray for unknown
            ],
            '#9ca3af' // Default gray
          ],
          'line-width': 2
        }
      })

      // Add highlight layers
      this.map.addLayer({
        id: 'countries-highlight',
        type: 'fill',
        source: 'countries',
        paint: {
          'fill-color': '#1e40af', // Darker blue for country highlight
          'fill-opacity': 0.4
        },
        filter: ['==', 'id', '']
      })

      this.map.addLayer({
        id: 'border-highlight',
        type: 'line',
        source: 'borders',
        paint: {
          'line-color': '#ffffff', // White color for border highlight
          'line-width': 6 // Wider line for border highlight
        },
        filter: ['==', 'id', '']
      })

      this.map.addLayer({
        id: 'border-post-highlight',
        type: 'circle',
        source: 'border-posts',
        paint: {
          'circle-color': '#ffffff', // White color for border post highlight
          'circle-radius': 8,
          'circle-stroke-color': '#000000',
          'circle-stroke-width': 2
        },
        filter: ['==', 'id', '']
      })

      console.log('✅ Map layers added successfully (using GeoJSON)')

    } catch (error) {
      console.error('❌ Failed to add map layers:', error)
    }
  }

  getMap(): maplibregl.Map | null {
    return this.map
  }

  updateColors(colorScheme: string) {
    if (!this.map || !this.map.getLayer('countries-fill')) return

    console.log('🎨 Updating map colors for scheme:', colorScheme)
    
    this.map.setPaintProperty('countries-fill', 'fill-color', [
      'case',
      ['has', 'overlanding'],
      [
        'case',
        ['==', ['get', 'overlanding'], 1], colorScheme === 'overlanding' ? '#22c55e' : '#3b82f6',
        ['==', ['get', 'overlanding'], 2], colorScheme === 'overlanding' ? '#f59e0b' : '#8b5cf6',
        ['==', ['get', 'overlanding'], 3], colorScheme === 'overlanding' ? '#ef4444' : '#ef4444',
        '#9ca3af'
      ],
      '#e5e7eb'
    ])
  }

  cleanup() {
    if (this.map) {
      console.log('🧹 Cleaning up map instance')
      this.map.remove()
      this.map = null
    }
    this.currentContainer = null
  }

  // Clean up everything
  destroy() {
    this.cleanup()
  }
}

export default MapManager