/**
 * Add Dutch Translations to Firestore Countries
 * 
 * This script adds Dutch (nl) translations for country names and capitals
 * to all documents in the 'country' collection in Firestore.
 * 
 * Usage:
 *   npx ts-node scripts/add-dutch-translations.ts [--dry-run]
 * 
 * Options:
 *   --dry-run    Show what would be updated without making changes
 */

import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'
import * as https from 'https'

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
 * Translate text using LibreTranslate API (free, open-source)
 */
async function translateText(text: string, targetLang: string = 'nl'): Promise<string> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q: text,
      source: 'en',
      target: targetLang,
      format: 'text'
    })

    const options = {
      hostname: 'libretranslate.com',
      port: 443,
      path: '/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      
      res.on('data', (chunk) => {
        body += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body)
          if (response.translatedText) {
            resolve(response.translatedText)
          } else {
            reject(new Error('No translation returned'))
          }
        } catch (error) {
          reject(error)
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(data)
    req.end()
  })
}

/**
 * Add delay to avoid rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Update a country document with Dutch translations
 */
async function updateCountryTranslations(docId: string, docData: any): Promise<boolean> {
  try {
    const updates: any = {}
    let hasUpdates = false

    // Check if translations exist
    const translations = docData.parameters?.translations || docData.translations
    const capitalTranslations = docData.parameters?.capital_translations || docData.capital_translations

    // Add Dutch country name translation if missing
    if (translations && !translations.nl) {
      const englishName = translations.en || docData.name || docData.parameters?.name
      
      if (englishName) {
        console.log(`   Translating country: ${englishName}`)
        
        try {
          const dutchName = await translateText(englishName, 'nl')
          
          if (docData.parameters?.translations) {
            updates['parameters.translations.nl'] = dutchName
          } else {
            updates['translations.nl'] = dutchName
          }
          
          console.log(`   ✅ ${englishName} → ${dutchName}`)
          hasUpdates = true
          
          // Rate limiting delay
          await delay(1000)
        } catch (error) {
          console.log(`   ⚠️  Failed to translate: ${englishName}`)
        }
      }
    }

    // Add Dutch capital translation if missing
    if (capitalTranslations && !capitalTranslations.nl) {
      const englishCapital = capitalTranslations.en || docData.parameters?.capital
      
      if (englishCapital) {
        console.log(`   Translating capital: ${englishCapital}`)
        
        try {
          const dutchCapital = await translateText(englishCapital, 'nl')
          
          if (docData.parameters?.capital_translations) {
            updates['parameters.capital_translations.nl'] = dutchCapital
          } else {
            updates['capital_translations.nl'] = dutchCapital
          }
          
          console.log(`   ✅ ${englishCapital} → ${dutchCapital}`)
          hasUpdates = true
          
          // Rate limiting delay
          await delay(1000)
        } catch (error) {
          console.log(`   ⚠️  Failed to translate: ${englishCapital}`)
        }
      }
    }

    // Apply updates if not in dry-run mode
    if (hasUpdates && !isDryRun) {
      await db.collection('country').doc(docId).update(updates)
      console.log(`   💾 Updated document: ${docId}`)
    } else if (hasUpdates && isDryRun) {
      console.log(`   🔍 [DRY RUN] Would update: ${docId}`)
    }

    return hasUpdates
  } catch (error) {
    console.error(`   ❌ Error updating ${docId}:`, error)
    return false
  }
}

/**
 * Main function to add Dutch translations to all countries
 */
async function addDutchTranslations() {
  console.log('🌍 Adding Dutch translations to Firestore countries...')
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made')
  }
  
  console.log('=' .repeat(60))
  
  try {
    // Fetch all country documents
    const snapshot = await db.collection('country').get()
    console.log(`\n📊 Found ${snapshot.size} countries\n`)
    
    let processed = 0
    let updated = 0
    let skipped = 0
    
    // Process each country
    for (const doc of snapshot.docs) {
      processed++
      console.log(`\n[${processed}/${snapshot.size}] Processing: ${doc.id}`)
      
      const docData = doc.data()
      
      // Check if already has Dutch translations
      const translations = docData.parameters?.translations || docData.translations
      const capitalTranslations = docData.parameters?.capital_translations || docData.capital_translations
      
      const hasCountryNl = translations?.nl
      const hasCapitalNl = capitalTranslations?.nl
      
      if (hasCountryNl && hasCapitalNl) {
        console.log(`   ⏭️  Already has Dutch translations`)
        skipped++
        continue
      }
      
      const wasUpdated = await updateCountryTranslations(doc.id, docData)
      
      if (wasUpdated) {
        updated++
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ Translation process complete!')
    console.log('=' .repeat(60))
    console.log(`\nSummary:`)
    console.log(`  Processed: ${processed}`)
    console.log(`  Updated:   ${updated}`)
    console.log(`  Skipped:   ${skipped}`)
    
    if (isDryRun) {
      console.log(`\n💡 Run without --dry-run to apply changes`)
    }
    
  } catch (error) {
    console.error('\n❌ Process failed:', error)
    process.exit(1)
  }
}

// Run the script
addDutchTranslations()
  .then(() => {
    console.log('\n✅ Process completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Process failed:', error)
    process.exit(1)
  })
