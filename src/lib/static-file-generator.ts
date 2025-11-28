import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { ProcessedCountryData, ProcessedBorderData, ProcessedBorderPostData, ISO3Lookup } from '../types'

export class StaticFileGenerator {
  private outputDir: string

  constructor(outputDir: string = 'public/data') {
    this.outputDir = outputDir
    this.ensureOutputDirectory()
  }

  /**
   * Generate static JSON file for countries with iso_a3 lookup
   */
  generateCountryJSON(countries: ProcessedCountryData[]): void {
    console.log('🔄 Generating country JSON file...')
    
    try {
      const filePath = join(this.outputDir, 'countries.json')
      
      // Create optimized country data for frontend consumption
      const optimizedCountries = countries.map(country => ({
        id: country.id,
        iso_a3: country.iso_a3,
        name: country.name,
        parameters: country.parameters,
        borderIds: country.borderIds,
        // Add metadata for frontend use
        hasBorders: (country.borderIds?.length || 0) > 0,
        hasIso3: !!country.iso_a3
      }))

      const jsonData = {
        metadata: {
          generatedAt: new Date().toISOString(),
          totalCountries: countries.length,
          countriesWithIso3: countries.filter(c => c.iso_a3).length,
          countriesWithBorders: countries.filter(c => (c.borderIds?.length || 0) > 0).length
        },
        countries: optimizedCountries
      }

      this.writeJSONFile(filePath, jsonData)
      console.log(`✅ Generated countries.json with ${countries.length} countries`)
    } catch (error) {
      console.warn('⚠️ Failed to generate country JSON:', error)
      console.log('Continuing with build...')
    }
  }

  /**
   * Generate static JSON file for borders
   */
  generateBorderJSON(borders: ProcessedBorderData[]): void {
    console.log('🔄 Generating border JSON file...')
    
    try {
      const filePath = join(this.outputDir, 'borders.json')
      
      // Create optimized border data (without full geometry for size optimization)
      const optimizedBorders = borders.map(border => ({
        id: border.id,
        properties: border.properties,
        // Include basic geometry info but not full coordinates
        geometryType: border.geometry?.type,
        hasGeometry: !!border.geometry
      }))

      const jsonData = {
        metadata: {
          generatedAt: new Date().toISOString(),
          totalBorders: borders.length,
          bordersWithGeometry: borders.filter(b => b.geometry).length
        },
        borders: optimizedBorders
      }

      this.writeJSONFile(filePath, jsonData)
      console.log(`✅ Generated borders.json with ${borders.length} borders`)
    } catch (error) {
      console.warn('⚠️ Failed to generate border JSON:', error)
      console.log('Continuing with build...')
    }
  }

  /**
   * Generate border GeoJSON files for MapLibre overlay layers
   */
  generateBorderGeoJSONFiles(geoData: GeoJSON.FeatureCollection): void {
    console.log('🔄 Generating border GeoJSON files...')
    
    try {
      // Generate main borders GeoJSON file
      const mainFilePath = join(this.outputDir, 'borders.geojson')
      this.writeJSONFile(mainFilePath, geoData)
      
      // Generate optimized version with reduced precision for better performance
      const optimizedGeoData = this.optimizeGeoJSON(geoData)
      const optimizedFilePath = join(this.outputDir, 'borders-optimized.geojson')
      this.writeJSONFile(optimizedFilePath, optimizedGeoData)
      
      // Generate chunked files for large datasets (split by geometry type or region if needed)
      this.generateChunkedGeoJSON(geoData, 'borders')
      
      console.log(`✅ Generated border GeoJSON files with ${geoData.features.length} features`)
    } catch (error) {
      console.warn('⚠️ Failed to generate border GeoJSON:', error)
      console.log('Continuing with build...')
    }
  }

  /**
   * Generate border post GeoJSON files for MapLibre overlay layers
   */
  generateBorderPostGeoJSONFiles(geoData: GeoJSON.FeatureCollection): void {
    console.log('🔄 Generating border post GeoJSON files...')
    
    try {
      // Generate main border posts GeoJSON file
      const mainFilePath = join(this.outputDir, 'border-posts.geojson')
      this.writeJSONFile(mainFilePath, geoData)
      
      // Generate optimized version (Point geometries are already simple, but we can still optimize properties)
      const optimizedGeoData = this.optimizeGeoJSON(geoData)
      const optimizedFilePath = join(this.outputDir, 'border-posts-optimized.geojson')
      this.writeJSONFile(optimizedFilePath, optimizedGeoData)
      
      console.log(`✅ Generated border post GeoJSON files with ${geoData.features.length} features`)
    } catch (error) {
      console.warn('⚠️ Failed to generate border post GeoJSON:', error)
      console.log('Continuing with build...')
    }
  }

