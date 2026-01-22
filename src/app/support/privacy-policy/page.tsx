'use client'

import Link from 'next/link'
import { useLanguage } from '../../../contexts/LanguageContext'
import NavigationBar from '../../../components/NavigationBar'

const translations = {
  en: {
    back_to_support: 'Back to Support',
    title: 'Privacy Policy',
    last_updated: 'Last Updated: January 22, 2026',
    intro_title: 'Introduction',
    intro_text: 'This Privacy Policy explains how we collect, use, and protect your personal information when you use our application. We are committed to ensuring the privacy and security of your data.',
    
    info_collect_title: 'Information We Collect',
    info_collect_intro: 'We collect only the minimum information necessary to provide you with our services:',
    info_collect_items: [
      'Email address (for account creation and authentication)',
      'Display name (chosen by you, shown publicly with your reviews)',
      'Purchase history (for itinerary pack purchases)',
      'Location data (only when you explicitly use location-based features)'
    ],
    
    reviews_title: 'User Reviews and Comments',
    reviews_intro: 'When you write reviews or comments in our application:',
    reviews_items: [
      'Only your chosen display name will be shown publicly',
      'Your email address is never displayed or shared',
      'Your display name can be changed at any time through your account settings',
      'Reviews and comments will remain under your display name even if you delete your account, but won\'t be associated to your e-mail anymore'
    ],
    
    third_party_title: 'Third-Party Services',
    mapbox_title: 'Mapbox Services',
    mapbox_intro: 'Our application uses Mapbox for mapping services. As part of this integration:',
    mapbox_items: [
      'Mapbox may collect location data and device information',
      'This data is subject to Mapbox\'s Privacy Policy',
      'We do not have access to or control over Mapbox\'s data collection'
    ],
    
    location_title: 'Location Services',
    location_intro: 'Location services are used to:',
    location_items: [
      'Show your current position on the map',
      'Provide location-based features and recommendations',
      'Improve map accuracy and user experience'
    ],
    location_control_title: 'To control location services:',
    location_control_items: [
      'During first app launch, you\'ll be asked to authorize location access "While Using the App"',
      'You can later modify this setting in your device\'s Settings > Privacy > Location Services'
    ],
    location_notes_title: 'Important notes about location services:',
    location_notes_items: [
      'Location data is only collected when you actively use the app',
      'We do not track or store your location history',
      'You can disable location services at any time through your device settings'
    ],
    
    how_use_title: 'How We Use Your Information',
    how_use_intro: 'Your information is used exclusively for:',
    how_use_items: [
      'Account creation and management',
      'Authentication and security',
      'Processing your itinerary pack purchases',
      'Communicating essential service-related information'
    ],
    
    security_title: 'Data Storage and Security',
    security_items: [
      'Your data is stored securely using industry-standard encryption',
      'We implement appropriate technical and organizational measures to protect your information',
      'Access to personal data is restricted to authorized personnel only'
    ],
    
    sharing_title: 'Third-Party Sharing',
    sharing_text: 'We do not share, sell, rent, or trade your personal information with any third parties. Your data remains strictly within our application\'s ecosystem. The only exception is the location data collected by Mapbox as described in the "Third-Party Services" section.',
    
    retention_title: 'Data Retention',
    retention_intro: 'We retain your personal information only for as long as necessary to:',
    retention_items: [
      'Provide you with our services',
      'Comply with legal obligations',
      'Resolve disputes and enforce our agreements'
    ],
    
    rights_title: 'Your Rights',
    rights_intro: 'You have the right to:',
    rights_items: [
      'Access your personal data',
      'Correct inaccurate information',
      'Request deletion of your account and data',
      'Object to data processing',
      'Export your data'
    ],
    
    changes_personal_title: 'Changes to Personal Information',
    changes_personal_text: 'You can review and update your personal information at any time through your account settings in the application.',
    
    deletion_title: 'Account Deletion',
    deletion_intro: 'If you choose to delete your account:',
    deletion_items: [
      'All your personal information will be permanently deleted',
      'Your reviews and comments will remain but will no longer be associated with your email',
      'This action cannot be undone',
      'You can request account deletion through the app settings or by contacting us'
    ],
    
    updates_title: 'Updates to Privacy Policy',
    updates_text: 'We may update this Privacy Policy occasionally. Users will be notified of any material changes via email or through the application.',
    
    contact_title: 'Contact Information',
    contact_intro: 'If you have questions about this Privacy Policy or your personal data, please contact us at:',
    contact_email: 'privacy@overlandmap.ch',
    
    law_title: 'Governing Law',
    law_text: 'This Privacy Policy is governed by and construed in accordance with applicable data protection laws.'
  },
  fr: {
    back_to_support: 'Retour au Support',
    title: 'Politique de Confidentialité',
    last_updated: 'Dernière mise à jour : 22 janvier 2026',
    intro_title: 'Introduction',
    intro_text: 'Cette Politique de Confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre application. Nous nous engageons à garantir la confidentialité et la sécurité de vos données.',
    
    info_collect_title: 'Informations que nous collectons',
    info_collect_intro: 'Nous collectons uniquement les informations minimales nécessaires pour vous fournir nos services :',
    info_collect_items: [
      'Adresse e-mail (pour la création et l\'authentification du compte)',
      'Pseudo (choisi par vous, affiché publiquement avec vos avis)',
      'Historique d\'achats (pour les achats de packs d\'itinéraires)',
      'Données de localisation (uniquement lorsque vous utilisez explicitement des fonctionnalités basées sur la localisation)'
    ],
    
    reviews_title: 'Avis et commentaires',
    reviews_intro: 'Lorsque vous rédigez des avis ou des commentaires dans notre application :',
    reviews_items: [
      'Seul votre pseudo choisi sera affiché publiquement',
      'Votre adresse e-mail n\'est jamais affichée ni partagée',
      'Votre pseudo peut être modifié à tout moment dans les paramètres de votre compte',
      'Si vous supprimez votre compte, vos avis et commentaires resteront mais ne seront plus liés à votre adresse e-mail'
    ],
    
    third_party_title: 'Services Tiers',
    mapbox_title: 'Services Mapbox',
    mapbox_intro: 'Notre application utilise Mapbox pour les services de cartographie. Dans le cadre de cette intégration :',
    mapbox_items: [
      'Mapbox peut collecter des données de localisation et des informations sur l\'appareil',
      'Ces données sont soumises à la Politique de Confidentialité de Mapbox',
      'Nous n\'avons pas accès ni contrôle sur la collecte de données de Mapbox'
    ],
    
    location_title: 'Services de Localisation',
    location_intro: 'Les services de localisation sont utilisés pour :',
    location_items: [
      'Afficher votre position actuelle sur la carte',
      'Fournir des fonctionnalités et recommandations basées sur la localisation',
      'Améliorer la précision de la carte et l\'expérience utilisateur'
    ],
    location_control_title: 'Pour contrôler les services de localisation :',
    location_control_items: [
      'Lors du premier lancement de l\'application, il vous sera demandé d\'autoriser l\'accès à la localisation "Pendant l\'utilisation de l\'app"',
      'Vous pouvez modifier ce paramètre ultérieurement dans Réglages > Confidentialité > Service de localisation de votre appareil'
    ],
    location_notes_title: 'Remarques importantes concernant les services de localisation :',
    location_notes_items: [
      'Les données de localisation ne sont collectées que lorsque vous utilisez activement l\'application',
      'Nous ne suivons ni ne stockons votre historique de localisation',
      'Vous pouvez désactiver les services de localisation à tout moment via les paramètres de votre appareil'
    ],
    
    how_use_title: 'Utilisation de vos informations',
    how_use_intro: 'Vos informations sont utilisées exclusivement pour :',
    how_use_items: [
      'La création et la gestion de compte',
      'L\'authentification et la sécurité',
      'Le traitement de vos achats de packs d\'itinéraires',
      'La communication d\'informations essentielles liées au service'
    ],
    
    security_title: 'Stockage et Sécurité des Données',
    security_items: [
      'Vos données sont stockées en toute sécurité à l\'aide d\'un chiffrement standard de l\'industrie',
      'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations',
      'L\'accès aux données personnelles est limité au personnel autorisé uniquement'
    ],
    
    sharing_title: 'Partage avec des Tiers',
    sharing_text: 'Nous ne partageons, ne vendons, ne louons ni n\'échangeons vos informations personnelles avec des tiers. Vos données restent strictement dans l\'écosystème de notre application. La seule exception concerne les données de localisation collectées par Mapbox comme décrit dans la section "Services Tiers".',
    
    retention_title: 'Conservation des Données',
    retention_intro: 'Nous conservons vos informations personnelles uniquement le temps nécessaire pour :',
    retention_items: [
      'Vous fournir nos services',
      'Respecter les obligations légales',
      'Résoudre les litiges et faire respecter nos accords'
    ],
    
    rights_title: 'Vos Droits',
    rights_intro: 'Vous avez le droit de :',
    rights_items: [
      'Accéder à vos données personnelles',
      'Corriger les informations inexactes',
      'Demander la suppression de votre compte et de vos données',
      'Vous opposer au traitement des données',
      'Exporter vos données'
    ],
    
    changes_personal_title: 'Modification des Informations Personnelles',
    changes_personal_text: 'Vous pouvez consulter et mettre à jour vos informations personnelles à tout moment via les paramètres de votre compte dans l\'application.',
    
    deletion_title: 'Suppression de Compte',
    deletion_intro: 'Si vous choisissez de supprimer votre compte :',
    deletion_items: [
      'Toutes vos informations personnelles seront définitivement supprimées',
      'Vos avis et commentaires resteront mais ne seront plus associés à votre e-mail',
      'Cette action ne peut pas être annulée',
      'Vous pouvez demander la suppression du compte via les paramètres de l\'application ou en nous contactant'
    ],
    
    updates_title: 'Mises à Jour de la Politique de Confidentialité',
    updates_text: 'Nous pouvons occasionnellement mettre à jour cette Politique de Confidentialité. Les utilisateurs seront informés de tout changement important par e-mail ou via l\'application.',
    
    contact_title: 'Informations de Contact',
    contact_intro: 'Si vous avez des questions concernant cette Politique de Confidentialité ou vos données personnelles, veuillez nous contacter à :',
    contact_email: 'privacy@overlandmap.ch',
    
    law_title: 'Loi Applicable',
    law_text: 'Cette Politique de Confidentialité est régie et interprétée conformément aux lois applicables en matière de protection des données.'
  }
}

