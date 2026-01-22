'use client'

import Link from 'next/link'
import NavigationBar from '../../../components/NavigationBar'

function WhatsNewPageContent() {
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
            What&apos;s New
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Latest updates and improvements to Overland Map
          </p>

          <div className="space-y-6">
            {/* Version 2.1.0 */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Version 2.1.0
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Released January 2026</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Latest
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✨ New Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Added climate data visualization with monthly temperature and precipitation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>New itinerary layer with curated overland routes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Enhanced border post details with community comments</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🔧 Improvements</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Faster map loading and improved performance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Better mobile responsiveness</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Updated translations for 9 languages</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🐛 Bug Fixes</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Fixed border post status display issues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Resolved zoom button positioning on mobile</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 2.0.0 */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Version 2.0.0
                </h2>
                <p className="text-sm text-gray-500 mt-1">Released December 2025</p>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✨ New Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Complete redesign of the web interface</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Added restricted zones and special permit areas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Multi-language support for interface and content</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 1.5.0 */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Version 1.5.0
                </h2>
                <p className="text-sm text-gray-500 mt-1">Released November 2025</p>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✨ New Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Launched mobile app for iOS and Android</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Community-driven border crossing updates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Offline map downloads for premium users</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribe to Updates */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Stay Updated
            </h2>
            <p className="text-gray-700 mb-4">
              Download the mobile app to receive notifications about new features and updates.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function WhatsNewPage() {
  return <WhatsNewPageContent />
}
