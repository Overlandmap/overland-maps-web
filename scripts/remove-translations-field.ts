#!/usr/bin/env ts-node

/**
 * Script to remove the 'translations' field from all country entities in Firestore
 * 
 * Usage:
 *   npm run remove-translations
 *   or
 *   npx ts-node --project scripts/tsconfig.json scripts/remove-translations-field.ts
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

class TranslationsRemover {
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
   * Get all countries that have the translations field
   */
  async getCountriesWithTranslations(): Promise<Array<{ id: string; data: any }>> {
    console.log('🔍 Scanning country collection for translations field...')
    
    const countriesRef = this.db.collection('country')
    const snapshot = await countriesRef.get()
    
    const countriesWithTranslations: Array<{ id: string; data: any }> = []
    
    snapshot.forEach(doc => {
      const data = doc.data()
      
      // Check if translations field exists at root level
      if (data.translations) {
        countriesWithTranslations.push({
          id: doc.id,
          data: data
        })
        
        if (this.options.verbose) {
          console.log(`  📄 Found translations in: ${doc.id} (${data.name})`)
          console.log(`    Translations:`, data.translations)
        }
      }
    })
    
    console.log(`✅ Found ${countriesWithTranslations.length} countries with translations field`)
    return countriesWithTranslations
  }

  /**
   * Remove translations field from a batch of countries
   */
  async removeBatch(countries: Array<{ id: string; data: any }>): Promise<void> {
    if (countries.length === 0) return

    const batch = this.db.batch()
    
    countries.forEach(country => {
      const docRef = this.db.collection('country').doc(country.id)
      
      // Use FieldValue.delete() to remove the field
      batch.update(docRef, {
        'translations': FieldValue.delete()
      })
      
      if (this.options.verbose) {
        console.log(`  🗑️  Queued removal for: ${country.id} (${country.data.name})`)
      }
    })

    if (!this.options.dryRun) {
      await batch.commit()
      console.log(`✅ Removed translations field from ${countries.length} countries`)
    } else {
      console.log(`🔍 DRY RUN: Would remove translations field from ${countries.length} countries`)
    }
  }

  /**
   * Remove translations field from all countries
   */
  async removeAllTranslations(): Promise<void> {
    console.log('🚀 Starting translations field removal...')
    console.log(`📊 Options:`, this.options)
    
    try {
      // Get all countries with translations
      const countriesWithTranslations = await this.getCountriesWithTranslations()
      
      if (countriesWithTranslations.length === 0) {
        console.log('✅ No countries found with translations field. Nothing to do!')
        return
      }

      // Process in batches
      const batchSize = this.options.batchSize!
      let processed = 0
      
      for (let i = 0; i < countriesWithTranslations.length; i += batchSize) {
        const batch = countriesWithTranslations.slice(i, i + batchSize)
        
        console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(countriesWithTranslations.length / batchSize)} (${batch.length} countries)`)
        
        await this.removeBatch(batch)
        processed += batch.length
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < countriesWithTranslations.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      console.log(`🎉 Successfully processed ${processed} countries`)
      
      if (this.options.dryRun) {
        console.log('🔍 This was a DRY RUN - no changes were made to Firestore')
        console.log('💡 Run without --dry-run to actually remove the translations fields')
      } else {
        console.log('✅ All translations fields have been removed from Firestore')
      }

    } catch (error) {
      console.error('❌ Error removing translations fields:', error)
      throw error
    }
  }

  /**
   * Verify removal by checking if any countries still have translations
   */
  async verifyRemoval(): Promise<void> {
    console.log('🔍 Verifying translations field removal...')
    
    const remainingCountries = await this.getCountriesWithTranslations()
    
    if (remainingCountries.length === 0) {
      console.log('✅ Verification successful: No countries have translations field')
    } else {
      console.warn(`⚠️  Verification failed: ${remainingCountries.length} countries still have translations field`)
      remainingCountries.forEach(country => {
        console.log(`  - ${country.id} (${country.data.name})`)
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
  console.log('🗑️  Firestore Translations Field Remover')
  console.log('=====================================')
  
  try {
    const options = parseArgs()
    const remover = new TranslationsRemover(options)
    
    // Remove translations fields
    await remover.removeAllTranslations()
    
    // Verify removal (only if not dry run)
    if (!options.dryRun) {
      console.log('')
      await remover.verifyRemoval()
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

export { TranslationsRemover }