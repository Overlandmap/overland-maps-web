import { CountryData, ProcessedCountryData, BorderData, ProcessedBorderData, BorderPostData, ProcessedBorderPostData, ISO3Lookup } from '../types'

export class DataProcessor {
  /**
   * Process and validate country data with iso_a3 field handling
   */
  processCountryData(countries: CountryData[]): ProcessedCountryData[] {
    console.log('🔄 Processing country data...')
    
    const processed: ProcessedCountryData[] = []
    const seenIso3Codes = new Set<string>()
    
    for (const country of countries) {
      try {
        // Validate required fields
        if (!country.id) {
          console.warn(`⚠️ Skipping country without ID: ${JSON.stringify(country)}`)
          continue
        }

        // Process iso_a3 field - handle various field name variations
        let iso_a3 = country.iso_a3 || 
                     country.parameters?.iso3 || 
                     country.parameters?.ISO_A3 || 
                     country.parameters?.iso_a3

        // Clean and validate iso_a3 code
        if (iso_a3) {
          iso_a3 = String(iso_a3).trim().toUpperCase()
          
          // Validate format (should be 3 letters)
          if (!/^[A-Z]{3}$/.test(iso_a3)) {
            console.warn(`⚠️ Invalid iso_a3 format for country ${country.name}: ${iso_a3}`)
            iso_a3 = undefined
          } else if (seenIso3Codes.has(iso_a3)) {
            console.warn(`⚠️ Duplicate iso_a3 code found: ${iso_a3} for country ${country.name}`)
          } else {
            seenIso3Codes.add(iso_a3)
          }
        }

        // Create processed country data
        const processedCountry: ProcessedCountryData = {
          id: country.id,
          iso_a3: iso_a3,
          name: country.name || 'Unknown Country',
          parameters: this.cleanParameters(country.parameters || {}),
          borderIds: country.borderIds || []
        }

        processed.push(processedCountry)
      } catch (error) {
        console.error(`❌ Error processing country ${country.id}:`, error)
      }
    }

    console.log(`✅ Processed ${processed.length} countries (${seenIso3Codes.size} with valid iso_a3 codes)`)
    return processed
  }

  /**
   * Process border data and parse GeoJSON from geomString fields
   */
  processBorderData(borders: BorderData[]): ProcessedBorderData[] {
    console.log('🔄 Processing border data...')
    
    const processed: ProcessedBorderData[] = []
    
    for (const border of borders) {
      try {
        // Validate required fields
        if (!border.id || !border.geomString) {
          console.warn(`⚠️ Skipping border without ID or geomString: ${border.id}`)
          continue
        }

        // Parse GeoJSON geometry from geomString
        const geometry = this.parseGeoJSONGeometry(border.geomString)
        if (!geometry) {
          console.warn(`⚠️ Skipping border ${border.id} - invalid GeoJSON geometry`)
          continue
        }

        // Clean up border_posts field by trimming keys if it exists
        const cleanedProperties = this.cleanParameters(border.properties || {})
        if (cleanedProperties.border_posts && typeof cleanedProperties.border_posts === 'object') {
          const trimmedBorderPosts: Record<string, any> = {}
          for (const [key, value] of Object.entries(cleanedProperties.border_posts)) {
            trimmedBorderPosts[key.trim()] = value
          }
          cleanedProperties.border_posts = trimmedBorderPosts
        }

        // Create GeoJSON feature
        const feature: GeoJSON.Feature = {
          type: 'Feature',
          geometry: geometry,
          properties: {
            id: border.id,
            ...cleanedProperties
          }
        }

        const processedBorder: ProcessedBorderData = {
          id: border.id,
          geomString: border.geomString,
          properties: { ...border.properties, ...cleanedProperties },
          geometry: geometry,
          feature: feature
        }

        processed.push(processedBorder)
      } catch (error) {
        console.error(`❌ Error processing border ${border.id}:`, error)
      }
    }

    console.log(`✅ Processed ${processed.length} borders with valid GeoJSON`)
    return processed
  }

