import { Suspense } from 'react'
import { AuthProvider } from '../../../contexts/AuthContext'
import WorldMapApp from '../../../components/WorldMapApp'

interface BorderPageProps {
  params: {
    id: string
  }
}

export default function BorderPage({ params }: BorderPageProps) {
  return (
    <AuthProvider>
      <main className="h-screen relative">
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Border Details</h2>
              <p className="text-gray-600">Loading border {params.id}...</p>
            </div>
          </div>
        }>
          <WorldMapApp initialBorder={params.id} />
        </Suspense>
      </main>
    </AuthProvider>
  )
}

// Generate static paths for all borders
export async function generateStaticParams() {
  const fs = require('fs')
  const path = require('path')
  
  try {
    const bordersPath = path.join(process.cwd(), 'public/data/borders.json')
    const bordersData = JSON.parse(fs.readFileSync(bordersPath, 'utf8'))
    
    // Generate paths for all borders with valid IDs
    const paths = bordersData.borders
      .filter((border: any) => border.id)
      .map((border: any) => ({
        id: border.id
      }))
    
    console.log(`📄 Generated ${paths.length} static border pages`)
    return paths
  } catch (error) {
    console.error('❌ Failed to generate border static params:', error)
    return []
  }
}