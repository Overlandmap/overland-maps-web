#!/usr/bin/env node

/**
 * Test script to verify Firebase Admin SDK configuration
 * Run with: npx ts-node scripts/test-firebase-connection.ts
 */

require('dotenv').config()

async function testConnection() {
  try {
    // Import the Firebase Admin utilities
    const { testFirestoreConnection } = require('../src/lib/firebase-admin')
    
    console.log('🔄 Testing Firebase Admin SDK connection...')
    console.log('Project ID: overlandaventure')
    
    await testFirestoreConnection()
    
    console.log('✅ Firebase Admin SDK configuration is working correctly!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Firebase Admin SDK configuration failed:')
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(errorMessage)
    
    if (errorMessage.includes('authentication')) {
      console.log('\n💡 Setup instructions:')
      console.log('1. Go to Firebase Console > Project Settings > Service Accounts')
      console.log('2. Generate a new private key')
      console.log('3. Set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable')
      console.log('4. Or set individual FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY variables')
    }
    
    process.exit(1)
  }
}

testConnection()