  /**
   * Generate border post JSON file without geographic information (for detail lookups)
   */
  generateBorderPostJSONFile(borderPosts: ProcessedBorderPostData[]): void {
    console.log('🔄 Generating border post JSON file (without geography)...')
    
    try {
      // Extract only the data properties, excluding geometry
      const borderPostsData = borderPosts.map(bp => ({
        id: bp.id,
        is_open: bp.is_open,
        ...bp.properties
      }))
      
      const filePath = join(this.outputDir, 'border-posts.json')
      this.writeJSONFile(filePath, borderPostsData)
      
      console.log(`✅ Generated border-posts.json with ${borderPostsData.length} entries`)
    } catch (error) {
      console.warn('⚠️ Failed to generate border post JSON:', error)
      console.log('Continuing with build...')
    }
  }

  /**
   * Generate zones JSON file (for detail lookups)
   */
  generateZonesJSONFile(zones: any[]): void {
    console.log('🔄 Generating zones JSON file...')
    
    try {
      // Create a lookup object keyed by zone ID
      const zonesLookup: Record<string, any> = {}
      
      zones.forEach(zone => {
        zonesLookup[zone.id] = {
          id: zone.id,
          type: zone.type,
          ...zone.properties
        }
      })
      
      const filePath = join(this.outputDir, 'zones.json')
      this.writeJSONFile(filePath, zonesLookup)
      
      console.log(`✅ Generated zones.json with ${zones.length} entries`)
    } catch (error) {
      console.warn('⚠️ Failed to generate zones JSON:', error)
      console.log('Continuing with build...')
    }
  }

  /**
   * Generate zone GeoJSON files
   */
  generateZoneGeoJSONFiles(geoData: GeoJSON.FeatureCollection): void {
    console.log('🔄 Generating zone GeoJSON files...')
    
    try {
      // Generate full GeoJSON file
      const fullPath = join(this.outputDir, 'zones.geojson')
      this.writeJSONFile(fullPath, geoData)
      
      console.log(`✅ Generated zones.geojson with ${geoData.features.length} features`)
    } catch (error) {
      console.warn('⚠️ Failed to generate zone GeoJSON files:', error)
      console.log('Continuing with build...')
    }
  }

  /**
   * Generate iso_a3 lookup JSON for runtime country data access
   */
  generateISO3LookupJSON(lookup: ISO3Lookup): void {
    console.log('🔄 Generating iso_a3 lookup JSON...')
    
    try {
      const filePath = join(this.outputDir, 'iso3-lookup.json')
      
      const jsonData = {
        metadata: {
          generatedAt: new Date().toISOString(),
          totalMappings: Object.keys(lookup).length,
          availableIso3Codes: Object.keys(lookup).sort()
        },
        lookup: lookup
      }

      this.writeJSONFile(filePath, jsonData)
      console.log(`✅ Generated iso3-lookup.json with ${Object.keys(lookup).length} mappings`)
    } catch (error) {
      console.warn('⚠️ Failed to generate iso_a3 lookup JSON:', error)
      console.log('Continuing with build...')
    }
  }

