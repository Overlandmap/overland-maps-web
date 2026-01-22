'use client'

import Link from 'next/link'
import { useLanguage } from '../../../contexts/LanguageContext'
import NavigationBar from '../../../components/NavigationBar'

const translations = {
  en: {
    back_to_support: 'Back to Support',
    title: 'Contact Us',
    subtitle: 'Get in touch with the Overland Map team',
    email_support: 'Email Support',
    general_inquiries: 'General Inquiries:',
    technical_support: 'Technical Support:',
    response_time: 'Response Time',
    response_desc: 'We typically respond to inquiries within 24-48 hours during business days. For urgent matters related to border crossings or travel safety, please use the mobile app\'s community features for real-time updates from fellow travelers.',
    before_contact: 'Before You Contact Us',
    help_us: 'To help us assist you more quickly, please:',
    check_faq: 'Check our',
    faq_page: 'FAQ page',
    for_common: 'for common questions',
    include_device: 'Include your device type and app version (if applicable)',
    describe_issue: 'Describe the issue in detail with steps to reproduce',
    attach_screenshots: 'Attach screenshots if relevant',
    community_support: 'Community Support',
    community_desc: 'For questions about specific routes, border crossings, or travel tips, our mobile app community is often the fastest way to get answers from experienced overlanders who have recently traveled in your area of interest.'
  },
  fr: {
    back_to_support: 'Retour au Support',
    title: 'Contactez-Nous',
    subtitle: 'Entrez en contact avec l\'équipe Overland Map',
    email_support: 'Support par E-mail',
    general_inquiries: 'Demandes Générales :',
    technical_support: 'Support Technique :',
    response_time: 'Temps de Réponse',
    response_desc: 'Nous répondons généralement aux demandes dans les 24 à 48 heures pendant les jours ouvrables. Pour les questions urgentes liées aux passages frontaliers ou à la sécurité des voyages, veuillez utiliser les fonctionnalités communautaires de l\'application mobile pour obtenir des mises à jour en temps réel de la part d\'autres voyageurs.',
    before_contact: 'Avant de Nous Contacter',
    help_us: 'Pour nous aider à vous assister plus rapidement, veuillez :',
    check_faq: 'Consultez notre',
    faq_page: 'page FAQ',
    for_common: 'pour les questions courantes',
    include_device: 'Inclure le type de votre appareil et la version de l\'application (le cas échéant)',
    describe_issue: 'Décrire le problème en détail avec les étapes pour le reproduire',
    attach_screenshots: 'Joindre des captures d\'écran si pertinent',
    community_support: 'Support Communautaire',
    community_desc: 'Pour des questions sur des itinéraires spécifiques, des passages frontaliers ou des conseils de voyage, la communauté de notre application mobile est souvent le moyen le plus rapide d\'obtenir des réponses d\'overlanders expérimentés qui ont récemment voyagé dans votre région d\'intérêt.'
  }
}

function ContactPageContent() {
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

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.email_support}
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <span className="font-semibold">{t.general_inquiries}</span>{' '}
                  <a href="mailto:info@overlandmap.ch" className="text-blue-600 hover:text-blue-700 underline">
                    info@overlandmap.ch
                  </a>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">{t.technical_support}</span>{' '}
                  <a href="mailto:support@overlandmap.ch" className="text-blue-600 hover:text-blue-700 underline">
                    support@overlandmap.ch
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.response_time}
              </h2>
              <p className="text-gray-700">
                {t.response_desc}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.before_contact}
              </h2>
              <p className="text-gray-700 mb-4">
                {t.help_us}
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.check_faq} <Link href="/faq" className="text-blue-600 hover:text-blue-700 underline">{t.faq_page}</Link> {t.for_common}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.include_device}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.describe_issue}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.attach_screenshots}</span>
                </li>
              </ul>
            </section>

            <section className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t.community_support}
              </h3>
              <p className="text-gray-700">
                {t.community_desc}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ContactPage() {
  return <ContactPageContent />
}
