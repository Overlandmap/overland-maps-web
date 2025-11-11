#!/usr/bin/env node

const { FirestoreDataFetcher } = require('../src/lib/firestore-data-fetcher');
const { DataProcessor } = require('../src/lib/data-processor');
const { config } = require('dotenv');

config();

async function diagnose() {
  const fetcher = new FirestoreDataFetcher();
  const processor = new DataProcessor();
  
  console.log('=== DIAGNOSTIC REPORT ===\n');
  
  try {
    // Fetch data
    const countries = await fetcher.fetchCountriesWithBorders();
    const borders = await fetcher.fetchBorders();
    const borderPosts = await fetcher.fetchBorderPosts();
    
    // Process data
    const processedCountries = processor.processCountryData(countries);
    const processedBorders = processor.processBorderData(borders);
    const processedBorderPosts = processor.processBorderPostData(borderPosts);
    
    console.log('\n=== ISSUE 1: Countries Missing iso_a3 ===');
    const missingIso3 = processedCountries.filter(c => !c.iso_a3);
    console.log(`Found ${missingIso3.length} countries without iso_a3:`);
    missingIso3.forEach(c => {
      console.log(`  - ID: ${c.id}, Name: ${c.name}`);
      console.log(`    Raw parameters:`, JSON.stringify(c.parameters, null, 2));
    });
    
    console.log('\n=== ISSUE 2: Border Posts with Invalid is_open ===');
    const invalidBorderPosts = processedBorderPosts.filter(bp => 
      bp.is_open !== undefined && (bp.is_open < -1 || bp.is_open > 3)
    );
    console.log(`Found ${invalidBorderPosts.length} border posts with invalid is_open:`);
    invalidBorderPosts.forEach(bp => {
      console.log(`  - ID: ${bp.id}, is_open: ${bp.is_open}`);
    });
    
    console.log('\n=== ISSUE 3: Border-Country Relationships ===');
    const countriesWithBorderIds = processedCountries.filter(c => c.borderIds.length > 0);
    console.log(`Countries with border relationships: ${countriesWithBorderIds.length}/${processedCountries.length}`);
    
    if (countriesWithBorderIds.length === 0) {
      console.log('\n⚠️ NO COUNTRIES HAVE BORDER RELATIONSHIPS!');
      console.log('This means the borders subcollections are empty or not being fetched correctly.');
      
      // Sample a few countries to check their borders subcollection
      console.log('\n=== Sampling Country Border Subcollections ===');
      for (let i = 0; i < Math.min(5, processedCountries.length); i++) {
        const country = processedCountries[i];
        const borderIds = await fetcher.fetchCountryBorders(country.id);
        console.log(`  - ${country.name} (${country.id}): ${borderIds.length} borders`);
        if (borderIds.length > 0) {
          console.log(`    Border IDs: ${borderIds.join(', ')}`);
        }
      }
    } else {
      console.log('\nSample countries with borders:');
      countriesWithBorderIds.slice(0, 5).forEach(c => {
        console.log(`  - ${c.name} (${c.id}): ${c.borderIds.length} borders`);
        console.log(`    Border IDs: ${c.borderIds.join(', ')}`);
      });
    }
    
    console.log('\n=== Border Reference Analysis ===');
    const allBorderIds = new Set(processedBorders.map(b => b.id));
    const referencedBorderIds = new Set(processedCountries.flatMap(c => c.borderIds));
    const unreferencedBorders = processedBorders.filter(b => !referencedBorderIds.has(b.id));
    
    console.log(`Total borders: ${processedBorders.length}`);
    console.log(`Referenced by countries: ${referencedBorderIds.size}`);
    console.log(`Unreferenced: ${unreferencedBorders.length}`);
    
    if (unreferencedBorders.length > 0 && unreferencedBorders.length < 20) {
      console.log('\nUnreferenced border IDs:');
      unreferencedBorders.forEach(b => {
        console.log(`  - ${b.id}`);
      });
    }
    
    await fetcher.cleanup();
    process.exit(0);
  } catch (error) {
    console.error('Error during diagnosis:', error);
    await fetcher.cleanup();
    process.exit(1);
  }
}

diagnose();
