/**
 * Utility functions for geometry calculations
 */

export interface GeometryBounds {
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number
}

export type GeometryType = 'Point' | 'LineString' | 'MultiLineString'

export interface Geometry {
  type: GeometryType
  coordinates: number[] | number[][] | number[][][]
}

/**
 * Calculate bounding box for itinerary geometry with padding
 * @param geometry GeoJSON geometry object
 * @returns Bounds array in format [[minLng, minLat], [maxLng, maxLat]] or null if invalid
 */
export function calculateItineraryBounds(geometry: any): [[number, number], [number, number]] | null {
  if (!geometry || !geometry.coordinates) return null
  
  let minLng = Infinity, maxLng = -Infinity
  let minLat = Infinity, maxLat = -Infinity
  let coordinateCount = 0
  
  const processCoordinate = (coord: number[]) => {
    if (!coord || coord.length < 2) return
    const [lng, lat] = coord
    // Skip invalid coordinates (NaN, Infinity)
    if (!isFinite(lng) || !isFinite(lat)) return
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    coordinateCount++
  }
  
  // Handle different geometry types
  if (geometry.type === 'Point') {
    processCoordinate(geometry.coordinates)
  } else if (geometry.type === 'LineString') {
    if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
      return null
    }
    geometry.coordinates.forEach(processCoordinate)
  } else if (geometry.type === 'MultiLineString') {
    if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
      return null
    }
    geometry.coordinates.forEach((line: number[][]) => {
      if (Array.isArray(line)) {
        line.forEach(processCoordinate)
      }
    })
  } else {
    // Unsupported geometry type
    return null
  }
  
  // If no valid coordinates were processed, return null
  if (coordinateCount === 0 || minLng === Infinity) {
    return null
  }
  
  // Calculate padding - use minimum padding for point geometries or when all coordinates are identical
  const lngRange = maxLng - minLng
  const latRange = maxLat - minLat
  
  // For points or identical coordinates, use a small fixed padding
  const minPadding = 0.001 // Small padding for points or identical coordinates
  const lngPadding = lngRange > 0 ? lngRange * 0.1 : minPadding
  const latPadding = latRange > 0 ? latRange * 0.1 : minPadding
  
  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding]
  ]
}