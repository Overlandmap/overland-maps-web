'use client'

import Link from 'next/link'
import { useLanguage } from '../../contexts/LanguageContext'
import NavigationBar from '../../components/NavigationBar'

const translations = {
  en: {
    title: 'Support',
    subtitle: "We're here to help you get the most out of Overland Map",
    contact_title: 'Contact',
    contact_desc: 'Get in touch with our support team for help with technical issues or general inquiries.',
    whats_new_title: "What's New",
    whats_new_desc: 'Check out the latest features, updates, and improvements to Overland Map.',
    privacy_title: 'Privacy Policy',
    privacy_desc: 'Learn how we protect your data and respect your privacy.',
    delete_account_title: 'Delete Account',
    delete_account_desc: 'Request to permanently delete your account and associated data.',
    need_more_help: 'Need More Help?',
    before_contacting: 'Before contacting support, you might find your answer in our',
    faq_section: 'FAQ section',
    fastest_response: 'For the fastest response, use the mobile app to report issues or ask questions directly to the community.',
    reach_via_email: 'You can also reach us via email at'
  },
  de: {
    title: 'Support',
    subtitle: 'Wir sind hier, um Ihnen zu helfen, das Beste aus Overland Map herauszuholen',
    contact_title: 'Kontakt',
    contact_desc: 'Kontaktieren Sie unser Support-Team für Hilfe bei technischen Problemen oder allgemeinen Anfragen.',
    whats_new_title: 'Neuigkeiten',
    whats_new_desc: 'Entdecken Sie die neuesten Funktionen, Updates und Verbesserungen von Overland Map.',
    privacy_title: 'Datenschutzrichtlinie',
    privacy_desc: 'Erfahren Sie, wie wir Ihre Daten schützen und Ihre Privatsphäre respektieren.',
    delete_account_title: 'Konto löschen',
    delete_account_desc: 'Beantragen Sie die dauerhafte Löschung Ihres Kontos und der zugehörigen Daten.',
    need_more_help: 'Benötigen Sie weitere Hilfe?',
    before_contacting: 'Bevor Sie den Support kontaktieren, finden Sie möglicherweise Ihre Antwort in unserem',
    faq_section: 'FAQ-Bereich',
    fastest_response: 'Für die schnellste Antwort verwenden Sie die mobile App, um Probleme zu melden oder Fragen direkt an die Community zu stellen.',
    reach_via_email: 'Sie können uns auch per E-Mail erreichen unter'
  },
  es: {
    title: 'Soporte',
    subtitle: 'Estamos aquí para ayudarte a aprovechar al máximo Overland Map',
    contact_title: 'Contacto',
    contact_desc: 'Ponte en contacto con nuestro equipo de soporte para obtener ayuda con problemas técnicos o consultas generales.',
    whats_new_title: 'Novedades',
    whats_new_desc: 'Descubre las últimas funciones, actualizaciones y mejoras de Overland Map.',
    privacy_title: 'Política de Privacidad',
    privacy_desc: 'Aprende cómo protegemos tus datos y respetamos tu privacidad.',
    delete_account_title: 'Eliminar Cuenta',
    delete_account_desc: 'Solicita la eliminación permanente de tu cuenta y los datos asociados.',
    need_more_help: '¿Necesitas más ayuda?',
    before_contacting: 'Antes de contactar con el soporte, podrías encontrar tu respuesta en nuestra',
    faq_section: 'sección de preguntas frecuentes',
    fastest_response: 'Para obtener la respuesta más rápida, usa la aplicación móvil para reportar problemas o hacer preguntas directamente a la comunidad.',
    reach_via_email: 'También puedes contactarnos por correo electrónico en'
  },
  fr: {
    title: 'Support',
    subtitle: 'Nous sommes là pour vous aider à tirer le meilleur parti d\'Overland Map',
    contact_title: 'Contact',
    contact_desc: 'Contactez notre équipe d\'assistance pour obtenir de l\'aide sur des problèmes techniques ou des questions générales.',
    whats_new_title: 'Nouveautés',
    whats_new_desc: 'Découvrez les dernières fonctionnalités, mises à jour et améliorations d\'Overland Map.',
    privacy_title: 'Politique de Confidentialité',
    privacy_desc: 'Découvrez comment nous protégeons vos données et respectons votre vie privée.',
    delete_account_title: 'Supprimer le Compte',
    delete_account_desc: 'Demandez la suppression permanente de votre compte et des données associées.',
    need_more_help: 'Besoin d\'Aide Supplémentaire ?',
    before_contacting: 'Avant de contacter le support, vous pourriez trouver votre réponse dans notre',
    faq_section: 'section FAQ',
    fastest_response: 'Pour une réponse plus rapide, utilisez l\'application mobile pour signaler des problèmes ou poser des questions directement à la communauté.',
    reach_via_email: 'Vous pouvez également nous contacter par e-mail à'
  },
  it: {
    title: 'Supporto',
    subtitle: 'Siamo qui per aiutarti a ottenere il massimo da Overland Map',
    contact_title: 'Contatto',
    contact_desc: 'Contatta il nostro team di supporto per aiuto con problemi tecnici o domande generali.',
    whats_new_title: 'Novità',
    whats_new_desc: 'Scopri le ultime funzionalità, aggiornamenti e miglioramenti di Overland Map.',
    privacy_title: 'Informativa sulla Privacy',
    privacy_desc: 'Scopri come proteggiamo i tuoi dati e rispettiamo la tua privacy.',
    delete_account_title: 'Elimina Account',
    delete_account_desc: 'Richiedi l\'eliminazione permanente del tuo account e dei dati associati.',
    need_more_help: 'Hai bisogno di ulteriore aiuto?',
    before_contacting: 'Prima di contattare il supporto, potresti trovare la tua risposta nella nostra',
    faq_section: 'sezione FAQ',
    fastest_response: 'Per la risposta più veloce, usa l\'app mobile per segnalare problemi o fare domande direttamente alla comunità.',
    reach_via_email: 'Puoi anche contattarci via email a'
  },
  nl: {
    title: 'Ondersteuning',
    subtitle: 'We zijn er om je te helpen het meeste uit Overland Map te halen',
    contact_title: 'Contact',
    contact_desc: 'Neem contact op met ons ondersteuningsteam voor hulp bij technische problemen of algemene vragen.',
    whats_new_title: 'Wat is er nieuw',
    whats_new_desc: 'Bekijk de nieuwste functies, updates en verbeteringen van Overland Map.',
    privacy_title: 'Privacybeleid',
    privacy_desc: 'Leer hoe we je gegevens beschermen en je privacy respecteren.',
    delete_account_title: 'Account verwijderen',
    delete_account_desc: 'Vraag de permanente verwijdering van je account en bijbehorende gegevens aan.',
    need_more_help: 'Meer hulp nodig?',
    before_contacting: 'Voordat je contact opneemt met de ondersteuning, vind je misschien je antwoord in onze',
    faq_section: 'FAQ-sectie',
    fastest_response: 'Voor het snelste antwoord, gebruik de mobiele app om problemen te melden of vragen direct aan de gemeenschap te stellen.',
    reach_via_email: 'Je kunt ons ook bereiken via e-mail op'
  },
  ru: {
    title: 'Поддержка',
    subtitle: 'Мы здесь, чтобы помочь вам получить максимум от Overland Map',
    contact_title: 'Контакт',
    contact_desc: 'Свяжитесь с нашей службой поддержки для помощи с техническими проблемами или общими вопросами.',
    whats_new_title: 'Что нового',
    whats_new_desc: 'Ознакомьтесь с последними функциями, обновлениями и улучшениями Overland Map.',
    privacy_title: 'Политика конфиденциальности',
    privacy_desc: 'Узнайте, как мы защищаем ваши данные и уважаем вашу конфиденциальность.',
    delete_account_title: 'Удалить аккаунт',
    delete_account_desc: 'Запросите постоянное удаление вашей учетной записи и связанных данных.',
    need_more_help: 'Нужна дополнительная помощь?',
    before_contacting: 'Прежде чем обращаться в службу поддержки, вы можете найти ответ в нашем',
    faq_section: 'разделе FAQ',
    fastest_response: 'Для самого быстрого ответа используйте мобильное приложение, чтобы сообщить о проблемах или задать вопросы непосредственно сообществу.',
    reach_via_email: 'Вы также можете связаться с нами по электронной почте'
  }
}

function SupportPageContent() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentSection="support" />
      
      <main className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 mb-12">
            {t.subtitle}
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
                    {t.contact_title}
                  </h2>
                  <p className="text-gray-600">
                    {t.contact_desc}
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
                    {t.whats_new_title}
                  </h2>
                  <p className="text-gray-600">
                    {t.whats_new_desc}
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
                    {t.privacy_title}
                  </h2>
                  <p className="text-gray-600">
                    {t.privacy_desc}
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
                    {t.delete_account_title}
                  </h2>
                  <p className="text-gray-600">
                    {t.delete_account_desc}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.need_more_help}
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                {t.before_contacting}{' '}
                <Link href="/faq" className="text-blue-600 hover:text-blue-700 underline">
                  {t.faq_section}
                </Link>
                .
              </p>
              <p>
                {t.fastest_response}
              </p>
              <p>
                {t.reach_via_email}{' '}
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
  return <SupportPageContent />
}
