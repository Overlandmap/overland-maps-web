import { Suspense } from 'react'
import { readFileSync } from 'fs'
import { join } from 'path'
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
  // Load border post data from static JSON file
  let borderPostData = null
  
  try {
    const dataPath = join(process.cwd(), 'public', 'data', 'border-posts.json')
    const fileContent = readFileSync(dataPath, 'utf-8')
    const borderPosts = JSON.parse(fileContent)
    borderPostData = borderPosts.find((bp: any) => bp.id === params.id) || null
  } catch (error) {
    console.error('Failed to load border post data:', error)
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
    // Load from static JSON file
    const dataPath = join(process.cwd(), 'public', 'data', 'border-posts.json')
    
    // Check if file exists
    try {
      const fileContent = readFileSync(dataPath, 'utf-8')
      const borderPosts = JSON.parse(fileContent)
      
      const paths = borderPosts.map((borderPost: any) => ({
        id: borderPost.id
      }))
      
      console.log(`📄 Generated ${paths.length} static border post pages from JSON`)
      return paths
    } catch (fileError) {
      console.warn('⚠️ border-posts.json not found, trying Firestore fallback...')
      
      // Fallback to Firestore if JSON file doesn't exist
      const { FirestoreDataFetcher } = await import('../../../lib/firestore-data-fetcher')
      const fetcher = new FirestoreDataFetcher()
      const borderPosts = await fetcher.fetchBorderPosts()
      
      const paths = borderPosts.map((borderPost: any) => ({
        id: borderPost.id
      }))
      
      console.log(`📄 Generated ${paths.length} static border post pages from Firestore`)
      return paths
    }
  } catch (error) {
    console.error('❌ Failed to generate border post static params:', error)
    return []
  }
}