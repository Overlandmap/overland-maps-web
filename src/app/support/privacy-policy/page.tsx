'use client'

import Link from 'next/link'
import { useLanguage } from '../../../contexts/LanguageContext'
import NavigationBar from '../../../components/NavigationBar'

const translations = {
  en: {
    back_to_support: 'Back to Support',
    title: 'Privacy Policy',
    last_updated: 'Last updated: January 2026',
    intro_title: 'Introduction',
    intro_text: 'At Overland Map, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and mobile applications.',
    info_collect_title: 'Information We Collect',
    account_info: 'Account Information',
    account_desc: 'When you create an account, we collect your email address and chosen username.',
    usage_data: 'Usage Data',
    usage_desc: 'We collect information about how you use our services, including pages visited, features used, and interaction patterns.',
    location_data: 'Location Data',
    location_desc: 'With your permission, we may collect location data to provide location-based features and improve our services.',
    user_content: 'User-Generated Content',
    user_content_desc: 'Comments, reviews, and updates you share about border crossings and travel experiences.',
    how_use_title: 'How We Use Your Information',
    use_1: 'To provide and improve our services',
    use_2: 'To personalize your experience',
    use_3: 'To communicate with you about updates and features',
    use_4: 'To ensure security and prevent fraud',
    use_5: 'To comply with legal obligations',
    sharing_title: 'Data Sharing and Disclosure',
    sharing_intro: 'We do not sell your personal information. We may share your information only in the following circumstances:',
    share_1: 'With your consent',
    share_2: 'With service providers who assist in operating our platform',
    share_3: 'When required by law or to protect our rights',
    share_4: 'In connection with a business transfer or acquisition',
    rights_title: 'Your Rights',
    rights_intro: 'You have the right to:',
    right_1: 'Access your personal data',
    right_2: 'Correct inaccurate data',
    right_3: 'Request deletion of your data',
    right_4: 'Object to processing of your data',
    right_5: 'Export your data',
    security_title: 'Data Security',
    security_text: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
    cookies_title: 'Cookies and Tracking',
    cookies_text: 'We use essential cookies and local storage to improve your experience and remember your preferences (such as language settings). We do not use tracking cookies or collect personal data for advertising purposes.',
    children_title: 'Children\'s Privacy',
    children_text: 'Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us.',
    changes_title: 'Changes to This Policy',
    changes_text: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
    contact_title: 'Contact Us',
    contact_text: 'If you have questions about this Privacy Policy, please contact us at'
  },
  fr: {
    back_to_support: 'Retour au Support',
    title: 'Politique de Confidentialité',
    last_updated: 'Dernière mise à jour : Janvier 2026',
    intro_title: 'Introduction',
    intro_text: 'Chez Overland Map, nous prenons votre vie privée au sérieux. Cette Politique de Confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre site web et nos applications mobiles.',
    info_collect_title: 'Informations que Nous Collectons',
    account_info: 'Informations de Compte',
    account_desc: 'Lorsque vous créez un compte, nous collectons votre adresse e-mail et le nom d\'utilisateur choisi.',
    usage_data: 'Données d\'Utilisation',
    usage_desc: 'Nous collectons des informations sur la façon dont vous utilisez nos services, y compris les pages visitées, les fonctionnalités utilisées et les modèles d\'interaction.',
    location_data: 'Données de Localisation',
    location_desc: 'Avec votre permission, nous pouvons collecter des données de localisation pour fournir des fonctionnalités basées sur la localisation et améliorer nos services.',
    user_content: 'Contenu Généré par l\'Utilisateur',
    user_content_desc: 'Commentaires, avis et mises à jour que vous partagez sur les passages frontaliers et les expériences de voyage.',
    how_use_title: 'Comment Nous Utilisons Vos Informations',
    use_1: 'Pour fournir et améliorer nos services',
    use_2: 'Pour personnaliser votre expérience',
    use_3: 'Pour communiquer avec vous sur les mises à jour et les fonctionnalités',
    use_4: 'Pour assurer la sécurité et prévenir la fraude',
    use_5: 'Pour respecter les obligations légales',
    sharing_title: 'Partage et Divulgation des Données',
    sharing_intro: 'Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos informations uniquement dans les circonstances suivantes :',
    share_1: 'Avec votre consentement',
    share_2: 'Avec des prestataires de services qui nous aident à exploiter notre plateforme',
    share_3: 'Lorsque requis par la loi ou pour protéger nos droits',
    share_4: 'Dans le cadre d\'un transfert ou d\'une acquisition d\'entreprise',
    rights_title: 'Vos Droits',
    rights_intro: 'Vous avez le droit de :',
    right_1: 'Accéder à vos données personnelles',
    right_2: 'Corriger les données inexactes',
    right_3: 'Demander la suppression de vos données',
    right_4: 'Vous opposer au traitement de vos données',
    right_5: 'Exporter vos données',
    security_title: 'Sécurité des Données',
    security_text: 'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l\'accès non autorisé, la modification, la divulgation ou la destruction. Cependant, aucune méthode de transmission sur Internet n\'est sécurisée à 100%.',
    cookies_title: 'Cookies et Suivi',
    cookies_text: 'Nous utilisons des cookies essentiels et le stockage local pour améliorer votre expérience et mémoriser vos préférences (telles que les paramètres de langue). Nous n\'utilisons pas de cookies de suivi ni ne collectons de données personnelles à des fins publicitaires.',
    children_title: 'Confidentialité des Enfants',
    children_text: 'Nos services ne sont pas destinés aux enfants de moins de 13 ans. Nous ne collectons pas sciemment d\'informations personnelles auprès d\'enfants de moins de 13 ans. Si vous pensez que nous avons collecté de telles informations, veuillez nous contacter.',
    changes_title: 'Modifications de Cette Politique',
    changes_text: 'Nous pouvons mettre à jour cette Politique de Confidentialité de temps en temps. Nous vous informerons de tout changement en publiant la nouvelle Politique de Confidentialité sur cette page et en mettant à jour la date de "Dernière mise à jour".',
    contact_title: 'Contactez-Nous',
    contact_text: 'Si vous avez des questions sur cette Politique de Confidentialité, veuillez nous contacter à'
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
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.intro_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.intro_text}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.info_collect_title}
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">{t.account_info}</h3>
                  <p>{t.account_desc}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t.usage_data}</h3>
                  <p>{t.usage_desc}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t.location_data}</h3>
                  <p>{t.location_desc}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t.user_content}</h3>
                  <p>{t.user_content_desc}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.how_use_title}
              </h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.use_1}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.use_2}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.use_3}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.use_4}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.use_5}</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.sharing_title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t.sharing_intro}
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.share_1}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.share_2}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.share_3}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.share_4}</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.rights_title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t.rights_intro}
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.right_1}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.right_2}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.right_3}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.right_4}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.right_5}</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.security_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.security_text}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.cookies_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.cookies_text}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.children_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.children_text}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.changes_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.changes_text}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.contact_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.contact_text}{' '}
                <a href="mailto:privacy@overlandmap.ch" className="text-blue-600 hover:text-blue-700 underline">
                  privacy@overlandmap.ch
                </a>
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
