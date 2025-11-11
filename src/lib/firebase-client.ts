/**
 * Client-side Firebase configuration for browser operations
 * Used for real-time updates to Firestore from the web app
 */

/**
 * Client-side Firebase operations using server-side API endpoints
 * This approach uses the admin SDK on the server for secure database operations
 */

/**
 * Update a country's overlanding status using server-side API and return updated data
 */
export async function updateCountryOverlanding(countryId: string, overlanding: number): Promise<any> {
  try {
    console.log(`🔄 Updating overlanding status for ${countryId} to ${overlanding} via API`)
    
    const response = await fetch('/api/update-country', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countryId,
        field: 'overlanding',
        value: overlanding
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`API Error (${response.status}): ${errorData.error || errorData.details || 'Failed to update'}`)
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Update failed')
    }
    
    console.log(`✅ Successfully updated overlanding status for ${countryId} via API`)
    return result.data
    
  } catch (error) {
    console.error(`❌ Failed to update overlanding status for ${countryId}:`, error)
    
    // Enhance error with context
    if (error instanceof Error) {
      const enhancedError = new Error(`Failed to update overlanding for country ${countryId}: ${error.message}`)
      // Add original error info to the enhanced error
      ;(enhancedError as any).originalError = error
      throw enhancedError
    }
    
    throw error
  }
}

/**
 * Update any field in a country document
 */
export async function updateCountryField(
  countryId: string, 
  field: string, 
  value: any
): Promise<any> {
  try {
    console.log(`🔄 Updating ${field} for ${countryId} to ${value} via API`)
    
    const response = await fetch('/api/update-country', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countryId,
        field,
        value
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`API Error (${response.status}): ${errorData.error || errorData.details || 'Failed to update'}`)
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Update failed')
    }
    
    console.log(`✅ Successfully updated ${field} for ${countryId} via API`)
    return result.data
    
  } catch (error) {
    console.error(`❌ Failed to update ${field} for ${countryId}:`, error)
    throw error
  }
}



/**
 * Update a border's status using server-side API and return updated data
 */
export async function updateBorderStatus(borderId: string, isOpen: number): Promise<any> {
  try {
    console.log(`🔄 Updating border status for ${borderId} to ${isOpen} via API`)
    
    const response = await fetch('/api/update-border', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        borderId,
        field: 'is_open',
        value: isOpen
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`API Error (${response.status}): ${errorData.error || errorData.details || 'Failed to update'}`)
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Update failed')
    }
    
    console.log(`✅ Successfully updated border status for ${borderId} via API`)
    return result.data
    
  } catch (error) {
    console.error(`❌ Failed to update border status for ${borderId}:`, error)
    
    // Enhance error with context
    if (error instanceof Error) {
      const enhancedError = new Error(`Failed to update border status for ${borderId}: ${error.message}`)
      ;(enhancedError as any).originalError = error
      throw enhancedError
    }
    
    throw error
  }
}