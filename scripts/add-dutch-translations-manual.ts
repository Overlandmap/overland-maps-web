/**
 * Add Dutch Translations to Firestore Countries (Manual Mapping)
 * 
 * This script adds Dutch (nl) translations using a manual mapping file.
 * This is more reliable than automated translation and respects official names.
 * 
 * Usage:
 *   1. First, generate the mapping file:
 *      npx ts-node scripts/add-dutch-translations-manual.ts --generate
 * 
 *   2. Edit the generated dutch-translations.json file with correct translations
 * 
 *   3. Apply the translations:
 *      npx ts-node scripts/add-dutch-translations-manual.ts --apply
 * 
 *   4. Or do a dry run first:
 *      npx ts-node scripts/add-dutch-translations-manual.ts --apply --dry-run
 */

import * as admin from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Parse command line arguments
const args = process.argv.slice(2)
const isGenerate = args.includes('--generate')
const isApply = args.includes('--apply')
const isDryRun = args.includes('--dry-run')

if (!isGenerate && !isApply) {
  console.error('❌ Error: Must specify either --generate or --apply')
  console.error('   Usage: npx ts-node scripts/add-dutch-translations-manual.ts [--generate|--apply] [--dry-run]')
  process.exit(1)
}

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

interface TranslationEntry {
  id: string
  englishName: string
  dutchName: string
  englishCapital?: string
  dutchCapital?: string
}

/**
 * Generate a translation mapping file from Firestore
 */
async function generateTranslationFile() {
  console.log('📝 Generating Dutch translation mapping file...')
  console.log('=' .repeat(60))
  
  try {
    const snapshot = await db.collection('country').get()
    console.log(`\n📊 Found ${snapshot.size} countries\n`)
    
    const translations: TranslationEntry[] = []
    
    snapshot.forEach(doc => {
      const data = doc.data()
      const trans = data.parameters?.translations || data.translations
      const capTrans = data.parameters?.capital_translations || data.capital_translations
      
      const entry: TranslationEntry = {
        id: doc.id,
        englishName: trans?.en || data.name || data.parameters?.name || '',
        dutchName: trans?.nl || '', // Will be filled manually
        englishCapital: capTrans?.en || data.parameters?.capital || '',
        dutchCapital: capTrans?.nl || '' // Will be filled manually
      }
      
      translations.push(entry)
    })
    
    // Sort by English name
    translations.sort((a, b) => a.englishName.localeCompare(b.englishName))
    
    // Save to file
    const outputPath = path.join(process.cwd(), 'scripts', 'dutch-translations.json')
    fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2))
    
    console.log(`✅ Generated translation file: ${outputPath}`)
    console.log(`\n📝 Next steps:`)
    console.log(`   1. Edit ${outputPath}`)
    console.log(`   2. Fill in the 'dutchName' and 'dutchCapital' fields`)
    console.log(`   3. Run: npx ts-node scripts/add-dutch-translations-manual.ts --apply`)
    
  } catch (error) {
    console.error('❌ Error generating file:', error)
    process.exit(1)
  }
}

/**
 * Apply translations from the mapping file to Firestore
 */
async function applyTranslations() {
  console.log('🌍 Applying Dutch translations to Firestore...')
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made')
  }
  
  console.log('=' .repeat(60))
  
  try {
    // Load translation file
    const translationPath = path.join(process.cwd(), 'scripts', 'dutch-translations.json')
    
    if (!fs.existsSync(translationPath)) {
      console.error(`❌ Translation file not found: ${translationPath}`)
      console.error(`   Run with --generate first to create the file`)
      process.exit(1)
    }
    
    const translations: TranslationEntry[] = JSON.parse(fs.readFileSync(translationPath, 'utf-8'))
    console.log(`\n📊 Loaded ${translations.length} translations\n`)
    
    let processed = 0
    let updated = 0
    let skipped = 0
    
    // Apply each translation
    for (const entry of translations) {
      processed++
      console.log(`[${processed}/${translations.length}] ${entry.englishName}`)
      
      // Skip if no Dutch translation provided
      if (!entry.dutchName && !entry.dutchCapital) {
        console.log(`   ⏭️  No Dutch translation provided`)
        skipped++
        continue
      }
      
      const updates: any = {}
      
      // Get current document to check structure
      const docRef = db.collection('country').doc(entry.id)
      const docSnap = await docRef.get()
      
      if (!docSnap.exists) {
        console.log(`   ⚠️  Document not found: ${entry.id}`)
        skipped++
        continue
      }
      
      const docData = docSnap.data()!
      
      // Add country name translation
      if (entry.dutchName) {
        if (docData.parameters?.translations) {
          updates['parameters.translations.nl'] = entry.dutchName
        } else if (docData.translations) {
          updates['translations.nl'] = entry.dutchName
        }
        console.log(`   ✅ Country: ${entry.dutchName}`)
      }
      
      // Add capital translation
      if (entry.dutchCapital) {
        if (docData.parameters?.capital_translations) {
          updates['parameters.capital_translations.nl'] = entry.dutchCapital
        } else if (docData.capital_translations) {
          updates['capital_translations.nl'] = entry.dutchCapital
        }
        console.log(`   ✅ Capital: ${entry.dutchCapital}`)
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

// Run the appropriate function
if (isGenerate) {
  generateTranslationFile()
    .then(() => {
      console.log('\n✅ Generation completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n❌ Generation failed:', error)
      process.exit(1)
    })
} else if (isApply) {
  applyTranslations()
    .then(() => {
      console.log('\n✅ Application completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n❌ Application failed:', error)
      process.exit(1)
    })
}