  /**
   * Generate a comprehensive manifest file listing all generated files
   */
  generateManifest(
    countries: ProcessedCountryData[], 
    borders: ProcessedBorderData[], 
    borderPosts: ProcessedBorderPostData[],
    lookup: ISO3Lookup
  ): void {
    console.log('🔄 Generating data manifest...')
    
    try {
      const filePath = join(this.outputDir, 'manifest.json')
      
      const manifest = {
        generatedAt: new Date().toISOString(),
        version: '1.1.0', // Updated version for border posts feature
        files: {
          'countries.json': {
            description: 'Country data with parameters and border references',
            recordCount: countries.length,
            sizeEstimate: this.estimateFileSize(countries)
          },
          'borders.json': {
            description: 'Border metadata for route generation only (data loaded from Firestore)',
            recordCount: borders.length,
            sizeEstimate: this.estimateFileSize(borders),
            note: 'Border details are always loaded from Firestore, not from static files'
          },
          'border-posts.json': {
            description: 'Border post details without geographic data (for lookups)',
            recordCount: borderPosts.length,
            sizeEstimate: this.estimateFileSize(borderPosts)
          },
          'border-posts.geojson': {
            description: 'Border crossing posts as Point features',
            featureCount: borderPosts.length,
            sizeEstimate: 'Small - Point geometries with status data'
          },
          'border-posts-optimized.geojson': {
            description: 'Optimized border post Point features',
            featureCount: borderPosts.length,
            sizeEstimate: 'Small - optimized Point features'
          },
          'iso3-lookup.json': {
            description: 'ISO A3 code to country data lookup table',
            mappingCount: Object.keys(lookup).length,
            sizeEstimate: this.estimateFileSize(lookup)
          }
        },
        statistics: {
          totalCountries: countries.length,
          countriesWithIso3: countries.filter(c => c.iso_a3).length,
          totalBorders: borders.length,
          bordersWithGeometry: borders.filter(b => b.geometry).length,
          totalBorderPosts: borderPosts.length,
          borderPostsWithGeometry: borderPosts.filter(bp => bp.geometry).length,
          iso3Mappings: Object.keys(lookup).length
        }
      }

      this.writeJSONFile(filePath, manifest)
      console.log('✅ Generated data manifest')
    } catch (error) {
      console.warn('⚠️ Failed to generate manifest:', error)
      console.log('Continuing with build...')
    }
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDirectory(): void {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true })
      console.log(`📁 Created output directory: ${this.outputDir}`)
    }
  }

  /**
   * Write JSON data to file with proper formatting and validation
   */
  private writeJSONFile(filePath: string, data: any): void {
    try {
      // Validate that data can be serialized
      const jsonString = JSON.stringify(data, null, 2)
      
      // Write to file
      writeFileSync(filePath, jsonString, 'utf8')
      
      // Log file size
      const sizeKB = Math.round(Buffer.byteLength(jsonString, 'utf8') / 1024)
      console.log(`📄 Written ${filePath} (${sizeKB} KB)`)
    } catch (error) {
      console.warn(`⚠️ Failed to write ${filePath}:`, error)
      console.log('Continuing with build...')
    }
  }

  /**
   * Optimize GeoJSON by reducing coordinate precision
   */
  private optimizeGeoJSON(geoData: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    const optimized: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: geoData.features.map(feature => ({
        ...feature,
        geometry: this.reduceGeometryPrecision(feature.geometry, 6) // 6 decimal places (~0.1m precision)
      }))
    }
    
    return optimized
  }

  /**
   * Reduce coordinate precision in geometry
   */
  private reduceGeometryPrecision(geometry: GeoJSON.Geometry, precision: number): GeoJSON.Geometry {
    const roundCoordinate = (coord: number) => Math.round(coord * Math.pow(10, precision)) / Math.pow(10, precision)
    
    const processCoordinates = (coords: any): any => {
      if (Array.isArray(coords)) {
        if (typeof coords[0] === 'number') {
          // This is a coordinate pair [lng, lat]
          return coords.map(roundCoordinate)
        } else {
          // This is an array of coordinates or coordinate arrays
          return coords.map(processCoordinates)
        }
      }
      return coords
    }

    // Handle GeometryCollection separately
    if (geometry.type === 'GeometryCollection') {
      return {
        ...geometry,
        geometries: geometry.geometries.map(geom => this.reduceGeometryPrecision(geom, precision))
      }
    }

    // Handle other geometry types that have coordinates
    const geometryWithCoords = geometry as GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon | GeoJSON.MultiPoint | GeoJSON.MultiLineString | GeoJSON.MultiPolygon
    
    return {
      ...geometryWithCoords,
      coordinates: processCoordinates(geometryWithCoords.coordinates)
    }
  }

  /**
   * Generate chunked GeoJSON files for better performance with large datasets
   */
  private generateChunkedGeoJSON(geoData: GeoJSON.FeatureCollection, prefix: string = 'borders'): void {
    const chunkSize = 1000 // Features per chunk
    const features = geoData.features
    
    if (features.length <= chunkSize) {
      return // No need to chunk small datasets
    }
    
    const chunks = Math.ceil(features.length / chunkSize)
    
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, features.length)
      const chunkFeatures = features.slice(start, end)
      
      const chunkGeoJSON: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: chunkFeatures
      }
      
      const chunkFilePath = join(this.outputDir, `${prefix}-chunk-${i + 1}.geojson`)
      this.writeJSONFile(chunkFilePath, chunkGeoJSON)
    }
    
    console.log(`📦 Generated ${chunks} ${prefix} GeoJSON chunks`)
  }

  /**
   * Estimate file size for manifest
   */
  private estimateFileSize(data: any): string {
    try {
      const jsonString = JSON.stringify(data)
      const sizeKB = Math.round(Buffer.byteLength(jsonString, 'utf8') / 1024)
      
      if (sizeKB < 1024) {
        return `${sizeKB} KB`
      } else {
        const sizeMB = Math.round(sizeKB / 1024 * 10) / 10
        return `${sizeMB} MB`
      }
    } catch {
      return 'Unknown'
    }
  }
}