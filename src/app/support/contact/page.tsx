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
  de: {
    back_to_support: 'Zurück zum Support',
    title: 'Kontaktieren Sie Uns',
    subtitle: 'Nehmen Sie Kontakt mit dem Overland Map Team auf',
    email_support: 'E-Mail-Support',
    general_inquiries: 'Allgemeine Anfragen:',
    technical_support: 'Technischer Support:',
    response_time: 'Antwortzeit',
    response_desc: 'Wir antworten in der Regel innerhalb von 24-48 Stunden an Werktagen auf Anfragen. Bei dringenden Angelegenheiten im Zusammenhang mit Grenzübergängen oder Reisesicherheit nutzen Sie bitte die Community-Funktionen der mobilen App für Echtzeit-Updates von anderen Reisenden.',
    before_contact: 'Bevor Sie Uns Kontaktieren',
    help_us: 'Um uns zu helfen, Sie schneller zu unterstützen, bitte:',
    check_faq: 'Überprüfen Sie unsere',
    faq_page: 'FAQ-Seite',
    for_common: 'für häufige Fragen',
    include_device: 'Geben Sie Ihren Gerätetyp und die App-Version an (falls zutreffend)',
    describe_issue: 'Beschreiben Sie das Problem detailliert mit Schritten zur Reproduktion',
    attach_screenshots: 'Fügen Sie Screenshots bei, falls relevant',
    community_support: 'Community-Support',
    community_desc: 'Für Fragen zu bestimmten Routen, Grenzübergängen oder Reisetipps ist unsere mobile App-Community oft der schnellste Weg, um Antworten von erfahrenen Overlandern zu erhalten, die kürzlich in Ihrem Interessengebiet gereist sind.'
  },
  es: {
    back_to_support: 'Volver a Soporte',
    title: 'Contáctanos',
    subtitle: 'Ponte en contacto con el equipo de Overland Map',
    email_support: 'Soporte por Correo Electrónico',
    general_inquiries: 'Consultas Generales:',
    technical_support: 'Soporte Técnico:',
    response_time: 'Tiempo de Respuesta',
    response_desc: 'Normalmente respondemos a las consultas dentro de 24-48 horas durante los días laborables. Para asuntos urgentes relacionados con cruces fronterizos o seguridad en viajes, utilice las funciones de comunidad de la aplicación móvil para obtener actualizaciones en tiempo real de otros viajeros.',
    before_contact: 'Antes de Contactarnos',
    help_us: 'Para ayudarnos a asistirle más rápidamente, por favor:',
    check_faq: 'Consulte nuestra',
    faq_page: 'página de preguntas frecuentes',
    for_common: 'para preguntas comunes',
    include_device: 'Incluya el tipo de dispositivo y la versión de la aplicación (si corresponde)',
    describe_issue: 'Describa el problema en detalle con pasos para reproducirlo',
    attach_screenshots: 'Adjunte capturas de pantalla si es relevante',
    community_support: 'Soporte de la Comunidad',
    community_desc: 'Para preguntas sobre rutas específicas, cruces fronterizos o consejos de viaje, nuestra comunidad de aplicaciones móviles suele ser la forma más rápida de obtener respuestas de overlanders experimentados que han viajado recientemente en su área de interés.'
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
  },
  it: {
    back_to_support: 'Torna al Supporto',
    title: 'Contattaci',
    subtitle: 'Mettiti in contatto con il team di Overland Map',
    email_support: 'Supporto via Email',
    general_inquiries: 'Richieste Generali:',
    technical_support: 'Supporto Tecnico:',
    response_time: 'Tempo di Risposta',
    response_desc: 'Rispondiamo tipicamente alle richieste entro 24-48 ore durante i giorni lavorativi. Per questioni urgenti relative agli attraversamenti di frontiera o alla sicurezza dei viaggi, utilizza le funzionalità della comunità dell\'app mobile per aggiornamenti in tempo reale da altri viaggiatori.',
    before_contact: 'Prima di Contattarci',
    help_us: 'Per aiutarci ad assisterti più rapidamente, per favore:',
    check_faq: 'Controlla la nostra',
    faq_page: 'pagina FAQ',
    for_common: 'per domande comuni',
    include_device: 'Includi il tipo di dispositivo e la versione dell\'app (se applicabile)',
    describe_issue: 'Descrivi il problema in dettaglio con i passaggi per riprodurlo',
    attach_screenshots: 'Allega screenshot se pertinenti',
    community_support: 'Supporto della Comunità',
    community_desc: 'Per domande su percorsi specifici, attraversamenti di frontiera o consigli di viaggio, la comunità della nostra app mobile è spesso il modo più veloce per ottenere risposte da overlander esperti che hanno recentemente viaggiato nella tua area di interesse.'
  },
  nl: {
    back_to_support: 'Terug naar Ondersteuning',
    title: 'Neem Contact Op',
    subtitle: 'Neem contact op met het Overland Map team',
    email_support: 'E-mail Ondersteuning',
    general_inquiries: 'Algemene Vragen:',
    technical_support: 'Technische Ondersteuning:',
    response_time: 'Reactietijd',
    response_desc: 'We reageren doorgaans binnen 24-48 uur op vragen tijdens werkdagen. Voor urgente zaken met betrekking tot grensovergangen of reisveiligheid, gebruik de communityfuncties van de mobiele app voor realtime updates van medereizigers.',
    before_contact: 'Voordat U Contact Opneemt',
    help_us: 'Om ons te helpen u sneller te assisteren, graag:',
    check_faq: 'Bekijk onze',
    faq_page: 'FAQ-pagina',
    for_common: 'voor veelgestelde vragen',
    include_device: 'Vermeld uw apparaattype en app-versie (indien van toepassing)',
    describe_issue: 'Beschrijf het probleem in detail met stappen om het te reproduceren',
    attach_screenshots: 'Voeg screenshots toe indien relevant',
    community_support: 'Community Ondersteuning',
    community_desc: 'Voor vragen over specifieke routes, grensovergangen of reistips is onze mobiele app-community vaak de snelste manier om antwoorden te krijgen van ervaren overlanders die recent in uw interessegebied hebben gereisd.'
  },
  ru: {
    back_to_support: 'Назад в Поддержку',
    title: 'Свяжитесь с Нами',
    subtitle: 'Свяжитесь с командой Overland Map',
    email_support: 'Поддержка по Электронной Почте',
    general_inquiries: 'Общие Вопросы:',
    technical_support: 'Техническая Поддержка:',
    response_time: 'Время Ответа',
    response_desc: 'Мы обычно отвечаем на запросы в течение 24-48 часов в рабочие дни. По срочным вопросам, связанным с пересечением границ или безопасностью путешествий, используйте функции сообщества мобильного приложения для получения обновлений в реальном времени от других путешественников.',
    before_contact: 'Перед Тем Как Связаться с Нами',
    help_us: 'Чтобы помочь нам быстрее вам помочь, пожалуйста:',
    check_faq: 'Проверьте нашу',
    faq_page: 'страницу FAQ',
    for_common: 'для распространенных вопросов',
    include_device: 'Укажите тип вашего устройства и версию приложения (если применимо)',
    describe_issue: 'Опишите проблему подробно с шагами для воспроизведения',
    attach_screenshots: 'Приложите скриншоты, если это уместно',
    community_support: 'Поддержка Сообщества',
    community_desc: 'Для вопросов о конкретных маршрутах, пограничных переходах или советах по путешествиям, сообщество нашего мобильного приложения часто является самым быстрым способом получить ответы от опытных оверлендеров, которые недавно путешествовали в интересующем вас районе.'
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
