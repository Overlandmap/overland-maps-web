/**
 * Backup Firestore Collections
 * 
 * This script backs up the 'country', 'border', and 'border_post' collections
 * from Firestore to JSON files that can be used to restore the data in a
 * different Firebase account.
 * 
 * Usage:
 *   npx ts-node scripts/backup-firestore.ts
 * 
 * Output:
 *   backups/countries-backup-[timestamp].json
 *   backups/borders-backup-[timestamp].json
 *   backups/border-posts-backup-[timestamp].json
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

interface BackupResult {
  collection: string
  count: number
  timestamp: string
  file: string
}

/**
 * Backup a Firestore collection to a JSON file
 */
async function backupCollection(collectionName: string): Promise<BackupResult> {
  console.log(`\n📦 Backing up collection: ${collectionName}`)
  
  try {
    // Fetch all documents from the collection
    const snapshot = await db.collection(collectionName).get()
    
    console.log(`   Found ${snapshot.size} documents`)
    
    // Convert documents to backup format
    const documents: BackupDocument[] = []
    
    snapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        data: doc.data()
      })
    })
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
      console.log(`   Created backup directory: ${backupDir}`)
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const filename = `${collectionName}-backup-${timestamp}.json`
    const filepath = path.join(backupDir, filename)
    
    // Write backup to file
    const backup = {
      collection: collectionName,
      timestamp: new Date().toISOString(),
      count: documents.length,
      documents: documents
    }
    
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))
    
    console.log(`   ✅ Backup saved to: ${filepath}`)
    console.log(`   📊 Size: ${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB`)
    
    return {
      collection: collectionName,
      count: documents.length,
      timestamp: backup.timestamp,
      file: filepath
    }
    
  } catch (error) {
    console.error(`   ❌ Error backing up ${collectionName}:`, error)
    throw error
  }
}

/**
 * Main backup function
 */
async function backupAllCollections() {
  console.log('🔄 Starting Firestore backup...')
  console.log('=' .repeat(60))
  
  const collections = ['country', 'border', 'border_post']
  const results: BackupResult[] = []
  
  try {
    // Backup each collection
    for (const collection of collections) {
      const result = await backupCollection(collection)
      results.push(result)
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ Backup Complete!')
    console.log('=' .repeat(60))
    console.log('\nSummary:')
    
    let totalDocs = 0
    results.forEach(result => {
      console.log(`  ${result.collection.padEnd(15)} ${result.count.toString().padStart(5)} documents`)
      totalDocs += result.count
    })
    
    console.log(`  ${'TOTAL'.padEnd(15)} ${totalDocs.toString().padStart(5)} documents`)
    
    console.log('\nBackup files:')
    results.forEach(result => {
      console.log(`  - ${result.file}`)
    })
    
    console.log('\n💡 To restore these backups in a different account:')
    console.log('   npx ts-node scripts/restore-firestore.ts')
    
  } catch (error) {
    console.error('\n❌ Backup failed:', error)
    process.exit(1)
  }
}

// Run the backup
backupAllCollections()
  .then(() => {
    console.log('\n✅ Backup process completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Backup process failed:', error)
    process.exit(1)
  })
