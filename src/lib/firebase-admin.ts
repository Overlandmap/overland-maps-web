import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  // Check if Firebase Admin is already initialized
  if (getApps().length > 0) {
    return getApps()[0]
  }

  // For build-time usage, we'll use service account key
  // Support both full JSON key and individual environment variables
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  const projectId = process.env.FIREBASE_PROJECT_ID || 'overlandaventure'
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  let serviceAccountKey

  if (serviceAccountJson) {
    // Use full JSON service account key
    try {
      serviceAccountKey = JSON.parse(serviceAccountJson)
    } catch (error) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.')
    }
  } else if (clientEmail && privateKey) {
    // Use individual environment variables
    serviceAccountKey = {
      type: 'service_account',
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
    }
  } else {
    throw new Error(
      'Firebase Admin authentication required. Provide either:\n' +
      '1. FIREBASE_SERVICE_ACCOUNT_KEY (full JSON)\n' +
      '2. FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (individual fields)'
    )
  }

  const app = initializeApp({
    credential: cert(serviceAccountKey),
    projectId: serviceAccountKey.project_id || 'overlandaventure'
  })

  return app
}

// Get Firestore instance
export function getFirestoreAdmin() {
  const app = initializeFirebaseAdmin()
  return getFirestore(app)
}

// Connection utility with error handling
export async function testFirestoreConnection() {
  try {
    const db = getFirestoreAdmin()
    // Test connection by attempting to read from a collection
    await db.collection('country').limit(1).get()
    console.log('✅ Firestore connection successful')
    return true
  } catch (error) {
    console.error('❌ Firestore connection failed:', error)
    throw error
  }
}

// Retry utility for Firestore operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}