function PrivacyPolicyPageContent() {
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
          <p className="text-sm text-gray-500 mb-8">
            {t.last_updated}
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.intro_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.intro_text}
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.info_collect_title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t.info_collect_intro}
              </p>
              <ul className="space-y-2 text-gray-700">
                {t.info_collect_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* User Reviews and Comments */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t.reviews_title}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t.reviews_intro}
              </p>
              <ul className="space-y-2 text-gray-700">
                {t.reviews_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.third_party_title}
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t.mapbox_title}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t.mapbox_intro}
              </p>
              <ul className="space-y-2 text-gray-700 mb-6">
                {t.mapbox_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t.location_title}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t.location_intro}
              </p>
              <ul className="space-y-2 text-gray-700 mb-4">
                {t.location_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-gray-700 font-semibold mb-2">
                {t.location_control_title}
              </p>
              <ul className="space-y-2 text-gray-700 mb-4">
                {t.location_control_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-gray-700 font-semibold mb-2">
                {t.location_notes_title}
              </p>
              <ul className="space-y-2 text-gray-700">
                {t.location_notes_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.how_use_title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t.how_use_intro}
              </p>
              <ul className="space-y-2 text-gray-700">
                {t.how_use_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Data Storage and Security */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.security_title}
              </h2>
              <ul className="space-y-2 text-gray-700">
                {t.security_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Third-Party Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.sharing_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.sharing_text}
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.retention_title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t.retention_intro}
              </p>
              <ul className="space-y-2 text-gray-700">
                {t.retention_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.rights_title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t.rights_intro}
              </p>
              <ul className="space-y-2 text-gray-700">
                {t.rights_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Changes to Personal Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.changes_personal_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.changes_personal_text}
              </p>
            </section>

            {/* Account Deletion */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.deletion_title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t.deletion_intro}
              </p>
              <ul className="space-y-2 text-gray-700">
                {t.deletion_items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Updates to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.updates_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.updates_text}
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.contact_title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                {t.contact_intro}
              </p>
              <p className="text-gray-700">
                <a href={`mailto:${t.contact_email}`} className="text-blue-600 hover:text-blue-700 underline">
                  {t.contact_email}
                </a>
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.law_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.law_text}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageContent />
}
