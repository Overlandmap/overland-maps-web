#!/usr/bin/env ts-node

/**
 * Script to test if translations are properly stored in Firestore
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function testTranslations() {
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

  const db = getFirestore()
  
  console.log('🔍 Testing translations in Firestore...')
  
  // Test a few specific countries
  const testCountries = ['USA', 'DEU', 'FRA', 'JPN', 'CHN']
  
  for (const countryId of testCountries) {
    try {
      const doc = await db.collection('country').doc(countryId).get()
      if (doc.exists) {
        const data = doc.data()
        console.log(`\n📄 ${countryId} (${data?.name}):`)
        console.log('  Translations:', data?.translations || 'MISSING')
        console.log('  Capital Translations:', data?.capital_translations || 'MISSING')
      } else {
        console.log(`\n❌ ${countryId}: Document not found`)
      }
    } catch (error) {
      console.error(`❌ Error fetching ${countryId}:`, error)
    }
  }
}

testTranslations().catch(console.error)