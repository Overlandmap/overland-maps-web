/**
 * Firebase Client SDK Configuration
 * Handles client-side Firebase initialization and authentication
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
let app: FirebaseApp
let auth: Auth

if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
}

/**
 * Sign in anonymously
 */
export async function signInAnonymous(): Promise<User> {
  try {
    const result = await signInAnonymously(auth)
    console.log('✅ Signed in anonymously:', result.user.uid)
    return result.user
  } catch (error) {
    console.error('❌ Anonymous sign-in failed:', error)
    throw error
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    console.log('✅ Signed in with email:', result.user.email)
    return result.user
  } catch (error) {
    console.error('❌ Email sign-in failed:', error)
    throw error
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth)
    console.log('✅ Signed out')
  } catch (error) {
    console.error('❌ Sign-out failed:', error)
    throw error
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth?.currentUser || null
}

export { auth }
