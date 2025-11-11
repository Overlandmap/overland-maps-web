#!/usr/bin/env node

/**
 * Build verification script
 * Verifies that all required data files are generated and valid
 * Run with: npx ts-node scripts/verify-build.ts
 */

const { existsSync, readFileSync, statSync } = require('fs')
const { join } = require('path')

interface VerificationResult {
  file: string
  exists: boolean
  size: number
  valid: boolean
  error?: string
}

class BuildVerifier {
  private dataDir: string
  private results: VerificationResult[] = []

  constructor(dataDir: string = 'public/data') {
    this.dataDir = dataDir
  }

  /**
   * Verify all generated data files
   */
  async verify(): Promise<boolean> {
    console.log('🔍 Verifying build output...')
    console.log(`📁 Data directory: ${this.dataDir}`)
    
    const requiredFiles = [
      'countries.json',
      'borders.json',
      'borders.geojson',
      'borders-optimized.geojson',
      'iso3-lookup.json',
      'manifest.json',
      'build-report.json'
    ]

    // Verify each required file
    for (const file of requiredFiles) {
      await this.verifyFile(file)
    }

    // Print results
    this.printResults()

    // Return overall success
    const allValid = this.results.every(result => result.exists && result.valid)
    
    if (allValid) {
      console.log('✅ All build verification checks passed')
    } else {
      console.log('❌ Build verification failed')
    }

    return allValid
  }

  /**
   * Verify a specific file
   */
  private async verifyFile(filename: string): Promise<void> {
    const filePath = join(this.dataDir, filename)
    const result: VerificationResult = {
      file: filename,
      exists: false,
      size: 0,
      valid: false
    }

    try {
      // Check if file exists
      result.exists = existsSync(filePath)
      
      if (!result.exists) {
        result.error = 'File does not exist'
        this.results.push(result)
        return
      }

      // Get file size
      const stats = statSync(filePath)
      result.size = stats.size

      // Validate file content based on type
      if (filename.endsWith('.json')) {
        result.valid = await this.validateJSON(filePath)
      } else if (filename.endsWith('.geojson')) {
        result.valid = await this.validateGeoJSON(filePath)
      } else {
        result.valid = true // Unknown type, assume valid if exists
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error)
    }

    this.results.push(result)
  }

  /**
   * Validate JSON file
   */
  private async validateJSON(filePath: string): Promise<boolean> {
    try {
      const content = readFileSync(filePath, 'utf8')
      const parsed = JSON.parse(content)
      
      // Basic validation - ensure it's an object
      if (typeof parsed !== 'object' || parsed === null) {
        return false
      }

      // File-specific validation
      const filename = filePath.split('/').pop() || ''
      
      if (filename === 'countries.json') {
        return this.validateCountriesJSON(parsed)
      } else if (filename === 'borders.json') {
        return this.validateBordersJSON(parsed)
      } else if (filename === 'iso3-lookup.json') {
        return this.validateISO3LookupJSON(parsed)
      } else if (filename === 'manifest.json') {
        return this.validateManifestJSON(parsed)
      }

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Validate GeoJSON file
   */
  private async validateGeoJSON(filePath: string): Promise<boolean> {
    try {
      const content = readFileSync(filePath, 'utf8')
      const geoJSON = JSON.parse(content)
      
      // Basic GeoJSON validation
      if (geoJSON.type !== 'FeatureCollection') {
        return false
      }
      
      if (!Array.isArray(geoJSON.features)) {
        return false
      }

      // Validate a sample of features
      const sampleSize = Math.min(10, geoJSON.features.length)
      for (let i = 0; i < sampleSize; i++) {
        const feature = geoJSON.features[i]
        if (feature.type !== 'Feature' || !feature.geometry) {
          return false
        }
      }

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Validate countries.json structure
   */
  private validateCountriesJSON(data: any): boolean {
    return !!(
      data.metadata &&
      Array.isArray(data.countries) &&
      data.countries.length > 0 &&
      data.countries[0].id &&
      data.countries[0].name
    )
  }

  /**
   * Validate borders.json structure
   */
  private validateBordersJSON(data: any): boolean {
    return !!(
      data.metadata &&
      Array.isArray(data.borders) &&
      data.borders.length > 0 &&
      data.borders[0].id
    )
  }

  /**
   * Validate iso3-lookup.json structure
   */
  private validateISO3LookupJSON(data: any): boolean {
    return !!(
      data.metadata &&
      data.lookup &&
      typeof data.lookup === 'object' &&
      Object.keys(data.lookup).length > 0
    )
  }

  /**
   * Validate manifest.json structure
   */
  private validateManifestJSON(data: any): boolean {
    return !!(
      data.generatedAt &&
      data.files &&
      data.statistics &&
      typeof data.files === 'object' &&
      typeof data.statistics === 'object'
    )
  }

  /**
   * Print verification results
   */
  private printResults(): void {
    console.log('\n📊 Verification Results:')
    console.log('─'.repeat(80))
    
    for (const result of this.results) {
      const status = result.exists && result.valid ? '✅' : '❌'
      const sizeKB = Math.round(result.size / 1024)
      const sizeStr = result.size > 0 ? `${sizeKB} KB` : 'N/A'
      
      console.log(`${status} ${result.file.padEnd(30)} ${sizeStr.padStart(10)} ${result.error || ''}`)
    }
    
    console.log('─'.repeat(80))
    
    const totalSize = this.results.reduce((sum, result) => sum + result.size, 0)
    const totalSizeMB = Math.round(totalSize / 1024 / 1024 * 10) / 10
    
    console.log(`📦 Total size: ${totalSizeMB} MB`)
    console.log(`✅ Valid files: ${this.results.filter(r => r.exists && r.valid).length}/${this.results.length}`)
  }
}

/**
 * Main execution
 */
async function main() {
  const verifier = new BuildVerifier()
  const success = await verifier.verify()
  
  process.exit(success ? 0 : 1)
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })
}

module.exports = { BuildVerifier }