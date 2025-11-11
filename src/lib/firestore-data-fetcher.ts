import { getFirestoreAdmin, withRetry } from './firebase-admin'
import { CountryData, BorderData, BorderPostData } from '../types'

export class FirestoreDataFetcher {
  private db = getFirestoreAdmin()

  /**
   * Fetch all documents from the Country Collection
   * Includes iso_a3 field for linking with map features
   */
  async fetchCountries(): Promise<CountryData[]> {
    console.log('🔄 Fetching countries from Firestore...')
    
    return withRetry(async () => {
      const snapshot = await this.db.collection('country').get()
      
      if (snapshot.empty) {
        console.warn('⚠️ No countries found in Firestore')
        return []
      }

      const countries: CountryData[] = []
      
      snapshot.forEach((doc: any) => {
        const data = doc.data()
        
        const country: CountryData = {
          id: doc.id,
          iso_a3: data.iso_a3 || data.iso3 || data.ISO_A3, // Handle different field name variations
          name: data.name || data.country_name || 'Unknown',
          parameters: { ...data }, // Include all fields as parameters
          borderIds: [], // Will be populated when fetching borders subcollection
          disputed: data.disputed || undefined // Extract disputed field to top level
        }
        
        countries.push(country)
      })

      console.log(`✅ Fetched ${countries.length} countries`)
      return countries
    })
  }

  /**
   * Fetch all documents from the Border Collection
   * Extracts GeoJSON geometry from geomString field
   */
  async fetchBorders(): Promise<BorderData[]> {
    console.log('🔄 Fetching borders from Firestore...')
    
    return withRetry(async () => {
      const snapshot = await this.db.collection('border').get()
      
      if (snapshot.empty) {
        console.warn('⚠️ No borders found in Firestore')
        return []
      }

      const borders: BorderData[] = []
      
      snapshot.forEach((doc: any) => {
        const data = doc.data()
        
        if (!data.geomString) {
          console.warn(`⚠️ Border ${doc.id} missing geomString field`)
          return
        }

        const border: BorderData = {
          id: doc.id,
          geomString: data.geomString,
          properties: { ...data } // Include all other fields as properties
        }
        
        borders.push(border)
      })

      console.log(`✅ Fetched ${borders.length} borders`)
      return borders
    })
  }

  /**
   * Fetch borders subcollection for a specific country
   * Returns array of border document IDs referenced by the country
   */
  async fetchCountryBorders(countryId: string): Promise<string[]> {
    return withRetry(async () => {
      const snapshot = await this.db
        .collection('country')
        .doc(countryId)
        .collection('borders')
        .get()
      
      if (snapshot.empty) {
        return []
      }

      const borderIds: string[] = []
      
      snapshot.forEach((doc: any) => {
        // The document ID in the subcollection should reference a border document
        borderIds.push(doc.id)
      })

      return borderIds
    })
  }

  /**
   * Fetch all countries with their associated border IDs
   * This combines country data with their borders subcollections
   */
  async fetchCountriesWithBorders(): Promise<CountryData[]> {
    console.log('🔄 Fetching countries with border relationships...')
    
    const countries = await this.fetchCountries()
    
    // Fetch border relationships for each country
    const countriesWithBorders = await Promise.all(
      countries.map(async (country) => {
        try {
          const borderIds = await this.fetchCountryBorders(country.id)
          return {
            ...country,
            borderIds
          }
        } catch (error) {
          console.warn(`⚠️ Failed to fetch borders for country ${country.id}:`, error)
          return country // Return country without border IDs if fetch fails
        }
      })
    )

    console.log(`✅ Fetched ${countriesWithBorders.length} countries with border relationships`)
    return countriesWithBorders
  }

  /**
   * Fetch all documents from the Border Post Collection
   * Extracts Point geometry from location field
   */
  async fetchBorderPosts(): Promise<BorderPostData[]> {
    console.log('🔄 Fetching border posts from Firestore...')
    
    return withRetry(async () => {
      const snapshot = await this.db.collection('border_post').get()
      
      if (snapshot.empty) {
        console.warn('⚠️ No border posts found in Firestore')
        return []
      }

      const borderPosts: BorderPostData[] = []
      
      snapshot.forEach((doc: any) => {
        const data = doc.data()
        
        if (!data.location) {
          console.warn(`⚠️ Border post ${doc.id} missing location field`)
          return
        }

        const borderPost: BorderPostData = {
          id: doc.id,
          location: data.location,
          is_open: data.is_open,
          properties: { ...data } // Include all other fields as properties
        }
        
        borderPosts.push(borderPost)
      })

      console.log(`✅ Fetched ${borderPosts.length} border posts`)
      return borderPosts
    })
  }

  /**
   * Validate that required collections exist and have data
   */
  async validateCollections(): Promise<{ countries: boolean; borders: boolean; borderPosts: boolean }> {
    console.log('🔄 Validating Firestore collections...')
    
    const results = {
      countries: false,
      borders: false,
      borderPosts: false
    }

    try {
      // Check country collection
      const countrySnapshot = await this.db.collection('country').limit(1).get()
      results.countries = !countrySnapshot.empty
      
      // Check border collection
      const borderSnapshot = await this.db.collection('border').limit(1).get()
      results.borders = !borderSnapshot.empty
      
      // Check border_post collection
      const borderPostSnapshot = await this.db.collection('border_post').limit(1).get()
      results.borderPosts = !borderPostSnapshot.empty
      
      console.log('📊 Collection validation results:', results)
      
      if (!results.countries) {
        console.error('❌ Country collection is empty or does not exist')
      }
      
      if (!results.borders) {
        console.error('❌ Border collection is empty or does not exist')
      }
      
      if (!results.borderPosts) {
        console.warn('⚠️ Border post collection is empty or does not exist')
      }
      
      return results
    } catch (error) {
      console.error('❌ Collection validation failed:', error)
      throw error
    }
  }

  /**
   * Get collection statistics for monitoring
   */
  async getCollectionStats(): Promise<{
    countryCount: number
    borderCount: number
    borderPostCount: number
    countriesWithBorders: number
  }> {
    console.log('📊 Gathering collection statistics...')
    
    const [countries, borders, borderPosts] = await Promise.all([
      this.fetchCountries(),
      this.fetchBorders(),
      this.fetchBorderPosts()
    ])

    // Count countries that have border relationships
    let countriesWithBorders = 0
    for (const country of countries) {
      const borderIds = await this.fetchCountryBorders(country.id)
      if (borderIds.length > 0) {
        countriesWithBorders++
      }
    }

    const stats = {
      countryCount: countries.length,
      borderCount: borders.length,
      borderPostCount: borderPosts.length,
      countriesWithBorders
    }

    console.log('📊 Collection statistics:', stats)
    return stats
  }

  /**
   * Cleanup Firebase connections
   */
  async cleanup(): Promise<void> {
    try {
      // Note: Firebase Admin SDK doesn't have a direct close method
      // The process.exit(0) in the build script will handle cleanup
      console.log('🧹 Cleaning up Firebase connections...')
    } catch (error) {
      console.warn('⚠️ Error during cleanup:', error)
    }
  }
}