  /**
   * Process border post data and parse Point geometry from location field
   */
  processBorderPostData(borderPosts: BorderPostData[]): ProcessedBorderPostData[] {
    console.log('🔄 Processing border post data...')
    
    const processed: ProcessedBorderPostData[] = []
    
    for (const borderPost of borderPosts) {
      try {
        // Validate required fields
        if (!borderPost.id || !borderPost.location) {
          console.warn(`⚠️ Skipping border post without ID or location: ${borderPost.id}`)
          continue
        }

        // Parse Point geometry from location field
        const geometry = this.parsePointGeometry(borderPost.location)
        if (!geometry) {
          console.warn(`⚠️ Skipping border post ${borderPost.id} - invalid Point geometry`)
          continue
        }

        // Create GeoJSON feature
        const feature: GeoJSON.Feature = {
          type: 'Feature',
          geometry: geometry,
          properties: {
            id: borderPost.id,
            is_open: borderPost.is_open ?? -1, // Default to unknown if not specified
            ...this.cleanParameters(borderPost.properties || {})
          }
        }

        const processedBorderPost: ProcessedBorderPostData = {
          id: borderPost.id,
          location: borderPost.location,
          is_open: borderPost.is_open,
          properties: borderPost.properties,
          geometry: geometry,
          feature: feature
        }

        processed.push(processedBorderPost)
      } catch (error) {
        console.error(`❌ Error processing border post ${borderPost.id}:`, error)
      }
    }

    console.log(`✅ Processed ${processed.length} border posts with valid Point geometry`)
    return processed
  }

  /**
   * Generate GeoJSON FeatureCollection from processed border data
   */
  generateBorderGeoJSON(borders: ProcessedBorderData[]): GeoJSON.FeatureCollection {
    console.log('🔄 Generating border GeoJSON FeatureCollection...')
    
    const features = borders.map(border => border.feature)
    
    const featureCollection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: features
    }

