import { Suspense } from 'react'
import { AuthProvider } from '../../../contexts/AuthContext'
import WorldMapApp from '../../../components/WorldMapApp'

interface ItineraryPageProps {
  params: {
    id: string
  }
}

export default function ItineraryPage({ params }: ItineraryPageProps) {
  return (
    <AuthProvider>
      <main className="h-screen relative">
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Itinerary Details</h2>
              <p className="text-gray-600">Loading itinerary {params.id}...</p>
            </div>
          </div>
        }>
          <WorldMapApp initialItinerary={params.id} />
        </Suspense>
      </main>
    </AuthProvider>
  )
}

// Generate static paths for all itineraries
export async function generateStaticParams() {
  const fs = require('fs')
  const path = require('path')
  
  try {
    const itinerariesPath = path.join(process.cwd(), 'public/data/itineraries.json')
    const itinerariesData = JSON.parse(fs.readFileSync(itinerariesPath, 'utf8'))
    
    // Generate paths for all itineraries
    const paths = itinerariesData.itineraries
      .filter((itinerary: any) => itinerary.id)
      .map((itinerary: any) => ({
        id: itinerary.id
      }))
    
    console.log(`📄 Generated ${paths.length} static itinerary pages`)
    return paths
  } catch (error) {
    console.error('❌ Failed to generate itinerary static params:', error)
    return []
  }
}