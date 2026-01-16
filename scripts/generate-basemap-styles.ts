#!/usr/bin/env ts-node
/**
 * Generate basemap style files for all supported languages
 * 
 * This script reads basemap-fr.json as a reference and creates
 * language-specific versions by replacing "name:fr" with "name:XX"
 * for each supported language.
 * 
 * Usage: npx ts-node scripts/generate-basemap-styles.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Supported languages (excluding French which is the reference)
const LANGUAGES = ['de', 'en', 'es', 'it', 'ja', 'nl', 'pt', 'ru'];

// Paths
const STYLES_DIR = path.join(__dirname, '..', 'public', 'styles');
const REFERENCE_FILE = path.join(STYLES_DIR, 'basemap-fr.json');

/**
 * Replace all occurrences of name:fr with name:XX in the JSON content
 */
function replaceLanguage(content: string, targetLang: string): string {
  // Replace "name:fr" with "name:XX"
  return content.replace(/"name:fr"/g, `"name:${targetLang}"`);
}

/**
 * Generate basemap style file for a specific language
 */
function generateStyleForLanguage(lang: string): void {
  try {
    // Read the reference file
    const referenceContent = fs.readFileSync(REFERENCE_FILE, 'utf-8');
    
    // Replace language code
    const translatedContent = replaceLanguage(referenceContent, lang);
    
    // Write to output file
    const outputFile = path.join(STYLES_DIR, `basemap-${lang}.json`);
    fs.writeFileSync(outputFile, translatedContent, 'utf-8');
    
    console.log(`✓ Generated basemap-${lang}.json`);
  } catch (error) {
    console.error(`✗ Error generating basemap-${lang}.json:`, error);
    throw error;
  }
}

/**
 * Main function
 */
function main(): void {
  console.log('Generating basemap style files...\n');
  
  // Check if reference file exists
  if (!fs.existsSync(REFERENCE_FILE)) {
    console.error(`Error: Reference file not found: ${REFERENCE_FILE}`);
    process.exit(1);
  }
  
  // Generate styles for all languages
  let successCount = 0;
  let errorCount = 0;
  
  for (const lang of LANGUAGES) {
    try {
      generateStyleForLanguage(lang);
      successCount++;
    } catch (error) {
      errorCount++;
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Summary:`);
  console.log(`  ✓ Successfully generated: ${successCount} files`);
  if (errorCount > 0) {
    console.log(`  ✗ Failed: ${errorCount} files`);
  }
  console.log(`${'='.repeat(50)}\n`);
  
  if (errorCount > 0) {
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { generateStyleForLanguage, replaceLanguage };
