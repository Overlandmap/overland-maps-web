#!/usr/bin/env ts-node

/**
 * Script to copy 'translations' and 'capital_translations' fields from 'countries' collection to 'country' collection
 * 
 * Usage:
 *   npm run copy-translations
 *   or
 *   npx ts-node --project scripts/tsconfig.json scripts/copy-translations-between-collections.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

interface ScriptOptions {
  dryRun?: boolean
  batchSize?: number
  verbose?: boolean
}

interface CountryRecord {
  id: string
  data: any
}

class TranslationsCopier {
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

      let serviceAccount
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
   * Load all documents from a collection
   */
  async loadCollection(collectionName: string): Promise<Map<string, any>> {
    console.log(`🔍 Loading ${collectionName} collection...`)
    
    const collectionRef = this.db.collection(collectionName)
    const snapshot = await collectionRef.get()
    
    const records = new Map<string, any>()
    
    snapshot.forEach(doc => {
      records.set(doc.id, doc.data())
    })
    
    console.log(`✅ Loaded ${records.size} documents from ${collectionName} collection`)
    return records
  }

  /**
   * Find matching records and prepare updates
   */
  prepareUpdates(countryRecords: Map<string, any>, countriesRecords: Map<string, any>): Array<{
    id: string
    updates: any
    sourceData: any
  }> {
    console.log('🔍 Matching records and preparing updates...')
    
    const updates: Array<{ id: string; updates: any; sourceData: any }> = []
    
    countryRecords.forEach((countryData, countryId) => {
      const sourceData = countriesRecords.get(countryId)
      
      if (sourceData) {
        const updateFields: any = {}
        
        // Copy translations field if it exists in source
        if (sourceData.translations) {
          updateFields.translations = sourceData.translations
        }
        
        // Copy capital_translations field if it exists in source
        if (sourceData.capital_translations) {
          updateFields.capital_translations = sourceData.capital_translations
        }
        
        // Only add to updates if there are fields to update
        if (Object.keys(updateFields).length > 0) {
          updates.push({
            id: countryId,
            updates: updateFields,
            sourceData: sourceData
          })
          
          if (this.options.verbose) {
            console.log(`  📄 Will update ${countryId} (${countryData.name || 'Unknown'})`)
            if (updateFields.translations) {
              console.log(`    + translations: ${JSON.stringify(updateFields.translations)}`)
            }
            if (updateFields.capital_translations) {
              console.log(`    + capital_translations: ${JSON.stringify(updateFields.capital_translations)}`)
            }
          }
        }
      } else {
        if (this.options.verbose) {
          console.log(`  ⚠️  No matching record found in 'countries' for: ${countryId} (${countryData.name || 'Unknown'})`)
        }
      }
    })
    
    console.log(`✅ Prepared ${updates.length} updates`)
    return updates
  }

  /**
   * Apply updates in batches
   */
  async applyUpdates(updates: Array<{ id: string; updates: any; sourceData: any }>): Promise<void> {
    if (updates.length === 0) {
      console.log('✅ No updates to apply')
      return
    }

    const batchSize = this.options.batchSize!
    let processed = 0
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)
      
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)} (${batch.length} updates)`)
      
      if (!this.options.dryRun) {
        const firestoreBatch = this.db.batch()
        
        batch.forEach(update => {
          const docRef = this.db.collection('country').doc(update.id)
          firestoreBatch.update(docRef, update.updates)
        })
        
        await firestoreBatch.commit()
        console.log(`✅ Applied ${batch.length} updates to country collection`)
      } else {
        console.log(`🔍 DRY RUN: Would apply ${batch.length} updates to country collection`)
        if (this.options.verbose) {
          batch.forEach(update => {
            console.log(`  🔄 ${update.id}: ${Object.keys(update.updates).join(', ')}`)
          })
        }
      }
      
      processed += batch.length
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < updates.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log(`🎉 Successfully processed ${processed} updates`)
  }

  /**
   * Main execution method
   */
  async copyTranslations(): Promise<void> {
    console.log('🚀 Starting translations copy operation...')
    console.log(`📊 Options:`, this.options)
    
    try {
      // Load both collections
      const [countryRecords, countriesRecords] = await Promise.all([
        this.loadCollection('country'),
        this.loadCollection('countries')
      ])
      
      // Prepare updates
      const updates = this.prepareUpdates(countryRecords, countriesRecords)
      
      if (updates.length === 0) {
        console.log('✅ No translations to copy. All records are already up to date!')
        return
      }
      
      // Apply updates
      await this.applyUpdates(updates)
      
      if (this.options.dryRun) {
        console.log('🔍 This was a DRY RUN - no changes were made to Firestore')
        console.log('💡 Run without --dry-run to actually copy the translations')
      } else {
        console.log('✅ All translations have been copied successfully!')
      }

    } catch (error) {
      console.error('❌ Error copying translations:', error)
      throw error
    }
  }

  /**
   * Verify the copy operation
   */
  async verifyTranslations(): Promise<void> {
    console.log('🔍 Verifying translations copy...')
    
    try {
      const [countryRecords, countriesRecords] = await Promise.all([
        this.loadCollection('country'),
        this.loadCollection('countries')
      ])
      
      let translationsMatched = 0
      let capitalTranslationsMatched = 0
      let missingTranslations = 0
      let missingCapitalTranslations = 0
      
      countryRecords.forEach((countryData, countryId) => {
        const sourceData = countriesRecords.get(countryId)
        
        if (sourceData) {
          // Check translations
          if (sourceData.translations) {
            if (countryData.translations && 
                JSON.stringify(countryData.translations) === JSON.stringify(sourceData.translations)) {
              translationsMatched++
            } else {
              missingTranslations++
              if (this.options.verbose) {
                console.log(`  ❌ Missing/mismatched translations for: ${countryId}`)
              }
            }
          }
          
          // Check capital_translations
          if (sourceData.capital_translations) {
            if (countryData.capital_translations && 
                JSON.stringify(countryData.capital_translations) === JSON.stringify(sourceData.capital_translations)) {
              capitalTranslationsMatched++
            } else {
              missingCapitalTranslations++
              if (this.options.verbose) {
                console.log(`  ❌ Missing/mismatched capital_translations for: ${countryId}`)
              }
            }
          }
        }
      })
      
      console.log('📊 Verification Results:')
      console.log(`  ✅ Translations matched: ${translationsMatched}`)
      console.log(`  ✅ Capital translations matched: ${capitalTranslationsMatched}`)
      console.log(`  ❌ Missing translations: ${missingTranslations}`)
      console.log(`  ❌ Missing capital translations: ${missingCapitalTranslations}`)
      
      if (missingTranslations === 0 && missingCapitalTranslations === 0) {
        console.log('✅ Verification successful: All translations copied correctly!')
      } else {
        console.warn('⚠️  Verification found some missing translations')
      }
      
    } catch (error) {
      console.error('❌ Error during verification:', error)
      throw error
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {}

  args.forEach(arg => {
    switch (arg) {
      case '--dry-run':
        options.dryRun = true
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--batch-size':
        const nextArg = args[args.indexOf(arg) + 1]
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
  console.log('🔄 Firestore Translations Copier')
  console.log('================================')
  console.log('Copying translations from "countries" to "country" collection')
  console.log('')
  
  try {
    const options = parseArgs()
    const copier = new TranslationsCopier(options)
    
    // Copy translations
    await copier.copyTranslations()
    
    // Verify copy (only if not dry run)
    if (!options.dryRun) {
      console.log('')
      await copier.verifyTranslations()
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

export { TranslationsCopier }