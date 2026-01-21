'use client'

import Link from 'next/link'
import { ColorSchemeProvider } from '../../../contexts/ColorSchemeContext'
import { LanguageProvider } from '../../../contexts/LanguageContext'
import NavigationBar from '../../../components/NavigationBar'

function DeleteAccountPageContent() {
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
            Information about account deletion and data privacy
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Important Notice
                  </h3>
                  <p className="text-gray-700">
                    Deleting your account is permanent and cannot be undone. All your data, including
                    saved itineraries, contributions, and preferences will be permanently removed.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                What Gets Deleted
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Your account profile and login credentials</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Saved itineraries and favorite locations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Border crossing reports and contributions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Personal preferences and settings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>All associated personal data</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                What Remains
              </h2>
              <p className="text-gray-700 mb-4">
                To maintain data integrity and community contributions:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Anonymized border crossing data you contributed (without personal identifiers)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Aggregated statistics used for map improvements</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How to Delete Your Account
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Via Mobile App</h3>
                  <ol className="space-y-2 text-gray-700">
                    <li>1. Open the Overland Map mobile app</li>
                    <li>2. Go to Settings → Account</li>
                    <li>3. Scroll to the bottom and tap &quot;Delete Account&quot;</li>
                    <li>4. Confirm your decision</li>
                    <li>5. Your account will be deleted within 24 hours</li>
                  </ol>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Via Email Request</h3>
                  <p className="text-gray-700 mb-3">
                    If you cannot access the app, send an email to:
                  </p>
                  <p className="text-gray-700">
                    <a href="mailto:support@overlandmap.ch?subject=Account Deletion Request" className="text-blue-600 hover:text-blue-700 underline">
                      support@overlandmap.ch
                    </a>
                  </p>
                  <p className="text-gray-700 mt-3">
                    Include &quot;Account Deletion Request&quot; in the subject line and provide your registered email address.
                    We will process your request within 48 hours.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Before You Delete
              </h2>
              <p className="text-gray-700 mb-4">
                Consider these alternatives:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Temporarily disable your account</strong> - Keep your data but stop receiving notifications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Adjust privacy settings</strong> - Control what data is shared and visible</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Export your data</strong> - Download your contributions before deleting</span>
                </li>
              </ul>
            </section>

            <section className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Questions?
              </h2>
              <p className="text-gray-700">
                If you have questions about account deletion or data privacy, please{' '}
                <Link href="/support/contact" className="text-blue-600 hover:text-blue-700 underline">
                  contact our support team
                </Link>
                {' '}or review our{' '}
                <Link href="/support/privacy-policy" className="text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DeleteAccountPage() {
  return (
    <ColorSchemeProvider>
      <DeleteAccountPageContent />
    </ColorSchemeProvider>
  )
}
