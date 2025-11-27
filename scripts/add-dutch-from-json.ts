/**
 * Add Dutch Translations from countries.json
 * 
 * This script reads the public/data/countries.json file and adds any
 * Dutch translations found there to Firestore.
 * 
 * Usage:
 *   npx ts-node scripts/add-dutch-from-json.ts [--dry-run]
 */

import * as admin from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Check for dry-run mode
const isDryRun = process.argv.includes('--dry-run')

// Initialize Firebase Admin
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT_KEY not found')
  process.exit(1)
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

const db = admin.firestore()

/**
 * Main function to add Dutch translations from JSON
 */
async function addDutchFromJson() {
  console.log('🌍 Adding Dutch translations from countries.json...')
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made')
  }
  
  console.log('=' .repeat(60))
  
  try {
    // Load countries.json
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'countries.json')
    
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ File not found: ${jsonPath}`)
      process.exit(1)
    }
    
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    const countries = jsonData.countries || []
    
    console.log(`\n📊 Found ${countries.length} countries in JSON\n`)
    
    let processed = 0
    let updated = 0
    let skipped = 0
    let notFound = 0
    
    // Process each country
    for (const country of countries) {
      processed++
      const countryId = country.id
      const translations = country.parameters?.translations || country.translations
      const capitalTranslations = country.parameters?.capital_translations || country.capital_translations
      
      console.log(`[${processed}/${countries.length}] ${countryId}: ${translations?.en || country.name}`)
      
      // Check if JSON has Dutch translations
      const hasDutchCountry = translations?.nl
      const hasDutchCapital = capitalTranslations?.nl
      
      if (!hasDutchCountry && !hasDutchCapital) {
        console.log(`   ⏭️  No Dutch translations in JSON`)
        skipped++
        continue
      }
      
      // Get Firestore document
      const docRef = db.collection('country').doc(countryId)
      const docSnap = await docRef.get()
      
      if (!docSnap.exists) {
        console.log(`   ⚠️  Document not found in Firestore`)
        notFound++
        continue
      }
      
      const docData = docSnap.data()!
      const updates: any = {}
      
      // Add country name translation if available and not already present
      if (hasDutchCountry) {
        const existingTranslations = docData.parameters?.translations || docData.translations
        
        if (!existingTranslations?.nl) {
          if (docData.parameters?.translations) {
            updates['parameters.translations.nl'] = translations.nl
          } else {
            updates['translations.nl'] = translations.nl
          }
          console.log(`   ✅ Country: ${translations.nl}`)
        } else {
          console.log(`   ⏭️  Country already has Dutch translation`)
        }
      }
      
      // Add capital translation if available and not already present
      if (hasDutchCapital) {
        const existingCapitalTranslations = docData.parameters?.capital_translations || docData.capital_translations
        
        if (!existingCapitalTranslations?.nl) {
          if (docData.parameters?.capital_translations) {
            updates['parameters.capital_translations.nl'] = capitalTranslations.nl
          } else {
            updates['capital_translations.nl'] = capitalTranslations.nl
          }
          console.log(`   ✅ Capital: ${capitalTranslations.nl}`)
        } else {
          console.log(`   ⏭️  Capital already has Dutch translation`)
        }
      }
      
      // Apply updates
      if (Object.keys(updates).length > 0) {
        if (!isDryRun) {
          await docRef.update(updates)
          console.log(`   💾 Updated`)
        } else {
          console.log(`   🔍 [DRY RUN] Would update`)
        }
        updated++
      } else {
        skipped++
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ Translation process complete!')
    console.log('=' .repeat(60))
    console.log(`\nSummary:`)
    console.log(`  Processed:  ${processed}`)
    console.log(`  Updated:    ${updated}`)
    console.log(`  Skipped:    ${skipped}`)
    console.log(`  Not found:  ${notFound}`)
    
    if (isDryRun) {
      console.log(`\n💡 Run without --dry-run to apply changes`)
    }
    
  } catch (error) {
    console.error('\n❌ Process failed:', error)
    process.exit(1)
  }
}

// Run the script
addDutchFromJson()
  .then(() => {
    console.log('\n✅ Process completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Process failed:', error)
    process.exit(1)
  })
