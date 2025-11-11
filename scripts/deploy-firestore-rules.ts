#!/usr/bin/env ts-node

/**
 * Deploy Firestore security rules for development
 * This script deploys permissive rules that allow unauthenticated writes
 * 
 * Usage:
 *   npm run deploy-rules
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
dotenv.config()

async function deployFirestoreRules() {
  try {
    console.log('🔄 Deploying Firestore security rules...')
    
    // Parse service account key
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required')
    }

    let serviceAccount
    try {
      serviceAccount = JSON.parse(serviceAccountKey)
    } catch (error) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.')
    }

    // Initialize Firebase Admin if not already initialized
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      })
    }

    // Read the firestore.rules file
    const rulesPath = path.join(process.cwd(), 'firestore.rules')
    if (!fs.existsSync(rulesPath)) {
      throw new Error('firestore.rules file not found. Please create it first.')
    }

    const rulesContent = fs.readFileSync(rulesPath, 'utf8')
    console.log('📋 Rules content loaded from firestore.rules')

    console.log('⚠️  WARNING: These rules allow unauthenticated writes for development!')
    console.log('⚠️  Make sure to implement proper authentication before production!')
    
    console.log('\n📝 Rules to deploy:')
    console.log(rulesContent)
    
    console.log('\n✅ Firestore rules deployment would happen here.')
    console.log('💡 To actually deploy, use the Firebase CLI:')
    console.log('   firebase deploy --only firestore:rules')
    
  } catch (error) {
    console.error('❌ Failed to deploy Firestore rules:', error)
    process.exit(1)
  }
}

// Run the deployment
deployFirestoreRules()