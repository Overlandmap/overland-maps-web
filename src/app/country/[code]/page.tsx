import { Suspense } from 'react'
import { LanguageProvider } from '../../../contexts/LanguageContext'
import { AuthProvider } from '../../../contexts/AuthContext'
import WorldMapApp from '../../../components/WorldMapApp'

interface CountryPageProps {
  params: {
    code: string
  }
}

export default function CountryPage({ params }: CountryPageProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <main className="h-screen relative">
          <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Country Details</h2>
                <p className="text-gray-600">Loading {params.code}...</p>
              </div>
            </div>
          }>
            <WorldMapApp initialCountry={params.code} />
          </Suspense>
        </main>
      </LanguageProvider>
    </AuthProvider>
  )
}

// Generate static paths for all countries
export async function generateStaticParams() {
  const fs = require('fs')
  const path = require('path')
  
  try {
    const countriesPath = path.join(process.cwd(), 'public/data/countries.json')
    const countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf8'))
    
    // Generate paths for all countries with valid codes
    const paths = countriesData.countries
      .filter((country: any) => country.iso_a3 || country.id)
      .map((country: any) => ({
        code: country.iso_a3 || country.id
      }))
    
    console.log(`📄 Generated ${paths.length} static country pages`)
    return paths
  } catch (error) {
    console.error('❌ Failed to generate country static params:', error)
    return []
  }
}