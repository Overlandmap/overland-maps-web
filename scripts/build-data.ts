#!/usr/bin/env node

/**
 * Main build script for static data generation
 * Orchestrates Firestore data fetching, processing, and static file generation
 * 
 * Usage:
 *   npm run build:data                          # Normal build with validation
 *   npm run build:data:skip-validation          # Build without validation (faster)
 *   npm run build:data -- --skip-validation     # Alternative syntax
 *   npm run build:data -- --verbose             # Enable verbose logging
 *   npm run build:data -- --output ./custom     # Custom output directory
 * 
 * Options:
 *   --skip-validation    Skip data validation step (useful when validation fails but data is acceptable)
 *   --verbose           Enable detailed logging and stack traces
 *   --output <dir>      Specify custom output directory (default: public/data)
 */

const { config } = require('dotenv')
const { FirestoreDataFetcher } = require('../src/lib/firestore-data-fetcher')
const { DataProcessor } = require('../src/lib/data-processor')
const { StaticFileGenerator } = require('../src/lib/static-file-generator')

// Load environment variables
config()

interface BuildOptions {
  outputDir?: string
  skipValidation?: boolean
  verbose?: boolean
}

class DataBuildPipeline {
  private fetcher: any
  private processor: any
  private generator: any
  private options: BuildOptions

  constructor(options: BuildOptions = {}) {
    this.options = {
      outputDir: 'public/data',
      skipValidation: false,
      verbose: false,
      ...options
    }

    this.fetcher = new FirestoreDataFetcher()
    this.processor = new DataProcessor()
    this.generator = new StaticFileGenerator(this.options.outputDir)
  }

  /**
   * Execute the complete build pipeline
   */
  async execute(): Promise<void> {
    const startTime = Date.now()
    
    // Set a timeout to force exit if the script hangs
    const timeout = setTimeout(() => {
      console.error('❌ Build script timed out after 5 minutes. Forcing exit...')
      process.exit(1)
    }, 5 * 60 * 1000) // 5 minutes
    
    try {
      console.log('🚀 Starting data build pipeline...')
      console.log(`📁 Output directory: ${this.options.outputDir}`)
      if (this.options.skipValidation) {
        console.log('⚠️  Validation will be skipped (--skip-validation flag set)')
      }
      if (this.options.verbose) {
        console.log('📢 Verbose mode enabled')
      }
      
      // Step 1: Validate Firestore collections
      await this.validateCollections()
      
      // Step 2: Fetch raw data from Firestore
      const { countries, borders, borderPosts, zones } = await this.fetchData()
      
      // Step 3: Process and transform data
      const { processedCountries, processedBorders, processedBorderPosts, iso3Lookup } = await this.processData(countries, borders, borderPosts)
      
      // Step 4: Validate processed data
      if (!this.options.skipValidation) {
        await this.validateProcessedData(processedCountries, processedBorders, processedBorderPosts)
      } else {
        console.log('\n⏭️  Step 4: Skipping data validation (--skip-validation flag set)')
      }
      
      // Step 5: Generate static files
      await this.generateStaticFiles(processedCountries, processedBorders, processedBorderPosts, zones, iso3Lookup)
      
      // Step 6: Generate build report
      await this.generateBuildReport(countries, processedCountries, borders, processedBorders, iso3Lookup)
      
      const duration = Math.round((Date.now() - startTime) / 1000)
      console.log(`✅ Build pipeline completed successfully in ${duration}s`)
      
      // Clear the timeout
      clearTimeout(timeout)
      
      // Cleanup Firebase connections
      await this.fetcher.cleanup()
      
      // Explicitly exit the process to close Firebase connections
      process.exit(0)
      
    } catch (error) {
      const duration = Math.round((Date.now() - startTime) / 1000)
      console.error(`❌ Build pipeline failed after ${duration}s:`)
      console.error(error instanceof Error ? error.message : String(error))
      
      if (this.options.verbose && error instanceof Error) {
        console.error('Stack trace:', error.stack)
      }
      
      // Clear the timeout
      clearTimeout(timeout)
      
      // Cleanup Firebase connections
      try {
        await this.fetcher.cleanup()
      } catch (cleanupError) {
        console.warn('⚠️ Cleanup failed:', cleanupError)
      }
      
      process.exit(1)
    }
  }

