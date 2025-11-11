import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreAdmin } from '../../../lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json()
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing border post IDs' },
        { status: 400 }
      )
    }
    
    console.log(`🔄 API: Fetching ${ids.length} border posts from Firestore...`)
    
    const db = getFirestoreAdmin()
    
    // Fetch border posts in batches (Firestore 'in' query limit is 10)
    const batchSize = 10
    const batches = []
    
    for (let i = 0; i < ids.length; i += batchSize) {
      const batchIds = ids.slice(i, i + batchSize)
      const snapshot = await db.collection('border_post')
        .where('__name__', 'in', batchIds)
        .get()
      
      batches.push(snapshot)
    }
    
    // Combine results from all batches
    const borderPosts: any[] = []
    
    for (const snapshot of batches) {
      snapshot.forEach(doc => {
        const data = doc.data()
        borderPosts.push({
          id: doc.id,
          ...data
        })
      })
    }
    
    console.log(`✅ API: Fetched ${borderPosts.length} border posts`)
    
    return NextResponse.json({
      borderPosts,
      count: borderPosts.length
    })
  } catch (error) {
    console.error('❌ API: Failed to fetch border posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch border posts', details: String(error) },
      { status: 500 }
    )
  }
}
