'use client'

import Link from 'next/link'
import { ColorSchemeProvider } from '../../../contexts/ColorSchemeContext'
import { LanguageProvider } from '../../../contexts/LanguageContext'
import NavigationBar from '../../../components/NavigationBar'

function ContactPageContent() {
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
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Get in touch with the Overland Map team
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Email Support
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <span className="font-semibold">General Inquiries:</span>{' '}
                  <a href="mailto:info@overlandmap.ch" className="text-blue-600 hover:text-blue-700 underline">
                    info@overlandmap.ch
                  </a>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Technical Support:</span>{' '}
                  <a href="mailto:support@overlandmap.ch" className="text-blue-600 hover:text-blue-700 underline">
                    support@overlandmap.ch
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Response Time
              </h2>
              <p className="text-gray-700">
                We typically respond to inquiries within 24-48 hours during business days.
                For urgent matters related to border crossings or travel safety, please use
                the mobile app&apos;s community features for real-time updates from fellow travelers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Before You Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                To help us assist you more quickly, please:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Check our <Link href="/faq" className="text-blue-600 hover:text-blue-700 underline">FAQ page</Link> for common questions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Include your device type and app version (if applicable)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Describe the issue in detail with steps to reproduce</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Attach screenshots if relevant</span>
                </li>
              </ul>
            </section>

            <section className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Community Support
              </h3>
              <p className="text-gray-700">
                For questions about specific routes, border crossings, or travel tips,
                our mobile app community is often the fastest way to get answers from
                experienced overlanders who have recently traveled in your area of interest.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ContactPage() {
  return (
    <LanguageProvider>
      <ColorSchemeProvider>
        <ContactPageContent />
      </ColorSchemeProvider>
    </LanguageProvider>
  )
}
