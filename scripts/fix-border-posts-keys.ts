#!/usr/bin/env npx ts-node

/**
 * Script to fix border_posts keys in Firestore by removing leading/trailing spaces
 * 
 * Usage:
 *   npm run fix-border-posts-keys -- --dry-run    # Test run without making changes
 *   npm run fix-border-posts-keys                 # Apply fixes to Firestore
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

interface BorderPostsMap {
  [key: string]: string
}

interface BorderDocument {
  id: string
  border_posts?: BorderPostsMap
  [key: string]: any
}

class BorderPostsKeyFixer {
  private db: FirebaseFirestore.Firestore
  private dryRun: boolean

  constructor(dryRun: boolean = false) {
    this.dryRun = dryRun
    this.initializeFirebase()
    this.db = getFirestore()
  }

  private initializeFirebase() {
    try {
      // Check if Firebase Admin is already initialized
      if (getApps().length > 0) {
        console.log('✅ Firebase Admin SDK already initialized')
        return
      }

      // For build-time usage, we'll use service account key
      // Support both full JSON key and individual environment variables
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      const projectId = process.env.FIREBASE_PROJECT_ID || 'overlandaventure'
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
      const privateKey = process.env.FIREBASE_PRIVATE_KEY

      let serviceAccountKey

      if (serviceAccountJson) {
        // Use full JSON service account key
        try {
          serviceAccountKey = JSON.parse(serviceAccountJson)
        } catch (error) {
          throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.')
        }
      } else if (clientEmail && privateKey) {
        // Use individual environment variables
        serviceAccountKey = {
          type: 'service_account',
          project_id: projectId,
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
        }
      } else {
        throw new Error(
          'Firebase Admin authentication required. Provide either:\n' +
          '1. FIREBASE_SERVICE_ACCOUNT_KEY (full JSON)\n' +
          '2. FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (individual fields)'
        )
      }

      initializeApp({
        credential: cert(serviceAccountKey),
        projectId: serviceAccountKey.project_id || 'overlandaventure'
      })

      console.log('✅ Firebase Admin SDK initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', error)
      process.exit(1)
    }
  }

  /**
   * Check if a border_posts object has keys with leading/trailing spaces
   */
  private hasBorderPostsWithSpaces(borderPosts: BorderPostsMap): boolean {
    return Object.keys(borderPosts).some(key => key !== key.trim())
  }

  /**
   * Clean border_posts keys by trimming whitespace
   */
  private cleanBorderPostsKeys(borderPosts: BorderPostsMap): BorderPostsMap {
    const cleaned: BorderPostsMap = {}
    for (const [key, value] of Object.entries(borderPosts)) {
      const trimmedKey = key.trim()
      cleaned[trimmedKey] = value
    }
    return cleaned
  }

  /**
   * Get all borders from Firestore
   */
  private async fetchAllBorders(): Promise<BorderDocument[]> {
    console.log('🔄 Fetching all borders from Firestore...')
    
    try {
      const bordersCollection = this.db.collection('border')
      const snapshot = await bordersCollection.get()
      
      const borders: BorderDocument[] = []
      snapshot.forEach(doc => {
        borders.push({
          id: doc.id,
          ...doc.data()
        })
      })

      console.log(`✅ Fetched ${borders.length} borders from Firestore`)
      return borders
    } catch (error) {
      console.error('❌ Failed to fetch borders:', error)
      throw error
    }
  }

  /**
   * Update a border document in Firestore
   */
  private async updateBorderDocument(borderId: string, cleanedBorderPosts: BorderPostsMap): Promise<void> {
    if (this.dryRun) {
      console.log(`[DRY RUN] Would update border ${borderId} with cleaned border_posts`)
      return
    }

    try {
      const borderRef = this.db.collection('border').doc(borderId)
      await borderRef.update({
        border_posts: cleanedBorderPosts
      })
      console.log(`✅ Updated border ${borderId}`)
    } catch (error) {
      console.error(`❌ Failed to update border ${borderId}:`, error)
      throw error
    }
  }

  /**
   * Main execution function
   */
  async run(): Promise<void> {
    console.log('🚀 Starting border_posts key cleanup script...')
    console.log(`Mode: ${this.dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be applied)'}`)
    console.log()

    try {
      // Fetch all borders
      const borders = await this.fetchAllBorders()

      // Find borders with border_posts that have spaces in keys
      const bordersToFix: BorderDocument[] = []
      const borderPostsStats = {
        totalBorders: borders.length,
        bordersWithBorderPosts: 0,
        bordersWithSpacedKeys: 0,
        totalSpacedKeys: 0
      }

      console.log('🔍 Analyzing border_posts keys...')
      
      for (const border of borders) {
        if (border.border_posts && typeof border.border_posts === 'object') {
          borderPostsStats.bordersWithBorderPosts++
          
          if (this.hasBorderPostsWithSpaces(border.border_posts)) {
            bordersToFix.push(border)
            borderPostsStats.bordersWithSpacedKeys++
            
            // Count spaced keys
            const spacedKeys = Object.keys(border.border_posts).filter(key => key !== key.trim())
            borderPostsStats.totalSpacedKeys += spacedKeys.length
            
            console.log(`📋 Border ${border.id} has ${spacedKeys.length} keys with spaces:`)
            spacedKeys.forEach(key => {
              console.log(`   - "${key}" -> "${key.trim()}"`)
            })
          }
        }
      }

      // Print statistics
      console.log()
      console.log('📊 Analysis Results:')
      console.log(`   Total borders: ${borderPostsStats.totalBorders}`)
      console.log(`   Borders with border_posts: ${borderPostsStats.bordersWithBorderPosts}`)
      console.log(`   Borders with spaced keys: ${borderPostsStats.bordersWithSpacedKeys}`)
      console.log(`   Total spaced keys to fix: ${borderPostsStats.totalSpacedKeys}`)
      console.log()

      if (bordersToFix.length === 0) {
        console.log('✅ No borders found with spaced border_posts keys. Nothing to fix!')
        return
      }

      if (this.dryRun) {
        console.log('🔍 DRY RUN: The following changes would be made:')
        console.log()
        
        for (const border of bordersToFix) {
          const originalKeys = Object.keys(border.border_posts!)
          const cleanedBorderPosts = this.cleanBorderPostsKeys(border.border_posts!)
          const cleanedKeys = Object.keys(cleanedBorderPosts)
          
          console.log(`Border ${border.id}:`)
          console.log(`   Original keys: [${originalKeys.map(k => `"${k}"`).join(', ')}]`)
          console.log(`   Cleaned keys:  [${cleanedKeys.map(k => `"${k}"`).join(', ')}]`)
          console.log()
        }
        
        console.log('💡 To apply these changes, run the script without --dry-run flag')
        return
      }

      // Apply fixes
      console.log('🔧 Applying fixes to Firestore...')
      let successCount = 0
      let errorCount = 0

      for (const border of bordersToFix) {
        try {
          const cleanedBorderPosts = this.cleanBorderPostsKeys(border.border_posts!)
          await this.updateBorderDocument(border.id, cleanedBorderPosts)
          successCount++
        } catch (error) {
          console.error(`❌ Failed to update border ${border.id}:`, error)
          errorCount++
        }
      }

      console.log()
      console.log('📊 Update Results:')
      console.log(`   Successfully updated: ${successCount} borders`)
      console.log(`   Failed updates: ${errorCount} borders`)
      
      if (successCount > 0) {
        console.log('✅ Border_posts keys cleanup completed successfully!')
        console.log('💡 Remember to regenerate static data files to reflect these changes')
      }

    } catch (error) {
      console.error('❌ Script execution failed:', error)
      process.exit(1)
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

// Run the script
const fixer = new BorderPostsKeyFixer(dryRun)
fixer.run().then(() => {
  console.log('🏁 Script completed')
  process.exit(0)
}).catch((error) => {
  console.error('💥 Script failed:', error)
  process.exit(1)
})