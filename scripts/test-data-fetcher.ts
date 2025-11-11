#!/usr/bin/env node

/**
 * Test script to verify FirestoreDataFetcher functionality
 * Run with: npx ts-node scripts/test-data-fetcher.ts
 */

require('dotenv').config()

async function testDataFetcher() {
  try {
    console.log('🔄 Testing FirestoreDataFetcher...')
    
    // Import the data fetcher
    const { FirestoreDataFetcher } = require('../src/lib/firestore-data-fetcher')
    
    const fetcher = new FirestoreDataFetcher()
    
    // Test collection validation
    console.log('\n1. Validating collections...')
    const validation = await fetcher.validateCollections()
    
    if (!validation.countries || !validation.borders) {
      console.error('❌ Required collections are missing or empty')
      process.exit(1)
    }
    
    // Test collection statistics
    console.log('\n2. Getting collection statistics...')
    const stats = await fetcher.getCollectionStats()
    
    // Test fetching a sample of countries
    console.log('\n3. Testing country data fetch...')
    const countries = await fetcher.fetchCountries()
    
    if (countries.length > 0) {
      console.log('📄 Sample country data:')
      console.log(JSON.stringify(countries[0], null, 2))
      
      // Test fetching borders for the first country
      console.log('\n4. Testing country borders fetch...')
      const borderIds = await fetcher.fetchCountryBorders(countries[0].id)
      console.log(`🔗 Country ${countries[0].name} has ${borderIds.length} border references`)
    }
    
    // Test fetching a sample of borders
    console.log('\n5. Testing border data fetch...')
    const borders = await fetcher.fetchBorders()
    
    if (borders.length > 0) {
      console.log('📄 Sample border data:')
      const sampleBorder = { ...borders[0] }
      // Truncate geomString for display
      if (sampleBorder.geomString.length > 100) {
        sampleBorder.geomString = sampleBorder.geomString.substring(0, 100) + '...'
      }
      console.log(JSON.stringify(sampleBorder, null, 2))
    }
    
    console.log('\n✅ FirestoreDataFetcher is working correctly!')
    console.log(`📊 Summary: ${stats.countryCount} countries, ${stats.borderCount} borders`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ FirestoreDataFetcher test failed:')
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(errorMessage)
    
    if (errorMessage.includes('authentication')) {
      console.log('\n💡 Make sure Firebase Admin SDK is properly configured')
      console.log('Run: npm run test:firebase')
    }
    
    process.exit(1)
  }
}

testDataFetcher()