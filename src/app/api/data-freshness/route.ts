import { NextResponse } from 'next/server'
import { getFirestoreAdmin } from '../../../lib/firebase-admin'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    console.log('🔄 API: Checking data freshness...')
    
    // Get the timestamp of the static countries.json file
    const staticFilePath = path.join(process.cwd(), 'public/data/countries.json')
    let staticFileTime = 0
    
    if (fs.existsSync(staticFilePath)) {
      const stats = fs.statSync(staticFilePath)
      staticFileTime = stats.mtime.getTime()
    }
    
    // Check for recent updates in Firestore
    const db = getFirestoreAdmin()
    const recentUpdatesQuery = db.collection('country')
      .where('updatedAt', '>', new Date(staticFileTime))
      .limit(1)
    
    const recentUpdates = await recentUpdatesQuery.get()
    const hasRecentUpdates = !recentUpdates.empty
    
    // Also check if any document has been modified recently (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const veryRecentQuery = db.collection('country')
      .where('updatedAt', '>', fiveMinutesAgo)
      .limit(1)
    
    const veryRecentUpdates = await veryRecentQuery.get()
    const hasVeryRecentUpdates = !veryRecentUpdates.empty
    
    console.log(`📊 Data freshness check:`, {
      staticFileTime: new Date(staticFileTime).toISOString(),
      hasRecentUpdates,
      hasVeryRecentUpdates,
      recommendation: hasRecentUpdates || hasVeryRecentUpdates ? 'load-fresh' : 'use-static'
    })
    
    return NextResponse.json({
      staticFileTime,
      hasRecentUpdates,
      hasVeryRecentUpdates,
      recommendation: hasRecentUpdates || hasVeryRecentUpdates ? 'load-fresh' : 'use-static',
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('❌ API: Failed to check data freshness:', error)
    
    // If we can't check, assume static data is fine
    return NextResponse.json({
      staticFileTime: 0,
      hasRecentUpdates: false,
      hasVeryRecentUpdates: false,
      recommendation: 'use-static',
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}