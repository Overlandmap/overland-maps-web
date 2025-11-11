#!/usr/bin/env ts-node

/**
 * Script to normalize carnet field values in Firestore
 * Converts string values like "1", "2" to numeric values 1, 2
 * 
 * Usage:
 *   npm run normalize-carnet                    # Run the normalization
 *   npm run normalize-carnet:dry-run           # Preview changes without applying
 *   
 *   # Or run directly:
 *   npx ts-node --project scripts/tsconfig.json scripts/normalize-carnet-field.ts
 * 
 * Options:
 *   --dry-run    : Preview changes without applying them
 *   --verbose    : Show detailed output for each change
 *   --batch-size : Number of documents to process per batch (default: 100)
 * 
 * Examples:
 *   # Preview what would be changed
 *   npm run normalize-carnet:dry-run
 *   
 *   # Run with verbose output
 *   npx ts-node --project scripts/tsconfig.json scripts/normalize-carnet-field.ts --verbose
 *   
 *   # Run with custom batch size
 *   npx ts-node --project scripts/tsconfig.json scripts/normalize-carnet-field.ts --batch-size 50
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

interface ScriptOptions {
  dryRun?: boolean
  batchSize?: number
  verbose?: boolean
}

interface CarnetNormalizationResult {
  id: string
  name: string
  oldValue: any
  newValue: number | null
  changed: boolean
}

class CarnetFieldNormalizer {
  private db: FirebaseFirestore.Firestore
  private options: ScriptOptions

  constructor(options: ScriptOptions = {}) {
    this.options = {
      dryRun: false,
      batchSize: 100,
      verbose: false,
      ...options
    }

    // Initialize Firebase Admin if not already initialized
    if (getApps().length === 0) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required')
      }

      let serviceAccount: any
      try {
        serviceAccount = JSON.parse(serviceAccountKey)
      } catch (error) {
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY: must be valid JSON')
      }

      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      })
    }

    this.db = getFirestore()
  }

  /**
   * Normalize a carnet value to a number
   */
  private normalizeCarnetValue(value: any): { normalized: number | null; changed: boolean } {
    // If already a number, no change needed
    if (typeof value === 'number') {
      return { normalized: value, changed: false }
    }

    // If null or undefined, keep as null (will be treated as 0 by the app)
    if (value === null || value === undefined) {
      return { normalized: null, changed: false }
    }

    // If string, try to convert to number
    if (typeof value === 'string') {
      // Handle empty string
      if (value.trim() === '') {
        return { normalized: null, changed: true }
      }

      const numValue = Number(value)
      if (!isNaN(numValue)) {
        return { normalized: numValue, changed: true }
      }
    }

    // Invalid value, log warning and set to null
    console.warn(`⚠️  Invalid carnet value: ${JSON.stringify(value)} (type: ${typeof value})`)
    return { normalized: null, changed: true }
  }

  /**
   * Scan all countries and identify those needing carnet field normalization
   */
  async scanCountries(): Promise<CarnetNormalizationResult[]> {
    console.log('🔍 Scanning country collection for carnet field normalization...')
    
    const countriesRef = this.db.collection('country')
    const snapshot = await countriesRef.get()
    
    const results: CarnetNormalizationResult[] = []
    let totalScanned = 0
    let withCarnetField = 0
    
    snapshot.forEach(doc => {
      totalScanned++
      const data = doc.data()
      const countryName = data.name || doc.id
      
      // Check if carnet field exists
      if (data.carnet !== undefined) {
        withCarnetField++
        const { normalized, changed } = this.normalizeCarnetValue(data.carnet)
        
        results.push({
          id: doc.id,
          name: countryName,
          oldValue: data.carnet,
          newValue: normalized,
          changed
        })
        
        if (this.options.verbose && changed) {
          console.log(`  📄 ${doc.id} (${countryName}): ${JSON.stringify(data.carnet)} → ${normalized}`)
        }
      }
    })
    
    const needsUpdate = results.filter(r => r.changed).length
    
    console.log(`📊 Scan Results:`)
    console.log(`  Total countries: ${totalScanned}`)
    console.log(`  With carnet field: ${withCarnetField}`)
    console.log(`  Need normalization: ${needsUpdate}`)
    
    return results
  }

  /**
   * Update carnet fields in a batch of countries
   */
  async updateBatch(countries: CarnetNormalizationResult[]): Promise<void> {
    if (countries.length === 0) return

    const batch = this.db.batch()
    let updatesInBatch = 0
    
    countries.forEach(country => {
      if (!country.changed) return
      
      const docRef = this.db.collection('country').doc(country.id)
      
      // Update the carnet field with the normalized value
      if (country.newValue === null) {
        // Remove the field if normalized to null
        batch.update(docRef, {
          'carnet': FieldValue.delete()
        })
      } else {
        batch.update(docRef, {
          'carnet': country.newValue
        })
      }
      
      updatesInBatch++
      
      if (this.options.verbose) {
        console.log(`  🔄 Queued update for: ${country.id} (${country.name}): ${JSON.stringify(country.oldValue)} → ${country.newValue}`)
      }
    })

    if (updatesInBatch === 0) {
      console.log(`✅ No updates needed in this batch`)
      return
    }

    if (!this.options.dryRun) {
      await batch.commit()
      console.log(`✅ Updated carnet field for ${updatesInBatch} countries`)
    } else {
      console.log(`🔍 DRY RUN: Would update carnet field for ${updatesInBatch} countries`)
    }
  }

  /**
   * Normalize all carnet fields
   */
  async normalizeAllCarnetFields(): Promise<void> {
    console.log('🚀 Starting carnet field normalization...')
    console.log(`📊 Options:`, this.options)
    
    try {
      // Scan all countries
      const results = await this.scanCountries()
      
      const needsUpdate = results.filter(r => r.changed)
      
      if (needsUpdate.length === 0) {
        console.log('✅ No countries need carnet field normalization. All values are already correct!')
        return
      }

      console.log(`\n📋 Countries requiring updates:`)
      needsUpdate.forEach(country => {
        console.log(`  - ${country.id} (${country.name}): ${JSON.stringify(country.oldValue)} → ${country.newValue}`)
      })

      // Process in batches
      const batchSize = this.options.batchSize!
      let processed = 0
      
      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize)
        
        console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(results.length / batchSize)} (${batch.length} countries)`)
        
        await this.updateBatch(batch)
        processed += batch.filter(c => c.changed).length
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < results.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      console.log(`\n🎉 Successfully processed ${processed} countries`)
      
      if (this.options.dryRun) {
        console.log('🔍 This was a DRY RUN - no changes were made to Firestore')
        console.log('💡 Run without --dry-run to actually normalize the carnet fields')
      } else {
        console.log('✅ All carnet fields have been normalized in Firestore')
      }

    } catch (error) {
      console.error('❌ Error normalizing carnet fields:', error)
      throw error
    }
  }

  /**
   * Verify normalization by checking for any remaining string values
   */
  async verifyNormalization(): Promise<void> {
    console.log('🔍 Verifying carnet field normalization...')
    
    const results = await this.scanCountries()
    const stillNeedUpdate = results.filter(r => r.changed)
    
    if (stillNeedUpdate.length === 0) {
      console.log('✅ Verification successful: All carnet fields are properly normalized')
    } else {
      console.warn(`⚠️  Verification failed: ${stillNeedUpdate.length} countries still have non-normalized carnet values`)
      stillNeedUpdate.forEach(country => {
        console.log(`  - ${country.id} (${country.name}): ${JSON.stringify(country.oldValue)}`)
      })
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {}

  args.forEach((arg, index) => {
    switch (arg) {
      case '--dry-run':
        options.dryRun = true
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--batch-size':
        const nextArg = args[index + 1]
        if (nextArg && !isNaN(Number(nextArg))) {
          options.batchSize = Number(nextArg)
        }
        break
    }
  })

  return options
}

/**
 * Main execution
 */
async function main() {
  console.log('🔢 Firestore Carnet Field Normalizer')
  console.log('===================================')
  
  try {
    const options = parseArgs()
    const normalizer = new CarnetFieldNormalizer(options)
    
    // Normalize carnet fields
    await normalizer.normalizeAllCarnetFields()
    
    // Verify normalization (only if not dry run)
    if (!options.dryRun) {
      console.log('')
      await normalizer.verifyNormalization()
    }
    
    console.log('')
    console.log('🎉 Script completed successfully!')
    
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }
}

// Run the script if called directly
if (require.main === module) {
  main()
}

export { CarnetFieldNormalizer }