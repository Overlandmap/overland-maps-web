'use client'

import { useLanguage } from '../../contexts/LanguageContext'
import NavigationBar from '../../components/NavigationBar'

const translations = {
  en: {
    title: 'About Overland Map',
    mission_title: 'The Mission',
    mission_text: 'Overland Map is dedicated to providing overlanders with accurate, up-to-date information about border crossings, visa requirements, vehicle documentation, and travel conditions around the world. We believe that adventure should be accessible to everyone, and that reliable information is key to safe and successful overland travel.',
    what_find_title: 'What You Will Find',
    find_1: 'Interactive maps showing where it\'s easy or difficult to travel',
    find_2: 'Detailed information about carnet requirements and vehicle paperwork',
    find_3: 'Climate maps to help you plan the best time to travel',
    find_4: 'Curated itineraries in selected destinations',
    find_5: 'Community-driven updates on border crossings and road conditions',
    community_title: 'Community Driven',
    community_text: 'Our data is continuously updated by the overlanding community. Through our mobile app, travelers can share their experiences, report border crossing conditions, and help keep information current for fellow adventurers. This collaborative approach ensures that our maps reflect real-world conditions, not just official regulations.',
    get_involved_title: 'Get Involved',
    get_involved_text: 'Download our mobile app to contribute your experiences, access detailed itineraries, and connect with other overlanders. Together, we\'re building the most comprehensive resource for overland travel worldwide.',
    contact_title: 'Contact Us',
    email_label: 'Email:',
    follow_us: 'Follow Us:'
  },
  de: {
    title: 'Über Overland Map',
    mission_title: 'Die Mission',
    mission_text: 'Overland Map widmet sich der Bereitstellung genauer, aktueller Informationen über Grenzübergänge, Visabestimmungen, Fahrzeugdokumentation und Reisebedingungen auf der ganzen Welt für Overlander. Wir glauben, dass Abenteuer für jeden zugänglich sein sollten und dass zuverlässige Informationen der Schlüssel zu sicheren und erfolgreichen Overlandreisen sind.',
    what_find_title: 'Was Sie finden werden',
    find_1: 'Interaktive Karten, die zeigen, wo es einfach oder schwierig ist zu reisen',
    find_2: 'Detaillierte Informationen über Carnet-Anforderungen und Fahrzeugpapiere',
    find_3: 'Klimakarten, um die beste Reisezeit zu planen',
    find_4: 'Kuratierte Reiserouten in ausgewählten Zielen',
    find_5: 'Community-gesteuerte Updates zu Grenzübergängen und Straßenbedingungen',
    community_title: 'Community-gesteuert',
    community_text: 'Unsere Daten werden kontinuierlich von der Overlanding-Community aktualisiert. Über unsere mobile App können Reisende ihre Erfahrungen teilen, Grenzübergangsbedingungen melden und dazu beitragen, Informationen für Mitreisende aktuell zu halten. Dieser kollaborative Ansatz stellt sicher, dass unsere Karten reale Bedingungen widerspiegeln, nicht nur offizielle Vorschriften.',
    get_involved_title: 'Mitmachen',
    get_involved_text: 'Laden Sie unsere mobile App herunter, um Ihre Erfahrungen beizutragen, auf detaillierte Reiserouten zuzugreifen und sich mit anderen Overlandern zu vernetzen. Gemeinsam bauen wir die umfassendste Ressource für Overlandreisen weltweit auf.',
    contact_title: 'Kontakt',
    email_label: 'E-Mail:',
    follow_us: 'Folgen Sie uns:'
  },
  es: {
    title: 'Acerca de Overland Map',
    mission_title: 'La Misión',
    mission_text: 'Overland Map se dedica a proporcionar a los viajeros terrestres información precisa y actualizada sobre cruces fronterizos, requisitos de visa, documentación de vehículos y condiciones de viaje en todo el mundo. Creemos que la aventura debe ser accesible para todos y que la información confiable es clave para viajes terrestres seguros y exitosos.',
    what_find_title: 'Lo que encontrarás',
    find_1: 'Mapas interactivos que muestran dónde es fácil o difícil viajar',
    find_2: 'Información detallada sobre requisitos de carnet y documentación de vehículos',
    find_3: 'Mapas climáticos para ayudarte a planificar el mejor momento para viajar',
    find_4: 'Itinerarios seleccionados en destinos específicos',
    find_5: 'Actualizaciones impulsadas por la comunidad sobre cruces fronterizos y condiciones de carreteras',
    community_title: 'Impulsado por la Comunidad',
    community_text: 'Nuestros datos se actualizan continuamente por la comunidad de viajeros terrestres. A través de nuestra aplicación móvil, los viajeros pueden compartir sus experiencias, informar sobre las condiciones de los cruces fronterizos y ayudar a mantener la información actualizada para otros aventureros. Este enfoque colaborativo garantiza que nuestros mapas reflejen las condiciones del mundo real, no solo las regulaciones oficiales.',
    get_involved_title: 'Participa',
    get_involved_text: 'Descarga nuestra aplicación móvil para contribuir con tus experiencias, acceder a itinerarios detallados y conectarte con otros viajeros terrestres. Juntos, estamos construyendo el recurso más completo para viajes terrestres en todo el mundo.',
    contact_title: 'Contáctanos',
    email_label: 'Correo electrónico:',
    follow_us: 'Síguenos:'
  },
  fr: {
    title: 'À propos d\'Overland Map',
    mission_title: 'La Mission',
    mission_text: 'Overland Map se consacre à fournir aux voyageurs terrestres des informations précises et à jour sur les passages frontaliers, les exigences de visa, la documentation des véhicules et les conditions de voyage dans le monde entier. Nous croyons que l\'aventure doit être accessible à tous et que des informations fiables sont la clé de voyages terrestres sûrs et réussis.',
    what_find_title: 'Ce que vous trouverez',
    find_1: 'Des cartes interactives montrant où il est facile ou difficile de voyager',
    find_2: 'Des informations détaillées sur les exigences de carnet et les documents de véhicule',
    find_3: 'Des cartes climatiques pour vous aider à planifier le meilleur moment pour voyager',
    find_4: 'Des itinéraires sélectionnés dans des destinations choisies',
    find_5: 'Des mises à jour communautaires sur les passages frontaliers et les conditions routières',
    community_title: 'Piloté par la Communauté',
    community_text: 'Nos données sont continuellement mises à jour par la communauté des voyageurs terrestres. Grâce à notre application mobile, les voyageurs peuvent partager leurs expériences, signaler les conditions des passages frontaliers et aider à maintenir les informations à jour pour les autres aventuriers. Cette approche collaborative garantit que nos cartes reflètent les conditions réelles, pas seulement les réglementations officielles.',
    get_involved_title: 'Participez',
    get_involved_text: 'Téléchargez notre application mobile pour contribuer avec vos expériences, accéder à des itinéraires détaillés et vous connecter avec d\'autres voyageurs terrestres. Ensemble, nous construisons la ressource la plus complète pour les voyages terrestres dans le monde entier.',
    contact_title: 'Contactez-nous',
    email_label: 'E-mail :',
    follow_us: 'Suivez-nous :'
  },
  it: {
    title: 'Informazioni su Overland Map',
    mission_title: 'La Missione',
    mission_text: 'Overland Map si dedica a fornire ai viaggiatori terrestri informazioni accurate e aggiornate su attraversamenti di frontiera, requisiti per i visti, documentazione dei veicoli e condizioni di viaggio in tutto il mondo. Crediamo che l\'avventura debba essere accessibile a tutti e che informazioni affidabili siano la chiave per viaggi terrestri sicuri e di successo.',
    what_find_title: 'Cosa troverai',
    find_1: 'Mappe interattive che mostrano dove è facile o difficile viaggiare',
    find_2: 'Informazioni dettagliate sui requisiti del carnet e sulla documentazione del veicolo',
    find_3: 'Mappe climatiche per aiutarti a pianificare il momento migliore per viaggiare',
    find_4: 'Itinerari selezionati in destinazioni scelte',
    find_5: 'Aggiornamenti guidati dalla comunità su attraversamenti di frontiera e condizioni stradali',
    community_title: 'Guidato dalla Comunità',
    community_text: 'I nostri dati vengono continuamente aggiornati dalla comunità dei viaggiatori terrestri. Attraverso la nostra app mobile, i viaggiatori possono condividere le loro esperienze, segnalare le condizioni degli attraversamenti di frontiera e aiutare a mantenere le informazioni aggiornate per altri avventurieri. Questo approccio collaborativo garantisce che le nostre mappe riflettano le condizioni del mondo reale, non solo le normative ufficiali.',
    get_involved_title: 'Partecipa',
    get_involved_text: 'Scarica la nostra app mobile per contribuire con le tue esperienze, accedere a itinerari dettagliati e connetterti con altri viaggiatori terrestri. Insieme, stiamo costruendo la risorsa più completa per i viaggi terrestri in tutto il mondo.',
    contact_title: 'Contattaci',
    email_label: 'Email:',
    follow_us: 'Seguici:'
  },
  nl: {
    title: 'Over Overland Map',
    mission_title: 'De Missie',
    mission_text: 'Overland Map is toegewijd aan het verstrekken van nauwkeurige, actuele informatie over grensovergangen, visumvereisten, voertuigdocumentatie en reisomstandigheden over de hele wereld aan overlanders. Wij geloven dat avontuur toegankelijk moet zijn voor iedereen en dat betrouwbare informatie de sleutel is tot veilige en succesvolle overlandreizen.',
    what_find_title: 'Wat je zult vinden',
    find_1: 'Interactieve kaarten die laten zien waar het gemakkelijk of moeilijk is om te reizen',
    find_2: 'Gedetailleerde informatie over carnet-vereisten en voertuigdocumentatie',
    find_3: 'Klimaatkaarten om je te helpen de beste reistijd te plannen',
    find_4: 'Samengestelde reisroutes in geselecteerde bestemmingen',
    find_5: 'Door de gemeenschap aangestuurde updates over grensovergangen en wegomstandigheden',
    community_title: 'Gemeenschapsgestuurd',
    community_text: 'Onze gegevens worden voortdurend bijgewerkt door de overlanding-gemeenschap. Via onze mobiele app kunnen reizigers hun ervaringen delen, grensovergangscondities melden en helpen informatie actueel te houden voor medereizigers. Deze collaboratieve aanpak zorgt ervoor dat onze kaarten de werkelijke omstandigheden weerspiegelen, niet alleen officiële regelgeving.',
    get_involved_title: 'Doe mee',
    get_involved_text: 'Download onze mobiele app om je ervaringen bij te dragen, toegang te krijgen tot gedetailleerde reisroutes en contact te maken met andere overlanders. Samen bouwen we de meest uitgebreide bron voor overlandreizen wereldwijd.',
    contact_title: 'Neem contact op',
    email_label: 'E-mail:',
    follow_us: 'Volg ons:'
  },
  ru: {
    title: 'О Overland Map',
    mission_title: 'Миссия',
    mission_text: 'Overland Map посвящен предоставлению путешественникам точной и актуальной информации о пограничных переходах, визовых требованиях, документации на транспортные средства и условиях путешествий по всему миру. Мы верим, что приключения должны быть доступны каждому, и что надежная информация является ключом к безопасным и успешным наземным путешествиям.',
    what_find_title: 'Что вы найдете',
    find_1: 'Интерактивные карты, показывающие, где легко или сложно путешествовать',
    find_2: 'Подробная информация о требованиях к карнету и документации на транспортное средство',
    find_3: 'Климатические карты, помогающие спланировать лучшее время для путешествия',
    find_4: 'Подобранные маршруты в выбранных направлениях',
    find_5: 'Обновления от сообщества о пограничных переходах и дорожных условиях',
    community_title: 'Управляется сообществом',
    community_text: 'Наши данные постоянно обновляются сообществом путешественников. Через наше мобильное приложение путешественники могут делиться своим опытом, сообщать об условиях пограничных переходов и помогать поддерживать информацию актуальной для других искателей приключений. Этот совместный подход гарантирует, что наши карты отражают реальные условия, а не только официальные правила.',
    get_involved_title: 'Присоединяйтесь',
    get_involved_text: 'Загрузите наше мобильное приложение, чтобы делиться своим опытом, получать доступ к подробным маршрутам и общаться с другими путешественниками. Вместе мы создаем самый полный ресурс для наземных путешествий по всему миру.',
    contact_title: 'Свяжитесь с нами',
    email_label: 'Электронная почта:',
    follow_us: 'Подписывайтесь на нас:'
  }
}

function AboutPageContent() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentSection="about" />
      
      <main className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {t.title}
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.mission_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.mission_text}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.what_find_title}
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.find_1}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.find_2}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.find_3}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.find_4}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{t.find_5}</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.community_title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t.community_text}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.get_involved_title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t.get_involved_text}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t.contact_title}
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  <span className="font-semibold">{t.email_label}</span>{' '}
                  <a href="mailto:info@overlandmap.ch" className="text-blue-600 hover:text-blue-700 underline">
                    info@overlandmap.ch
                  </a>
                </p>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">{t.follow_us}</p>
                  <div className="flex space-x-4">
                    <a
                      href="https://www.instagram.com/overlandmap"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-pink-600 transition-colors"
                      aria-label="Instagram"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.facebook.com/overlandmap"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                      aria-label="Facebook"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AboutPage() {
  return <AboutPageContent />
}
