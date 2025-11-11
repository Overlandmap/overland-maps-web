#!/usr/bin/env ts-node

/**
 * Script to merge countries-50m.geojson with Firestore data
 * Adds overlanding, iso_a2, driving, and carnet properties from Firestore
 * Exports as countries-merged.geojson
 * 
 * Usage: npm run merge-countries-geojson
 * 
 * The script:
 * 1. Loads the countries-50m.geojson file
 * 2. Fetches all countries from Firestore
 * 3. Matches GeoJSON features with Firestore documents by ISO codes and names
 * 4. Adds overlanding, iso_a2, driving, and carnet properties to matched features
 * 5. Exports the merged result as countries-merged.geojson
 */

import * as fs from 'fs'
import * as path from 'path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

interface CountryGeoJSONFeature {
  type: 'Feature'
  properties: {
    [key: string]: any
    // Properties we'll add from Firestore
    overlanding?: number
    iso_a2?: string
    driving?: string
    carnet?: number
    visa?: number
  }
  geometry: any
}

interface CountryGeoJSON {
  type: 'FeatureCollection'
  features: CountryGeoJSONFeature[]
}

interface FirestoreCountryData {
  id: string
  name: string
  overlanding?: number
  iso_a2?: string
  driving?: string
  iso_a3?: string
  adm0_a3?: string
  visa?: number
  carnet?: number
}

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required')
    }

    const serviceAccount = JSON.parse(serviceAccountKey)
    
    initializeApp({
      credential: cert(serviceAccount)
    })

    console.log('✅ Firebase Admin SDK initialized')
    return getFirestore()
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error)
    process.exit(1)
  }
}

/**
 * Load countries GeoJSON file
 */
function loadCountriesGeoJSON(): CountryGeoJSON {
  const geoJsonPath = path.join(process.cwd(), 'public', 'data', 'countries-50m.geojson')
  
  if (!fs.existsSync(geoJsonPath)) {
    console.error(`❌ GeoJSON file not found: ${geoJsonPath}`)
    process.exit(1)
  }

  try {
    const geoJsonContent = fs.readFileSync(geoJsonPath, 'utf-8')
    const geoJson = JSON.parse(geoJsonContent) as CountryGeoJSON
    
    console.log(`✅ Loaded GeoJSON with ${geoJson.features.length} features`)
    return geoJson
  } catch (error) {
    console.error('❌ Failed to load GeoJSON file:', error)
    process.exit(1)
  }
}

/**
 * Fetch all countries from Firestore
 */
async function fetchFirestoreCountries(db: FirebaseFirestore.Firestore): Promise<FirestoreCountryData[]> {
  try {
    console.log('🔄 Fetching countries from Firestore...')
    
    const countriesSnapshot = await db.collection('country').get()
    const countries: FirestoreCountryData[] = []

    countriesSnapshot.forEach(doc => {
      const data = doc.data()
      
      countries.push({
        id: doc.id,
        name: data.name || '',
        overlanding: data.overlanding,
        iso_a2: data.iso_a2,
        driving: data.driving,
        iso_a3: data.iso_a3,
        adm0_a3: data.adm0_a3,
        carnet: data.carnet,
        visa: data.visa
      })
    })



    console.log(`✅ Fetched ${countries.length} countries from Firestore`)
    return countries
  } catch (error) {
    console.error('❌ Failed to fetch countries from Firestore:', error)
    process.exit(1)
  }
}

/**
 * Create lookup maps for efficient matching
 */
function createLookupMaps(firestoreCountries: FirestoreCountryData[]) {
  const byISO3 = new Map<string, FirestoreCountryData>()
  const byADM0A3 = new Map<string, FirestoreCountryData>()
  const byName = new Map<string, FirestoreCountryData>()

  firestoreCountries.forEach(country => {
    // Index by ISO_A3
    if (country.iso_a3) {
      byISO3.set(country.iso_a3.toUpperCase(), country)
    }
    
    // Index by ADM0_A3
    if (country.adm0_a3) {
      byADM0A3.set(country.adm0_a3.toUpperCase(), country)
    }
    
    // Index by country ID (often matches codes)
    byISO3.set(country.id.toUpperCase(), country)
    
    // Index by name (normalized)
    const normalizedName = country.name.toLowerCase().trim()
    byName.set(normalizedName, country)
  })

  // Show data availability stats
  const countriesWithData = firestoreCountries.filter(country => 
    country.overlanding !== undefined || country.iso_a2 !== undefined || country.driving !== undefined || country.carnet !== undefined
  )
  console.log(`📊 Found ${countriesWithData.length} countries with overlanding/iso_a2/driving/carnet data`)

  console.log(`📊 Created lookup maps:`)
  console.log(`   - ISO3: ${byISO3.size} entries`)
  console.log(`   - ADM0_A3: ${byADM0A3.size} entries`)
  console.log(`   - Names: ${byName.size} entries`)

  return { byISO3, byADM0A3, byName }
}

