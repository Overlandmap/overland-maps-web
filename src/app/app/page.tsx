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
            Un couteau suisse pour préparer vos voyages à travers le monde. Installez l'app mobile et découvrez quelles frontières sont ouvertes, planifiez vos itinéraires et explorez le monde en toute confiance.
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
                Cartes interactives
              </h3>
              <p className="text-gray-600">
                Explorez la carte du monde et retrouvez des détails sur les passages de frontière, les exigences de visa et les conditions de voyage pour votre voyage au long cours.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Accès hors ligne
              </h3>
              <p className="text-gray-600">
                Téléchargez des cartes et des itinéraires pour une utilisation sans internet lors de vos voyages dans des zones reculées.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Communauté de voyageurs
              </h3>
              <p className="text-gray-600">
                Recevez des mises à jour de la part d'autres voyageurs sur les conditions aux frontières ou l'état des routes.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Documents pour le véhicule
              </h3>
              <p className="text-gray-600">
                Retrouvez les exigences de carnet de passage, d'assurance et de permis pour passer les frontières avec un véhicule.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🌡️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Données climatiques
              </h3>
              <p className="text-gray-600">
                Planifiez votre voyage avec des informations climatiques détaillées et des recommandations saisonnières.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🛣️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Itinéraires détaillés
              </h3>
              <p className="text-gray-600">
                Achetez des itinéraires hors piste ou sur route avec des points de passage détaillés, de nombreux points d'intérêt et des articles de fond.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-blue-600 rounded-2xl shadow-xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Commencez Votre Aventure Aujourd'hui
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez des milliers de voyageurs en 4x4, van, moto, camion ou vélo qui explorent le monde avec Overland Map
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
