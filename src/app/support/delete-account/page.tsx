'use client'

import { useState } from 'react'
import Link from 'next/link'
import NavigationBar from '../../../components/NavigationBar'
import { signInWithEmail, getCurrentUser } from '../../../lib/firebase-client'
import { deleteUser } from 'firebase/auth'

function DeleteAccountPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoggingIn(true)

    try {
      await signInWithEmail(email, password)
      setIsLoggedIn(true)
      setShowConfirmDialog(true)
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login. Please check your credentials.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const user = getCurrentUser()
      if (!user) {
        throw new Error('No user logged in')
      }

      await deleteUser(user)
      setIsDeleted(true)
      setShowConfirmDialog(false)
    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err.message || 'Failed to delete account. Please try again.')
      setShowConfirmDialog(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentSection="support" />
      
      <main className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <Link href="/support" className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Support
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 mt-4">
            Delete Your Account
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Login to your account to delete it
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8">
            {isDeleted ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Account Successfully Deleted
                </h2>
                <p className="text-gray-600 mb-6">
                  Your account has been permanently deleted. All your data has been removed from our systems.
                </p>
                <Link 
                  href="/"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            ) : !isLoggedIn ? (
              <form onSubmit={handleLogin} className="max-w-md mx-auto">
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login to Delete Account'}
                </button>
              </form>
            ) : null}
          </div>

          {/* Confirmation Dialog */}
          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Delete Your Account?
                  </h3>
                  <p className="text-gray-600 text-center">
                    Do you want to delete your account at Overland Map? You will lose access to all purchases and all your settings. This is irreversible.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'OK, Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function DeleteAccountPage() {
  return <DeleteAccountPageContent />
}
