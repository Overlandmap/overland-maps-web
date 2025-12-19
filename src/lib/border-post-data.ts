/**
 * Border Post Data Loader
 * Loads border post details from the static JSON file
 */

export interface BorderPostDetail {
  id: string
  is_open?: number
  name?: string
  comment?: string
  comment_translations?: Record<string, string>
  location?: string | { _latitude: number; _longitude: number }
  countries?: string
  coordinates?: [number, number]
  [key: string]: any
}

let borderPostsCache: Record<string, BorderPostDetail> | null = null

/**
 * Load border posts data from the static JSON file
 */
export async function loadBorderPosts(): Promise<Record<string, BorderPostDetail>> {
  if (borderPostsCache) {
    return borderPostsCache
  }

  try {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const response = await fetch(`${basePath}/data/border-posts.json`)
    
    if (!response.ok) {
      throw new Error(`Failed to load border posts: ${response.statusText}`)
    }
    
    const borderPosts: BorderPostDetail[] = await response.json()
    
    // Convert array to lookup object by ID
    borderPostsCache = borderPosts.reduce((acc, bp) => {
      acc[bp.id] = bp
      return acc
    }, {} as Record<string, BorderPostDetail>)
    
    console.log(`✅ Loaded ${borderPosts.length} border posts`)
    return borderPostsCache
  } catch (error) {
    console.error('❌ Failed to load border posts:', error)
    return {}
  }
}

/**
 * Get border post details by ID
 */
export async function getBorderPostById(id: string): Promise<BorderPostDetail | null> {
  const borderPosts = await loadBorderPosts()
  return borderPosts[id] || null
}

/**
 * Preload border posts data (call this early in the app lifecycle)
 */
export function preloadBorderPosts(): void {
  loadBorderPosts().catch(error => {
    console.error('Failed to preload border posts:', error)
  })
}