    console.log(`✅ Generated GeoJSON FeatureCollection with ${features.length} border features`)
    return featureCollection
  }

  /**
   * Generate GeoJSON FeatureCollection from processed border post data
   */
  generateBorderPostGeoJSON(borderPosts: ProcessedBorderPostData[]): GeoJSON.FeatureCollection {
    console.log('🔄 Generating border post GeoJSON FeatureCollection...')
    
    const features = borderPosts.map(borderPost => borderPost.feature)
    
    const featureCollection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: features
    }

    console.log(`✅ Generated GeoJSON FeatureCollection with ${features.length} border post features`)
    return featureCollection
  }

  /**
   * Create iso_a3 to country data lookup table for map feature linking
   */
  createISO3Lookup(countries: ProcessedCountryData[]): ISO3Lookup {
    console.log('🔄 Creating iso_a3 lookup table...')
    
    const lookup: ISO3Lookup = {}
    let validMappings = 0
    
    for (const country of countries) {
      if (country.iso_a3) {
        lookup[country.iso_a3] = country
        validMappings++
      }
    }

    console.log(`✅ Created iso_a3 lookup table with ${validMappings} mappings`)
    return lookup
  }

  /**
   * Parse GeoJSON geometry from string with validation
   */
  private parseGeoJSONGeometry(geomString: string): GeoJSON.Geometry | null {
    try {
      const parsed = JSON.parse(geomString)
      
      // Validate that it's a valid GeoJSON geometry
      if (!parsed || typeof parsed !== 'object') {
        return null
      }

      // Check for required type field
      if (!parsed.type || typeof parsed.type !== 'string') {
        return null
      }

      // Validate geometry type
      const validTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection']
      if (!validTypes.includes(parsed.type)) {
        return null
      }

      // Basic coordinate validation for non-GeometryCollection types
      if (parsed.type !== 'GeometryCollection' && !parsed.coordinates) {
        return null
      }

      return parsed as GeoJSON.Geometry
    } catch (error) {
      console.warn('Invalid JSON in geomString:', error)
      return null
    }
  }

  /**
   * Parse Point geometry from location field (can be GeoJSON Point or coordinate array)
   */
  private parsePointGeometry(location: any): GeoJSON.Point | null {
    try {
      // If location is already a GeoJSON Point
      if (location && location.type === 'Point' && location.coordinates) {
        return this.validatePointCoordinates(location.coordinates) ? location : null
      }

      // If location is a coordinate array [lng, lat]
      if (Array.isArray(location) && location.length >= 2) {
        const coordinates = [Number(location[0]), Number(location[1])]
        if (this.validatePointCoordinates(coordinates)) {
          return {
            type: 'Point',
            coordinates: coordinates
          }
        }
      }

      // If location is a string, try to parse as JSON
      if (typeof location === 'string') {
        const parsed = JSON.parse(location)
        return this.parsePointGeometry(parsed)
      }

      // If location has lat/lng or latitude/longitude properties
      if (location && typeof location === 'object') {
        const lng = location.lng || location.longitude || location.lon
        const lat = location.lat || location.latitude
        
        if (lng !== undefined && lat !== undefined) {
          const coordinates = [Number(lng), Number(lat)]
          if (this.validatePointCoordinates(coordinates)) {
            return {
              type: 'Point',
              coordinates: coordinates
            }
          }
        }
      }

      return null
    } catch (error) {
      console.warn('Invalid location data:', error)
      return null
    }
  }

  /**
   * Validate Point coordinates [lng, lat]
   */
  private validatePointCoordinates(coordinates: number[]): boolean {
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return false
    }

    const [lng, lat] = coordinates
    
    // Check if coordinates are valid numbers
    if (isNaN(lng) || isNaN(lat)) {
      return false
    }

    // Check if coordinates are within valid ranges
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return false
    }

    return true
  }

  /**
   * Clean and normalize parameter objects
   */
  private cleanParameters(params: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(params)) {
      // Skip null, undefined, or empty string values
      if (value === null || value === undefined || value === '') {
        continue
      }
      
      // Convert key to camelCase and clean it
      const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
      
      // Store the cleaned value
      cleaned[cleanKey] = value
    }
    
    return cleaned
  }

  /**
   * Validate processed data integrity
   */
  validateProcessedData(
    countries: ProcessedCountryData[], 
    borders: ProcessedBorderData[], 
    borderPosts?: ProcessedBorderPostData[]
  ): {
    isValid: boolean
    issues: string[]
  } {
    console.log('🔄 Validating processed data integrity...')
    
    const issues: string[] = []
    
    // Check for countries without iso_a3 codes
    const countriesWithoutIso3 = countries.filter(c => !c.iso_a3)
    if (countriesWithoutIso3.length > 0) {
      issues.push(`${countriesWithoutIso3.length} countries missing iso_a3 codes`)
    }
    
    // Check for duplicate iso_a3 codes
    const iso3Codes = countries.map(c => c.iso_a3).filter(Boolean)
    const uniqueIso3Codes = new Set(iso3Codes)
    if (iso3Codes.length !== uniqueIso3Codes.size) {
      issues.push('Duplicate iso_a3 codes found')
    }
    
    // Check for borders without valid geometry
    const bordersWithoutGeometry = borders.filter(b => !b.geometry)
    if (bordersWithoutGeometry.length > 0) {
      issues.push(`${bordersWithoutGeometry.length} borders missing valid geometry`)
    }
    
    // Check border posts if provided
    if (borderPosts) {
      const borderPostsWithoutGeometry = borderPosts.filter(bp => !bp.geometry)
      if (borderPostsWithoutGeometry.length > 0) {
        issues.push(`${borderPostsWithoutGeometry.length} border posts missing valid Point geometry`)
      }
      
      // Check for border posts with invalid is_open values
      const borderPostsWithInvalidStatus = borderPosts.filter(bp => 
        bp.is_open !== undefined && (bp.is_open < -1 || bp.is_open > 3)
      )
      if (borderPostsWithInvalidStatus.length > 0) {
        issues.push(`${borderPostsWithInvalidStatus.length} border posts have invalid is_open values`)
      }
    }
    
    // Check border-country relationships
    const allBorderIds = new Set(borders.map(b => b.id))
    const referencedBorderIds = new Set(countries.flatMap(c => c.borderIds))
    const unreferencedBorders = borders.filter(b => !referencedBorderIds.has(b.id))
    
    if (unreferencedBorders.length > 0) {
      issues.push(`${unreferencedBorders.length} borders not referenced by any country`)
    }
    
    const isValid = issues.length === 0
    
    if (isValid) {
      console.log('✅ Data validation passed')
    } else {
      console.warn('⚠️ Data validation issues found:', issues)
    }
    
    return { isValid, issues }
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(
    originalCountries: CountryData[], 
    processedCountries: ProcessedCountryData[],
    originalBorders: BorderData[],
    processedBorders: ProcessedBorderData[]
  ) {
    const countriesWithIso3 = processedCountries.filter(c => c.iso_a3).length
    const bordersWithGeometry = processedBorders.filter(b => b.geometry).length
    
    return {
      countries: {
        original: originalCountries.length,
        processed: processedCountries.length,
        withIso3: countriesWithIso3,
        successRate: Math.round((processedCountries.length / originalCountries.length) * 100)
      },
      borders: {
        original: originalBorders.length,
        processed: processedBorders.length,
        withGeometry: bordersWithGeometry,
        successRate: Math.round((processedBorders.length / originalBorders.length) * 100)
      }
    }
  }
}