import { Suspense } from 'react'
import { LanguageProvider } from '../../../contexts/LanguageContext'
import { AuthProvider } from '../../../contexts/AuthContext'
import WorldMapApp from '../../../components/WorldMapApp'

interface ZonePageProps {
  params: {
    id: string
  }
}

export default function ZonePage({ params }: ZonePageProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <main className="h-screen">
          <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Zone Details</h2>
                <p className="text-gray-600">Loading {params.id}...</p>
              </div>
            </div>
          }>
            <WorldMapApp initialZone={params.id} />
          </Suspense>
        </main>
      </LanguageProvider>
    </AuthProvider>
  )
}

// Generate static paths for all zones
export async function generateStaticParams() {
  const fs = require('fs')
  const path = require('path')
  
  try {
    const zonesPath = path.join(process.cwd(), 'public/data/zones.json')
    const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'))
    
    // Generate paths for all zones
    const paths = Object.keys(zonesData).map((zoneId) => ({
      id: zoneId
    }))
    
    console.log(`📄 Generated ${paths.length} static zone pages`)
    return paths
  } catch (error) {
    console.error('❌ Failed to generate zone static params:', error)
    return []
  }
}
