#!/usr/bin/env node

/**
 * Alternative script to regenerate static files with timeout protection
 * Use this if the main build-data.ts script hangs
 * Run with: npm run regenerate-static-files
 */

const { spawn } = require('child_process')

async function regenerateStaticFiles() {
  const startTime = Date.now()
  
  console.log('🚀 Running build script with timeout protection...')
  
  return new Promise((resolve, reject) => {
    // Spawn the main build process
    const buildProcess = spawn('npm', ['run', 'build:data', '--', '--skip-validation'], {
      stdio: 'inherit',
      shell: true
    })
    
    // Set up timeout (3 minutes)
    const timeout = setTimeout(() => {
      console.log('\n⏰ Build process timed out after 3 minutes, terminating...')
      buildProcess.kill('SIGTERM')
      
      // Force kill if SIGTERM doesn't work
      setTimeout(() => {
        buildProcess.kill('SIGKILL')
      }, 5000)
      
      reject(new Error('Build process timed out'))
    }, 3 * 60 * 1000)
    
    buildProcess.on('close', (code) => {
      clearTimeout(timeout)
      const duration = Math.round((Date.now() - startTime) / 1000)
      
      if (code === 0) {
        console.log(`\n✅ Static files regenerated successfully in ${duration}s`)
        console.log('📄 Check public/data/ for generated files including border-posts.geojson')
        resolve(code)
      } else {
        console.log(`\n❌ Build process exited with code ${code}`)
        reject(new Error(`Build failed with exit code ${code}`))
      }
    })
    
    buildProcess.on('error', (error) => {
      clearTimeout(timeout)
      console.error('❌ Failed to start build process:', error)
      reject(error)
    })
  })
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⚠️ Received SIGINT, exiting...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⚠️ Received SIGTERM, exiting...')
  process.exit(0)
})

// Run the script
if (require.main === module) {
  regenerateStaticFiles()
}

module.exports = { regenerateStaticFiles }