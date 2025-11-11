import { NextResponse } from 'next/server'
import { getFirestoreAdmin } from '../../../lib/firebase-admin'

export async function GET() {
  try {
    console.log('🔄 API: Fetching fresh country data from Firestore...')
    
    const db = getFirestoreAdmin()
    const snapshot = await db.collection('country').get()
    
    if (snapshot.empty) {
      console.warn('⚠️ No countries found in Firestore')
      return NextResponse.json({
        countries: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          totalCountries: 0,
          source: 'firestore-live'
        }
      })
    }

    const countries: any[] = []
    
    snapshot.forEach(doc => {
      const data = doc.data()
      
      const country = {
        id: doc.id,
        iso_a3: data.iso_a3 || data.iso3 || data.ISO_A3,
        name: data.name || data.country_name || 'Unknown',
        parameters: { ...data },
        borderIds: []
      }
      
      countries.push(country)
    })

    console.log(`✅ API: Fetched ${countries.length} countries from Firestore`)
    
    return NextResponse.json({
      countries,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalCountries: countries.length,
        source: 'firestore-live'
      }
    })
    
  } catch (error) {
    console.error('❌ API: Failed to fetch countries:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch countries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}