  /**
   * Validate that required Firestore collections exist and have data
   */
  private async validateCollections(): Promise<void> {
    console.log('\n📋 Step 1: Validating Firestore collections...')
    
    const validation = await this.fetcher.validateCollections()
    
    if (!validation.countries) {
      throw new Error('Country collection is empty or inaccessible')
    }
    
    if (!validation.borders) {
      throw new Error('Border collection is empty or inaccessible')
    }
    
    if (!validation.borderPosts) {
      console.warn('⚠️ Border post collection is empty or inaccessible - continuing without border posts')
    }
    
    // Get collection statistics
    const stats = await this.fetcher.getCollectionStats()
    console.log(`📊 Found ${stats.countryCount} countries, ${stats.borderCount} borders, ${stats.borderPostCount} border posts`)
    console.log(`🔗 ${stats.countriesWithBorders} countries have border relationships`)
  }

  /**
   * Fetch raw data from Firestore collections
   */
  private async fetchData() {
    console.log('\n📥 Step 2: Fetching data from Firestore...')
    
    // Fetch countries with their border relationships
    const countries = await this.fetcher.fetchCountriesWithBorders()
    
    // Fetch all borders
    const borders = await this.fetcher.fetchBorders()
    
    // Fetch all border posts
    const borderPosts = await this.fetcher.fetchBorderPosts()
    
    // Fetch all zones
    const zones = await this.fetcher.fetchZones()
    
    console.log(`✅ Fetched ${countries.length} countries, ${borders.length} borders, ${borderPosts.length} border posts, and ${zones.length} zones`)
    
    return { countries, borders, borderPosts, zones }
  }

  /**
   * Process and transform the raw data
   */
  private async processData(countries: any[], borders: any[], borderPosts: any[]) {
    console.log('\n⚙️ Step 3: Processing and transforming data...')
    
    // Process countries
    const processedCountries = this.processor.processCountryData(countries)
    
    // Process borders
    const processedBorders = this.processor.processBorderData(borders)
    
    // Process border posts
    const processedBorderPosts = this.processor.processBorderPostData(borderPosts)
    
    // Create ISO3 lookup table
    const iso3Lookup = this.processor.createISO3Lookup(processedCountries)
    
    // Get processing statistics
    const stats = this.processor.getProcessingStats(countries, processedCountries, borders, processedBorders)
    
    console.log(`📊 Processing results:`)
    console.log(`   Countries: ${stats.countries.processed}/${stats.countries.original} (${stats.countries.successRate}%)`)
    console.log(`   Borders: ${stats.borders.processed}/${stats.borders.original} (${stats.borders.successRate}%)`)
    console.log(`   Border Posts: ${processedBorderPosts.length}/${borderPosts.length} (${Math.round((processedBorderPosts.length / borderPosts.length) * 100)}%)`)
    console.log(`   ISO3 mappings: ${Object.keys(iso3Lookup).length}`)
    
    return { processedCountries, processedBorders, processedBorderPosts, iso3Lookup }
  }

  /**
   * Validate the processed data integrity
   */
  private async validateProcessedData(processedCountries: any[], processedBorders: any[], processedBorderPosts: any[]): Promise<void> {
    console.log('\n🔍 Step 4: Validating processed data...')
    
    const validation = this.processor.validateProcessedData(processedCountries, processedBorders, processedBorderPosts)
    
    if (!validation.isValid) {
      console.warn('⚠️ Data validation issues found (continuing with build):')
      validation.issues.forEach((issue: string) => console.warn(`   - ${issue}`))
    } else {
      console.log('✅ Data validation passed')
    }
    
    console.log('✅ Validation completed (continuing with warnings if any)')
  }

