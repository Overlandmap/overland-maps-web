'use client'

import { LanguageProvider, useLanguage } from '../../contexts/LanguageContext'
import { ColorSchemeProvider } from '../../contexts/ColorSchemeContext'
import NavigationBar from '../../components/NavigationBar'
import AppStoreButtons from '../../components/AppStoreButtons'

const translations = {
  en: {
    hero_subtitle: 'Your ultimate companion for overland travel. Navigate borders, plan routes, and explore the world with confidence.',
    feature_maps_title: 'Interactive Maps',
    feature_maps_desc: 'Explore detailed maps with border crossings, visa requirements, and travel conditions worldwide.',
    feature_offline_title: 'Offline Access',
    feature_offline_desc: 'Download maps and itineraries for offline use when traveling in remote areas.',
    feature_community_title: 'Community Updates',
    feature_community_desc: 'Get real-time updates from fellow travelers about border conditions and road status.',
    feature_vehicle_title: 'Vehicle Documentation',
    feature_vehicle_desc: 'Track carnet requirements, insurance, and vehicle paperwork for every country.',
    feature_climate_title: 'Climate Data',
    feature_climate_desc: 'Plan your journey with detailed climate information and seasonal recommendations.',
    feature_itineraries_title: 'Curated Itineraries',
    feature_itineraries_desc: 'Purchase professionally crafted routes with detailed waypoints, offroading difficulty and background information.',
    cta_title: 'Start Your Adventure Today',
    cta_subtitle: 'Join thousands of overlanders exploring the world with Overland Map'
  },
  fr: {
    hero_subtitle: "Un couteau suisse pour préparer vos voyages à travers le monde. Installez l'app mobile et découvrez quelles frontières sont ouvertes, planifiez vos itinéraires et explorez le monde en toute confiance.",
    feature_maps_title: 'Cartes interactives',
    feature_maps_desc: 'Explorez la carte du monde et retrouvez des détails sur les passages de frontière, les exigences de visa et les conditions de voyage pour votre voyage au long cours.',
    feature_offline_title: 'Accès hors ligne',
    feature_offline_desc: 'Téléchargez des cartes et des itinéraires pour une utilisation sans internet lors de vos voyages dans des zones reculées.',
    feature_community_title: 'Communauté de voyageurs',
    feature_community_desc: "Recevez des mises à jour de la part d'autres voyageurs sur les conditions aux frontières ou l'état des routes.",
    feature_vehicle_title: 'Formalités pour le véhicule',
    feature_vehicle_desc: "Retrouvez les exigences de carnet de passage, d'assurance et de permis pour passer les frontières avec un véhicule.",
    feature_climate_title: 'Données climatiques',
    feature_climate_desc: 'Planifiez votre voyage avec des informations climatiques détaillées et des recommandations saisonnières.',
    feature_itineraries_title: 'Itinéraires détaillés',
    feature_itineraries_desc: "Achetez des itinéraires hors piste ou sur route avec des points de passage détaillés, de nombreux points d'intérêt et des articles de fond.",
    cta_title: 'Votre aventure commence ici',
    cta_subtitle: 'Rejoignez des milliers de voyageurs en 4x4, van, moto, camion ou vélo qui explorent le monde avec Overland Map'
  }
}

function AppPageContent() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en

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
            {t.hero_subtitle}
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
                {t.feature_maps_title}
              </h3>
              <p className="text-gray-600">
                {t.feature_maps_desc}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🛰️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t.feature_offline_title}
              </h3>
              <p className="text-gray-600">
                {t.feature_offline_desc}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t.feature_community_title}
              </h3>
              <p className="text-gray-600">
                {t.feature_community_desc}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t.feature_vehicle_title}
              </h3>
              <p className="text-gray-600">
                {t.feature_vehicle_desc}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🌡️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t.feature_climate_title}
              </h3>
              <p className="text-gray-600">
                {t.feature_climate_desc}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🛣️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t.feature_itineraries_title}
              </h3>
              <p className="text-gray-600">
                {t.feature_itineraries_desc}
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-blue-600 rounded-2xl shadow-xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.cta_title}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t.cta_subtitle}
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