/**
 * Find matching Firestore country for a GeoJSON feature
 */
function findMatchingCountry(
  feature: CountryGeoJSONFeature,
  lookupMaps: ReturnType<typeof createLookupMaps>
): FirestoreCountryData | null {
  const { byISO3, byADM0A3, byName } = lookupMaps
  const props = feature.properties

  // Try matching by ISO_A3
  if (props.ISO_A3) {
    const match = byISO3.get(props.ISO_A3.toUpperCase())
    if (match) return match
  }

  // Try matching by ADM0_A3
  if (props.ADM0_A3) {
    const match = byADM0A3.get(props.ADM0_A3.toUpperCase())
    if (match) return match
  }

  // Try matching by feature ID
  if (feature.properties.id) {
    const match = byISO3.get(feature.properties.id.toUpperCase())
    if (match) return match
  }

  // Try matching by name (normalized)
  if (props.NAME) {
    const normalizedName = props.NAME.toLowerCase().trim()
    const match = byName.get(normalizedName)
    if (match) return match
  }

  // Try alternative name fields
  const nameFields = ['NAME_EN', 'NAME_LONG', 'ADMIN']
  for (const field of nameFields) {
    if (props[field]) {
      const normalizedName = props[field].toLowerCase().trim()
      const match = byName.get(normalizedName)
      if (match) return match
    }
  }

  return null
}

/**
 * Merge Firestore data into GeoJSON features
 */
function mergeData(geoJson: CountryGeoJSON, firestoreCountries: FirestoreCountryData[]): CountryGeoJSON {
  console.log('🔄 Merging Firestore data with GeoJSON features...')
  
  const lookupMaps = createLookupMaps(firestoreCountries)
  let matchedCount = 0
  let unmatchedFeatures: string[] = []

  const mergedFeatures = geoJson.features.map(feature => {
    const matchingCountry = findMatchingCountry(feature, lookupMaps)
    
    if (matchingCountry) {
      matchedCount++
      

      
      // Add the properties from Firestore
      const mergedFeature: CountryGeoJSONFeature = {
        ...feature,
        properties: {
          ...feature.properties,
          overlanding: matchingCountry.overlanding,
          iso_a2: matchingCountry.iso_a2,
          driving: matchingCountry.driving,
          carnet: matchingCountry.carnet,
          visa: matchingCountry.visa
        }
      }
      
      return mergedFeature
    } else {
      // Track unmatched features for debugging
      const identifier = feature.properties.NAME || feature.properties.ISO_A3 || feature.properties.ADM0_A3 || 'Unknown'
      unmatchedFeatures.push(identifier)
      
      // Return feature without additional properties
      return feature
    }
  })

  console.log(`✅ Merge complete:`)
  console.log(`   - Matched: ${matchedCount}/${geoJson.features.length} features`)
  console.log(`   - Unmatched: ${unmatchedFeatures.length} features`)
  
  if (unmatchedFeatures.length > 0) {
    console.log(`⚠️ Unmatched features:`)
    unmatchedFeatures.slice(0, 10).forEach(name => console.log(`   - ${name}`))
    if (unmatchedFeatures.length > 10) {
      console.log(`   ... and ${unmatchedFeatures.length - 10} more`)
    }
  }

  return {
    type: 'FeatureCollection',
    features: mergedFeatures
  }
}

/**
 * Save merged GeoJSON to file
 */
function saveMergedGeoJSON(mergedGeoJson: CountryGeoJSON) {
  const outputPath = path.join(process.cwd(), 'public', 'data', 'countries-merged.geojson')
  
  try {
    const jsonString = JSON.stringify(mergedGeoJson, null, 2)
    fs.writeFileSync(outputPath, jsonString, 'utf-8')
    
    const fileSizeKB = Math.round(fs.statSync(outputPath).size / 1024)
    console.log(`✅ Saved merged GeoJSON: ${outputPath} (${fileSizeKB} KB)`)
  } catch (error) {
    console.error('❌ Failed to save merged GeoJSON:', error)
    process.exit(1)
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting countries GeoJSON merge process...')
  
  // Initialize Firebase
  const db = initializeFirebase()
  
  // Load GeoJSON file
  const geoJson = loadCountriesGeoJSON()
  
  // Fetch Firestore data
  const firestoreCountries = await fetchFirestoreCountries(db)
  
  // Merge data
  const mergedGeoJson = mergeData(geoJson, firestoreCountries)
  
  // Save result
  saveMergedGeoJSON(mergedGeoJson)
  
  console.log('🎉 Merge process completed successfully!')
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
}