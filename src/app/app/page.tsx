'use client'

import { LanguageProvider } from '../../contexts/LanguageContext'
import { ColorSchemeProvider } from '../../contexts/ColorSchemeContext'
import NavigationBar from '../../components/NavigationBar'
import AppStoreButtons from '../../components/AppStoreButtons'

function AppPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <NavigationBar currentSection="app" />
      
      <main className="px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Overland Map
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Your ultimate companion for overland travel. Navigate borders, plan routes, and explore the world with confidence.
          </p>
          <div className="flex justify-center mb-12">
            <AppStoreButtons size="large" layout="compact" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Interactive Maps
              </h3>
              <p className="text-gray-600">
                Explore detailed maps with border crossings, visa requirements, and travel conditions worldwide.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Offline Access
              </h3>
              <p className="text-gray-600">
                Download maps and itineraries for offline use when traveling in remote areas.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Community Updates
              </h3>
              <p className="text-gray-600">
                Get real-time updates from fellow travelers about border conditions and road status.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Vehicle Documentation
              </h3>
              <p className="text-gray-600">
                Track carnet requirements, insurance, and vehicle paperwork for every country.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🌡️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Climate Data
              </h3>
              <p className="text-gray-600">
                Plan your journey with detailed climate information and seasonal recommendations.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🛣️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Curated Itineraries
              </h3>
              <p className="text-gray-600">
                Access professionally crafted routes with waypoints, camping spots, and highlights.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-blue-600 rounded-2xl shadow-xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your Adventure Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of overlanders exploring the world with Overland Map
            </p>
            <div className="flex justify-center">
              <AppStoreButtons size="large" layout="compact" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AppPage() {
  return (
    <LanguageProvider>
      <ColorSchemeProvider>
        <AppPageContent />
      </ColorSchemeProvider>
    </LanguageProvider>
  )
}
