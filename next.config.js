/** @type {import('next').NextConfig} */
// Read base path from environment variable
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',
  distDir: 'map',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Enable relative paths for subdirectory deployment
  assetPrefix: basePath,
  basePath: basePath,
  
  // Custom webpack configuration for build-time data generation
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Only run data generation during server-side build (not for client)
    if (isServer && !dev) {
      // Add a plugin to run data generation before the build completes
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
        })
      )
    }
    
    return config
  },
  
  // Environment variables to expose to the client
  env: {
    BUILD_TIME: process.env.BUILD_TIME || new Date().toISOString(),
  },
}

module.exports = nextConfig