import { NextResponse } from 'next/server'
import { getFirestoreAdmin } from '../../../lib/firebase-admin'

export async function GET() {
  try {
    console.log('🔄 API: Fetching fresh border data from Firestore...')
    
    const db = getFirestoreAdmin()
    const bordersCollection = db.collection('border')
    
    // Fetch all border documents
    const snapshot = await bordersCollection.get()
    
    if (snapshot.empty) {
      console.warn('⚠️ API: No borders found in Firestore')
      return NextResponse.json({
        borders: [],
        metadata: {
          count: 0,
          fetchedAt: new Date().toISOString()
        }
      })
    }
    
    // Convert documents to border data
    const borders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    console.log(`✅ API: Fetched ${borders.length} borders from Firestore`)
    
    return NextResponse.json({
      borders,
      metadata: {
        count: borders.length,
        fetchedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ API: Failed to fetch borders:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch borders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}