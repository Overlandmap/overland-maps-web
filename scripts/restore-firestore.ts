/**
 * Restore Firestore Collections
 * 
 * This script restores the 'country', 'border', and 'border_post' collections
 * from JSON backup files to a Firestore database.
 * 
 * Usage:
 *   npx ts-node scripts/restore-firestore.ts [backup-directory]
 * 
 * Example:
 *   npx ts-node scripts/restore-firestore.ts backups
 * 
 * The script will look for the most recent backup files in the specified directory.
 */

import * as admin from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Initialize Firebase Admin
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT_KEY not found in environment variables')
  console.error('   Make sure your .env file contains the Firebase service account key')
  process.exit(1)
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

const db = admin.firestore()

interface BackupDocument {
  id: string
  data: any
}

interface BackupFile {
  collection: string
  timestamp: string
  count: number
  documents: BackupDocument[]
}

interface RestoreResult {
  collection: string
  restored: number
  skipped: number
  errors: number
}

/**
 * Find the most recent backup file for a collection
 */
function findLatestBackup(backupDir: string, collectionName: string): string | null {
  if (!fs.existsSync(backupDir)) {
    console.error(`❌ Backup directory not found: ${backupDir}`)
    return null
  }
  
  const files = fs.readdirSync(backupDir)
  const backupFiles = files
    .filter(f => f.startsWith(`${collectionName}-backup-`) && f.endsWith('.json'))
    .sort()
    .reverse()
  
  if (backupFiles.length === 0) {
    console.warn(`⚠️  No backup files found for collection: ${collectionName}`)
    return null
  }
  
  return path.join(backupDir, backupFiles[0])
}

/**
 * Restore a collection from a backup file
 */
async function restoreCollection(
  backupFilePath: string,
  overwrite: boolean = false
): Promise<RestoreResult> {
  console.log(`\n📦 Restoring from: ${path.basename(backupFilePath)}`)
  
  try {
    // Read backup file
    const backupData: BackupFile = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'))
    const { collection, documents } = backupData
    
    console.log(`   Collection: ${collection}`)
    console.log(`   Documents: ${documents.length}`)
    console.log(`   Backup date: ${backupData.timestamp}`)
    
    let restored = 0
    let skipped = 0
    let errors = 0
    
    // Restore documents in batches
    const batchSize = 500
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = db.batch()
      const batchDocs = documents.slice(i, Math.min(i + batchSize, documents.length))
      
      for (const doc of batchDocs) {
        try {
          const docRef = db.collection(collection).doc(doc.id)
          
          if (!overwrite) {
            // Check if document exists
            const existingDoc = await docRef.get()
            if (existingDoc.exists) {
              skipped++
              continue
            }
          }
          
          batch.set(docRef, doc.data, { merge: overwrite })
          restored++
          
        } catch (error) {
          console.error(`   ❌ Error processing document ${doc.id}:`, error)
          errors++
        }
      }
      
      // Commit batch
      await batch.commit()
      
      // Progress indicator
      const progress = Math.min(i + batchSize, documents.length)
      process.stdout.write(`\r   Progress: ${progress}/${documents.length} documents`)
    }
    
    console.log(`\n   ✅ Restored: ${restored} documents`)
    if (skipped > 0) {
      console.log(`   ⏭️  Skipped: ${skipped} documents (already exist)`)
    }
    if (errors > 0) {
      console.log(`   ❌ Errors: ${errors} documents`)
    }
    
    return {
      collection,
      restored,
      skipped,
      errors
    }
    
  } catch (error) {
    console.error(`   ❌ Error restoring collection:`, error)
    throw error
  }
}

/**
 * Main restore function
 */
async function restoreAllCollections() {
  console.log('🔄 Starting Firestore restore...')
  console.log('=' .repeat(60))
  
  // Get backup directory from command line or use default
  const backupDir = process.argv[2] || path.join(process.cwd(), 'backups')
  console.log(`📁 Backup directory: ${backupDir}`)
  
  // Ask for confirmation
  console.log('\n⚠️  WARNING: This will restore data to your Firestore database.')
  console.log('   Existing documents will be skipped by default.')
  console.log('   Use --overwrite flag to overwrite existing documents.')
  
  const overwrite = process.argv.includes('--overwrite')
  if (overwrite) {
    console.log('\n🔴 OVERWRITE MODE: Existing documents will be overwritten!')
  }
  
  console.log('\n')
  
  const collections = ['country', 'border', 'border_post']
  const results: RestoreResult[] = []
  
  try {
    // Restore each collection
    for (const collection of collections) {
      const backupFile = findLatestBackup(backupDir, collection)
      
      if (!backupFile) {
        console.log(`⏭️  Skipping ${collection} (no backup found)`)
        continue
      }
      
      const result = await restoreCollection(backupFile, overwrite)
      results.push(result)
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ Restore Complete!')
    console.log('=' .repeat(60))
    console.log('\nSummary:')
    
    let totalRestored = 0
    let totalSkipped = 0
    let totalErrors = 0
    
    results.forEach(result => {
      console.log(`\n  ${result.collection}:`)
      console.log(`    Restored: ${result.restored}`)
      console.log(`    Skipped:  ${result.skipped}`)
      console.log(`    Errors:   ${result.errors}`)
      
      totalRestored += result.restored
      totalSkipped += result.skipped
      totalErrors += result.errors
    })
    
    console.log(`\n  TOTAL:`)
    console.log(`    Restored: ${totalRestored}`)
    console.log(`    Skipped:  ${totalSkipped}`)
    console.log(`    Errors:   ${totalErrors}`)
    
    if (totalErrors > 0) {
      console.log('\n⚠️  Some documents failed to restore. Check the logs above.')
    }
    
  } catch (error) {
    console.error('\n❌ Restore failed:', error)
    process.exit(1)
  }
}

// Run the restore
restoreAllCollections()
  .then(() => {
    console.log('\n✅ Restore process completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Restore process failed:', error)
    process.exit(1)
  })
