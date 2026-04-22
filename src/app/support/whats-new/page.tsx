'use client'

import Link from 'next/link'
import { useLanguage } from '../../../contexts/LanguageContext'
import NavigationBar from '../../../components/NavigationBar'

const translations = {
  en: {
    back_to_support: 'Back to Support',
    title: "What's New",
    subtitle: 'Latest updates and improvements to Overland Map',
    version: 'Version',
    released: 'Released',
    latest: 'Latest',
    new_features: '✨ New Features',
    improvements: '🔧 Improvements',
    bug_fixes: '🐛 Bug Fixes',
    stay_updated: 'Stay Updated',
    stay_desc: 'Download the mobile app to receive notifications about new features and updates.'
  },
  de: {
    back_to_support: 'Zurück zum Support',
    title: 'Was ist Neu',
    subtitle: 'Neueste Updates und Verbesserungen von Overland Map',
    version: 'Version',
    released: 'Veröffentlicht',
    latest: 'Neueste',
    new_features: '✨ Neue Funktionen',
    improvements: '🔧 Verbesserungen',
    bug_fixes: '🐛 Fehlerbehebungen',
    stay_updated: 'Bleiben Sie Auf dem Laufenden',
    stay_desc: 'Laden Sie die mobile App herunter, um Benachrichtigungen über neue Funktionen und Updates zu erhalten.'
  },
  es: {
    back_to_support: 'Volver a Soporte',
    title: 'Novedades',
    subtitle: 'Últimas actualizaciones y mejoras de Overland Map',
    version: 'Versión',
    released: 'Publicado',
    latest: 'Última',
    new_features: '✨ Nuevas Funciones',
    improvements: '🔧 Mejoras',
    bug_fixes: '🐛 Correcciones de Errores',
    stay_updated: 'Mantente Actualizado',
    stay_desc: 'Descarga la aplicación móvil para recibir notificaciones sobre nuevas funciones y actualizaciones.'
  },
  fr: {
    back_to_support: 'Retour au Support',
    title: 'Nouveautés',
    subtitle: 'Dernières mises à jour et améliorations d\'Overland Map',
    version: 'Version',
    released: 'Publié',
    latest: 'Dernière',
    new_features: '✨ Nouvelles Fonctionnalités',
    improvements: '🔧 Améliorations',
    bug_fixes: '🐛 Corrections de Bugs',
    stay_updated: 'Restez Informé',
    stay_desc: 'Téléchargez l\'application mobile pour recevoir des notifications sur les nouvelles fonctionnalités et mises à jour.'
  },
  it: {
    back_to_support: 'Torna al Supporto',
    title: 'Novità',
    subtitle: 'Ultimi aggiornamenti e miglioramenti di Overland Map',
    version: 'Versione',
    released: 'Rilasciato',
    latest: 'Ultima',
    new_features: '✨ Nuove Funzionalità',
    improvements: '🔧 Miglioramenti',
    bug_fixes: '🐛 Correzioni di Bug',
    stay_updated: 'Rimani Aggiornato',
    stay_desc: 'Scarica l\'app mobile per ricevere notifiche su nuove funzionalità e aggiornamenti.'
  },
  nl: {
    back_to_support: 'Terug naar Ondersteuning',
    title: 'Wat is Nieuw',
    subtitle: 'Laatste updates en verbeteringen van Overland Map',
    version: 'Versie',
    released: 'Uitgebracht',
    latest: 'Nieuwste',
    new_features: '✨ Nieuwe Functies',
    improvements: '🔧 Verbeteringen',
    bug_fixes: '🐛 Bugfixes',
    stay_updated: 'Blijf Op de Hoogte',
    stay_desc: 'Download de mobiele app om meldingen te ontvangen over nieuwe functies en updates.'
  },
  ru: {
    back_to_support: 'Назад в Поддержку',
    title: 'Что Нового',
    subtitle: 'Последние обновления и улучшения Overland Map',
    version: 'Версия',
    released: 'Выпущено',
    latest: 'Последняя',
    new_features: '✨ Новые Функции',
    improvements: '🔧 Улучшения',
    bug_fixes: '🐛 Исправления Ошибок',
    stay_updated: 'Будьте в Курсе',
    stay_desc: 'Загрузите мобильное приложение, чтобы получать уведомления о новых функциях и обновлениях.'
  }
}

function WhatsNewPageContent() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentSection="support" />
      
      <main className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <Link href="/support" className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.back_to_support}
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 mt-4">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {t.subtitle}
          </p>

          <div className="space-y-6">
            {/* Version 2.0.1 */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {t.version} 2.0.1
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{t.released} February 2026</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {t.latest}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t.new_features}</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>New overland information for all countries, in free access for everyone, with companion website</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Extensive collaboration features. Post corrections and suggest new data, start a discussion with other overlanders</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>New PRO features (available with every purchase of a pack): Historic climate data and weather forecast on every itinerary</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Polished UI</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Bug fixes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 1.5.0 */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {t.version} 1.5.0
                </h2>
                <p className="text-sm text-gray-500 mt-1">{t.released} November 2025</p>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t.new_features}</h3>
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
              {t.stay_updated}
            </h2>
            <p className="text-gray-700 mb-4">
              {t.stay_desc}
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
