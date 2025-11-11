import { Suspense } from 'react'
import { LanguageProvider } from '../../../contexts/LanguageContext'
import WorldMapApp from '../../../components/WorldMapApp'

interface BorderPostPageProps {
  params: {
    id: string
  }
}

interface BorderPostPageData {
  borderPostData: any | null
  borderPostId: string
}

function BorderPostMapWrapper({ borderPostData, borderPostId }: BorderPostPageData) {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading border post...</div>}>
      <WorldMapApp initialBorderPost={borderPostId} initialBorderPostData={borderPostData} />
    </Suspense>
  )
}

export default function BorderPostPage({ params }: BorderPostPageProps) {
  // Pass minimal data - the client will fetch from PMTiles or handle it
  const borderPostData = {
    id: params.id,
    name: null, // Will be loaded client-side
    is_open: -1,
    comment: null,
    countries: null,
    location: null,
    geometry: null,
    coordinates: null
  }
  
  return (
    <LanguageProvider>
      <main className="h-screen">
        <BorderPostMapWrapper borderPostData={borderPostData} borderPostId={params.id} />
      </main>
    </LanguageProvider>
  )
}

// Generate static params for border post pages
export async function generateStaticParams() {
  try {
    // Try to fetch from Firestore
    const { FirestoreDataFetcher } = await import('../../../lib/firestore-data-fetcher')
    const fetcher = new FirestoreDataFetcher()
    
    try {
      const borderPosts = await fetcher.fetchBorderPosts()
      
      if (borderPosts.length === 0) {
        console.log('⚠️ No border posts found in Firestore, skipping border post pages')
        return []
      }
      
      const paths = borderPosts.map((borderPost: any) => ({
        id: borderPost.id
      }))
      
      console.log(`📄 Generated ${paths.length} static border post pages from Firestore`)
      return paths
    } catch (firestoreError) {
      console.warn('⚠️ Failed to fetch border posts from Firestore:', firestoreError)
      console.log('⚠️ Skipping border post page generation')
      return []
    }
  } catch (error) {
    console.error('❌ Failed to generate border post static params:', error)
    // Return empty array to skip border post pages if there's an error
    return []
  }
}