  /**
   * Generate all static files
   */
  private async generateStaticFiles(processedCountries: any[], processedBorders: any[], processedBorderPosts: any[], zones: any[], iso3Lookup: any): Promise<void> {
    console.log('\n📄 Step 5: Generating static files...')
    
    // Generate country JSON
    this.generator.generateCountryJSON(processedCountries)
    
    // Generate border JSON (for routes only - data loaded from Firestore)
    this.generator.generateBorderJSON(processedBorders)
    
    // Generate border GeoJSON (for PMTiles generation)
    const borderGeoJSON = this.processor.generateBorderGeoJSON(processedBorders)
    this.generator.generateBorderGeoJSONFiles(borderGeoJSON)
    
    // Generate border post GeoJSON
    const borderPostGeoJSON = this.processor.generateBorderPostGeoJSON(processedBorderPosts)
    this.generator.generateBorderPostGeoJSONFiles(borderPostGeoJSON)
    
    // Generate border post JSON (without geography, for detail lookups)
    this.generator.generateBorderPostJSONFile(processedBorderPosts)
    
    // Generate zones JSON (plain JSON for detail lookups - used by app)
    this.generator.generateZonesJSONFile(zones)
    
    // Generate ISO3 lookup
    this.generator.generateISO3LookupJSON(iso3Lookup)
    
    // Generate manifest
    this.generator.generateManifest(processedCountries, processedBorders, processedBorderPosts, iso3Lookup)
    
    console.log('✅ All static files generated successfully')
  }

  /**
   * Generate comprehensive build report
   */
  private async generateBuildReport(
    originalCountries: any[], 
    processedCountries: any[], 
    originalBorders: any[], 
    processedBorders: any[], 
    iso3Lookup: any
  ): Promise<void> {
    console.log('\n📊 Step 6: Generating build report...')
    
    const report = {
      buildInfo: {
        timestamp: new Date().toISOString(),
        duration: Date.now(),
        nodeVersion: process.version,
        platform: process.platform
      },
      dataStats: {
        countries: {
          fetched: originalCountries.length,
          processed: processedCountries.length,
          withIso3: processedCountries.filter((c: any) => c.iso_a3).length,
          withBorders: processedCountries.filter((c: any) => c.borderIds.length > 0).length
        },
        borders: {
          fetched: originalBorders.length,
          processed: processedBorders.length,
          withGeometry: processedBorders.filter((b: any) => b.geometry).length
        },
        mappings: {
          iso3Lookup: Object.keys(iso3Lookup).length
        }
      },
      qualityMetrics: {
        countryProcessingRate: Math.round((processedCountries.length / originalCountries.length) * 100),
        borderProcessingRate: Math.round((processedBorders.length / originalBorders.length) * 100),
        iso3CoverageRate: Math.round((processedCountries.filter((c: any) => c.iso_a3).length / processedCountries.length) * 100)
      }
    }
    
    // Write build report
    const reportPath = `${this.options.outputDir}/build-report.json`
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log('📋 Build Report Summary:')
    console.log(`   Countries processed: ${report.dataStats.countries.processed}/${report.dataStats.countries.fetched}`)
    console.log(`   Borders processed: ${report.dataStats.borders.processed}/${report.dataStats.borders.fetched}`)
    console.log(`   ISO3 coverage: ${report.qualityMetrics.iso3CoverageRate}%`)
    console.log(`   Report saved: ${reportPath}`)
  }
}

/**
 * Main execution function
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2)
  const options: BuildOptions = {}
  
  if (args.includes('--skip-validation')) {
    options.skipValidation = true
  }
  
  if (args.includes('--verbose')) {
    options.verbose = true
  }
  
  const outputDirIndex = args.indexOf('--output')
  if (outputDirIndex !== -1 && args[outputDirIndex + 1]) {
    options.outputDir = args[outputDirIndex + 1]
  }
  
  // Execute build pipeline
  const pipeline = new DataBuildPipeline(options)
  await pipeline.execute()
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

// Execute if this script is run directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Build script failed:', error)
    process.exit(1)
  })
}

module.exports = { DataBuildPipeline }