'use client'

import Link from 'next/link'
import { ColorSchemeProvider } from '../../contexts/ColorSchemeContext'
import { LanguageProvider } from '../../contexts/LanguageContext'
import NavigationBar from '../../components/NavigationBar'

function SupportPageContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentSection="support" />
      
      <main className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Support
          </h1>
          <p className="text-lg text-gray-600 mb-12">
            We&apos;re here to help you get the most out of Overland Map
          </p>

          {/* Support Options Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Contact */}
            <Link
              href="/support/contact"
              className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Contact
                  </h2>
                  <p className="text-gray-600">
                    Get in touch with our support team for help with technical issues or general inquiries.
                  </p>
                </div>
              </div>
            </Link>

            {/* What's New */}
            <Link
              href="/support/whats-new"
              className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    What&apos;s New
                  </h2>
                  <p className="text-gray-600">
                    Check out the latest features, updates, and improvements to Overland Map.
                  </p>
                </div>
              </div>
            </Link>

            {/* Privacy Policy */}
            <Link
              href="/support/privacy-policy"
              className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    Privacy Policy
                  </h2>
                  <p className="text-gray-600">
                    Learn how we protect your data and respect your privacy.
                  </p>
                </div>
              </div>
            </Link>

            {/* Delete Account */}
            <Link
              href="/support/delete-account"
              className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    Delete Account
                  </h2>
                  <p className="text-gray-600">
                    Request to permanently delete your account and associated data.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Need More Help?
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Before contacting support, you might find your answer in our{' '}
                <Link href="/faq" className="text-blue-600 hover:text-blue-700 underline">
                  FAQ section
                </Link>
                .
              </p>
              <p>
                For the fastest response, use the mobile app to report issues or ask questions directly to the community.
              </p>
              <p>
                You can also reach us via email at{' '}
                <a href="mailto:support@overlandmap.ch" className="text-blue-600 hover:text-blue-700 underline">
                  support@overlandmap.ch
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SupportPage() {
  return (
    <LanguageProvider>
      <ColorSchemeProvider>
        <SupportPageContent />
      </ColorSchemeProvider>
    </LanguageProvider>
  )
}
