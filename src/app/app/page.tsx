'use client'

import { useLanguage } from '../../contexts/LanguageContext'
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
  de: {
    hero_subtitle: 'Ihr ultimativer Begleiter für Overlandreisen. Navigieren Sie Grenzen, planen Sie Routen und erkunden Sie die Welt mit Vertrauen.',
    feature_maps_title: 'Interaktive Karten',
    feature_maps_desc: 'Erkunden Sie detaillierte Karten mit Grenzübergängen, Visabestimmungen und Reisebedingungen weltweit.',
    feature_offline_title: 'Offline-Zugriff',
    feature_offline_desc: 'Laden Sie Karten und Reiserouten für die Offline-Nutzung herunter, wenn Sie in abgelegenen Gebieten reisen.',
    feature_community_title: 'Community-Updates',
    feature_community_desc: 'Erhalten Sie Echtzeit-Updates von anderen Reisenden über Grenzbedingungen und Straßenzustand.',
    feature_vehicle_title: 'Fahrzeugdokumentation',
    feature_vehicle_desc: 'Verfolgen Sie Carnet-Anforderungen, Versicherung und Fahrzeugpapiere für jedes Land.',
    feature_climate_title: 'Klimadaten',
    feature_climate_desc: 'Planen Sie Ihre Reise mit detaillierten Klimainformationen und saisonalen Empfehlungen.',
    feature_itineraries_title: 'Kuratierte Reiserouten',
    feature_itineraries_desc: 'Kaufen Sie professionell erstellte Routen mit detaillierten Wegpunkten, Offroad-Schwierigkeit und Hintergrundinformationen.',
    cta_title: 'Starten Sie Ihr Abenteuer Heute',
    cta_subtitle: 'Schließen Sie sich Tausenden von Overlandern an, die die Welt mit Overland Map erkunden'
  },
  es: {
    hero_subtitle: 'Tu compañero definitivo para viajes overland. Navega fronteras, planifica rutas y explora el mundo con confianza.',
    feature_maps_title: 'Mapas Interactivos',
    feature_maps_desc: 'Explora mapas detallados con cruces fronterizos, requisitos de visa y condiciones de viaje en todo el mundo.',
    feature_offline_title: 'Acceso Sin Conexión',
    feature_offline_desc: 'Descarga mapas e itinerarios para uso sin conexión cuando viajes en áreas remotas.',
    feature_community_title: 'Actualizaciones de la Comunidad',
    feature_community_desc: 'Obtén actualizaciones en tiempo real de otros viajeros sobre condiciones fronterizas y estado de las carreteras.',
    feature_vehicle_title: 'Documentación del Vehículo',
    feature_vehicle_desc: 'Rastrea requisitos de carnet, seguro y documentación del vehículo para cada país.',
    feature_climate_title: 'Datos Climáticos',
    feature_climate_desc: 'Planifica tu viaje con información climática detallada y recomendaciones estacionales.',
    feature_itineraries_title: 'Itinerarios Seleccionados',
    feature_itineraries_desc: 'Compra rutas elaboradas profesionalmente con puntos de referencia detallados, dificultad offroad e información de contexto.',
    cta_title: 'Comienza Tu Aventura Hoy',
    cta_subtitle: 'Únete a miles de overlanders explorando el mundo con Overland Map'
  },
  fr: {
    hero_subtitle: 'Votre compagnon ultime pour les voyages en overland. Naviguez aux frontières, planifiez vos itinéraires et explorez le monde en toute confiance.',
    feature_maps_title: 'Cartes Interactives',
    feature_maps_desc: 'Explorez des cartes détaillées avec les passages frontaliers, les exigences de visa et les conditions de voyage dans le monde entier.',
    feature_offline_title: 'Accès Hors Ligne',
    feature_offline_desc: 'Téléchargez des cartes et des itinéraires pour une utilisation hors ligne lors de vos voyages dans des zones reculées.',
    feature_community_title: 'Mises à Jour Communautaires',
    feature_community_desc: 'Recevez des mises à jour en temps réel de la part d\'autres voyageurs sur les conditions aux frontières et l\'état des routes.',
    feature_vehicle_title: 'Documentation Véhicule',
    feature_vehicle_desc: 'Suivez les exigences de carnet, l\'assurance et les documents du véhicule pour chaque pays.',
    feature_climate_title: 'Données Climatiques',
    feature_climate_desc: 'Planifiez votre voyage avec des informations climatiques détaillées et des recommandations saisonnières.',
    feature_itineraries_title: 'Itinéraires Sélectionnés',
    feature_itineraries_desc: 'Achetez des itinéraires professionnels avec des points de passage détaillés, la difficulté hors route et des informations contextuelles.',
    cta_title: 'Commencez Votre Aventure Aujourd\'hui',
    cta_subtitle: 'Rejoignez des milliers d\'overlanders qui explorent le monde avec Overland Map'
  },
  it: {
    hero_subtitle: 'Il tuo compagno definitivo per i viaggi overland. Naviga i confini, pianifica percorsi ed esplora il mondo con fiducia.',
    feature_maps_title: 'Mappe Interattive',
    feature_maps_desc: 'Esplora mappe dettagliate con attraversamenti di frontiera, requisiti per i visti e condizioni di viaggio in tutto il mondo.',
    feature_offline_title: 'Accesso Offline',
    feature_offline_desc: 'Scarica mappe e itinerari per l\'uso offline quando viaggi in aree remote.',
    feature_community_title: 'Aggiornamenti della Comunità',
    feature_community_desc: 'Ricevi aggiornamenti in tempo reale da altri viaggiatori sulle condizioni di frontiera e lo stato delle strade.',
    feature_vehicle_title: 'Documentazione del Veicolo',
    feature_vehicle_desc: 'Tieni traccia dei requisiti del carnet, assicurazione e documenti del veicolo per ogni paese.',
    feature_climate_title: 'Dati Climatici',
    feature_climate_desc: 'Pianifica il tuo viaggio con informazioni climatiche dettagliate e raccomandazioni stagionali.',
    feature_itineraries_title: 'Itinerari Curati',
    feature_itineraries_desc: 'Acquista percorsi creati professionalmente con waypoint dettagliati, difficoltà offroad e informazioni di contesto.',
    cta_title: 'Inizia la Tua Avventura Oggi',
    cta_subtitle: 'Unisciti a migliaia di overlander che esplorano il mondo con Overland Map'
  },
  nl: {
    hero_subtitle: 'Jouw ultieme metgezel voor overlandreizen. Navigeer grenzen, plan routes en verken de wereld met vertrouwen.',
    feature_maps_title: 'Interactieve Kaarten',
    feature_maps_desc: 'Verken gedetailleerde kaarten met grensovergangen, visumvereisten en reisomstandigheden wereldwijd.',
    feature_offline_title: 'Offline Toegang',
    feature_offline_desc: 'Download kaarten en reisroutes voor offline gebruik wanneer je in afgelegen gebieden reist.',
    feature_community_title: 'Community Updates',
    feature_community_desc: 'Ontvang realtime updates van medereizigers over grensomstandigheden en wegstatus.',
    feature_vehicle_title: 'Voertuigdocumentatie',
    feature_vehicle_desc: 'Volg carnet-vereisten, verzekering en voertuigpapieren voor elk land.',
    feature_climate_title: 'Klimaatgegevens',
    feature_climate_desc: 'Plan je reis met gedetailleerde klimaatinformatie en seizoensaanbevelingen.',
    feature_itineraries_title: 'Samengestelde Reisroutes',
    feature_itineraries_desc: 'Koop professioneel samengestelde routes met gedetailleerde waypoints, offroad-moeilijkheidsgraad en achtergrondinformatie.',
    cta_title: 'Begin Vandaag Je Avontuur',
    cta_subtitle: 'Sluit je aan bij duizenden overlanders die de wereld verkennen met Overland Map'
  },
  ru: {
    hero_subtitle: 'Ваш идеальный спутник для путешествий по суше. Пересекайте границы, планируйте маршруты и исследуйте мир с уверенностью.',
    feature_maps_title: 'Интерактивные Карты',
    feature_maps_desc: 'Изучайте подробные карты с пограничными переходами, визовыми требованиями и условиями путешествий по всему миру.',
    feature_offline_title: 'Офлайн Доступ',
    feature_offline_desc: 'Загружайте карты и маршруты для использования в автономном режиме при путешествии в отдаленных районах.',
    feature_community_title: 'Обновления Сообщества',
    feature_community_desc: 'Получайте обновления в реальном времени от других путешественников о пограничных условиях и состоянии дорог.',
    feature_vehicle_title: 'Документация Транспорта',
    feature_vehicle_desc: 'Отслеживайте требования карнета, страховку и документы на транспорт для каждой страны.',
    feature_climate_title: 'Климатические Данные',
    feature_climate_desc: 'Планируйте свое путешествие с подробной климатической информацией и сезонными рекомендациями.',
    feature_itineraries_title: 'Подобранные Маршруты',
    feature_itineraries_desc: 'Приобретайте профессионально составленные маршруты с подробными путевыми точками, сложностью бездорожья и справочной информацией.',
    cta_title: 'Начните Свое Приключение Сегодня',
    cta_subtitle: 'Присоединяйтесь к тысячам оверлендеров, исследующих мир с Overland Map'
  }
}

export default function AppPage() {
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
              <div className="text-5xl mb-4">�</div>
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
