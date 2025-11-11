#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read countries data
const countriesData = JSON.parse(fs.readFileSync('public/data/countries.json', 'utf8'));

// Create mapping from ISO_A2 to ADM0_A3
const iso2ToAdm0A3 = {};
const adm0A3ToCountryName = {};

countriesData.countries.forEach(country => {
  const iso_a2 = country.parameters?.iso_a2;
  const adm0_a3 = country.parameters?.adm0_a3 || country.id;
  
  if (iso_a2 && adm0_a3) {
    // Store ISO_A2 codes in lowercase for case-insensitive matching
    iso2ToAdm0A3[iso_a2.toLowerCase()] = adm0_a3;
    adm0A3ToCountryName[adm0_a3] = country.name;
  }
});

console.log(`📊 Created mapping for ${Object.keys(iso2ToAdm0A3).length} countries`);

// Source and destination directories
const sourceDir = '/Users/laurent/dev/flags/svg';
const destDir = 'public/flags';

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Get list of source files
const sourceFiles = fs.readdirSync(sourceDir).filter(file => file.endsWith('.svg'));
console.log(`📁 Found ${sourceFiles.length} SVG files in source directory`);

let copiedCount = 0;
let skippedCount = 0;
const copiedFiles = [];
const skippedFiles = [];

// Process each file
sourceFiles.forEach(filename => {
  const iso_a2 = path.basename(filename, '.svg').toLowerCase(); // Convert to lowercase for case-insensitive matching
  
  if (iso2ToAdm0A3[iso_a2]) {
    const adm0_a3 = iso2ToAdm0A3[iso_a2];
    const sourcePath = path.join(sourceDir, filename);
    const destPath = path.join(destDir, `${adm0_a3}.svg`);
    
    try {
      fs.copyFileSync(sourcePath, destPath);
      copiedCount++;
      copiedFiles.push({
        iso_a2,
        adm0_a3,
        country: adm0A3ToCountryName[adm0_a3],
        filename: `${adm0_a3}.svg`
      });
      console.log(`✅ ${iso_a2} → ${adm0_a3}.svg (${adm0A3ToCountryName[adm0_a3]})`);
    } catch (error) {
      console.error(`❌ Failed to copy ${filename}:`, error.message);
      skippedCount++;
      skippedFiles.push({ filename, reason: error.message });
    }
  } else {
    skippedCount++;
    skippedFiles.push({ filename, reason: 'No mapping found' });
    console.warn(`⚠️  Skipped ${filename} - no mapping found`);
  }
});

// Summary
console.log('\n📋 Summary:');
console.log(`✅ Copied: ${copiedCount} files`);
console.log(`⚠️  Skipped: ${skippedCount} files`);

if (skippedFiles.length > 0) {
  console.log('\n⚠️  Skipped files:');
  skippedFiles.forEach(({ filename, reason }) => {
    console.log(`   - ${filename}: ${reason}`);
  });
}

// Write mapping file for reference
const mappingData = {
  metadata: {
    generatedAt: new Date().toISOString(),
    totalFiles: sourceFiles.length,
    copiedFiles: copiedCount,
    skippedFiles: skippedCount
  },
  mapping: iso2ToAdm0A3,
  copiedFiles,
  skippedFiles
};

fs.writeFileSync('public/flags/mapping.json', JSON.stringify(mappingData, null, 2));
console.log('\n📄 Created mapping.json for reference');

console.log(`\n🎉 Flag copying complete! ${copiedCount} flags are now available in public/flags/`);