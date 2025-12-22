/**
 * Internationalization utilities for multi-language support
 */

import { CountryData } from '../types'

export type SupportedLanguage = 'en' | 'de' | 'es' | 'fr' | 'it' | 'ja' | 'nl' | 'ru' | 'zh'

export interface LanguageInfo {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' }
]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

/**
 * Get translated country name from country data
 */
export function getTranslatedCountryName(
  countryData: CountryData, 
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  // Try to get translation from the translations object (check both locations)
  const translations = countryData.translations || countryData.parameters?.translations
  
  if (translations && translations[language]) {
    return translations[language]
  }
  
  // Fallback to English name or original name
  return translations?.en || countryData.name || 'Unknown Country'
}

/**
 * Get translated capital name from country data
 */
export function getTranslatedCapitalName(
  countryData: CountryData, 
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  // Try to get translation from the capital_translations object (check both locations)
  const capitalTranslations = countryData.capital_translations || countryData.parameters?.capital_translations
  
  if (capitalTranslations && capitalTranslations[language]) {
    return capitalTranslations[language]
  }
  
  // Fallback to English capital or parameters.capital
  return capitalTranslations?.en || 
         countryData.parameters?.capital || 
         'Unknown Capital'
}

/**
 * Get language info by code
 */
export function getLanguageInfo(code: SupportedLanguage): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code)
}

/**
 * Check if a language is supported
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code)
}

/**
 * Get browser's preferred language if supported, otherwise return default
 */
export function getBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage
  return isSupportedLanguage(browserLang) ? browserLang : DEFAULT_LANGUAGE
}

/**
 * Store language preference in localStorage
 */
export function setLanguagePreference(language: SupportedLanguage): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-language', language)
  }
}

/**
 * Get language preference from localStorage
 */
export function getLanguagePreference(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  
  const stored = localStorage.getItem('preferred-language')
  return stored && isSupportedLanguage(stored) ? stored : getBrowserLanguage()
}

/**
 * Translation dictionary for border status
 */
const BORDER_STATUS_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'closed': 'Closed',
    'dangerous': 'Dangerous',
    'open': 'Open',
    'unknown': 'Unknown'
  },
  de: {
    'closed': 'Geschlossen',
    'dangerous': 'Gefährlich',
    'open': 'Offen',
    'unknown': 'Unbekannt'
  },
  es: {
    'closed': 'Cerrado',
    'dangerous': 'Peligroso',
    'open': 'Abierto',
    'unknown': 'Desconocido'
  },
  fr: {
    'closed': 'Fermé',
    'dangerous': 'Dangereux',
    'open': 'Ouvert',
    'unknown': 'Inconnu'
  },
  it: {
    'closed': 'Chiuso',
    'dangerous': 'Pericoloso',
    'open': 'Aperto',
    'unknown': 'Sconosciuto'
  },
  ja: {
    'closed': '閉鎖',
    'dangerous': '危険',
    'open': 'オープン',
    'unknown': '不明'
  },
  ru: {
    'closed': 'Закрыто',
    'dangerous': 'Опасно',
    'open': 'Открыто',
    'unknown': 'Неизвестно'
  },
  nl: {
    'closed': 'Gesloten',
    'dangerous': 'Gevaarlijk',
    'open': 'Open',
    'unknown': 'Onbekend'
  },
  zh: {
    'closed': '关闭',
    'dangerous': '危险',
    'open': '开放',
    'unknown': '未知'
  }
}

/**
 * Translation dictionary for overlanding status
 */
const OVERLANDING_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'forbidden': 'Forbidden',
    'war_dangerous': 'Unsafe',
    'restricted': 'Restricted access',
    'open': 'Open',
    'unknown': 'Unknown'
  },
  de: {
    'forbidden': 'Verboten',
    'war_dangerous': 'Unsicher',
    'restricted': 'Eingeschränkter Zugang',
    'open': 'Offen',
    'unknown': 'Unbekannt'
  },
  es: {
    'forbidden': 'Prohibido',
    'war_dangerous': 'Inseguro',
    'restricted': 'Acceso restringido',
    'open': 'Abierto',
    'unknown': 'Desconocido'
  },
  fr: {
    'forbidden': 'Interdit',
    'war_dangerous': 'Dangereux',
    'restricted': 'Accès restreint',
    'open': 'Ouvert',
    'unknown': 'Inconnu'
  },
  it: {
    'forbidden': 'Vietato',
    'war_dangerous': 'Non sicuro',
    'restricted': 'Accesso limitato',
    'open': 'Aperto',
    'unknown': 'Sconosciuto'
  },
  ja: {
    'forbidden': '禁止',
    'war_dangerous': '危険',
    'restricted': 'アクセス制限',
    'open': 'オープン',
    'unknown': '不明'
  },
  nl: {
    'forbidden': 'Verboden',
    'war_dangerous': 'Onveilig',
    'restricted': 'Beperkte toegang',
    'open': 'Open',
    'unknown': 'Onbekend'
  },
  ru: {
    'forbidden': 'Запрещено',
    'war_dangerous': 'Небезопасно',
    'restricted': 'Ограниченный доступ',
    'open': 'Открыто',
    'unknown': 'Неизвестно'
  },
  zh: {
    'forbidden': '禁止',
    'war_dangerous': '不安全',
    'restricted': '限制访问',
    'open': '开放',
    'unknown': '未知'
  }
}

/**
 * Get translated border status
 */
export function getTranslatedBorderStatus(
  isOpen: number | string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  const numValue = Number(isOpen)
  
  if (isNaN(numValue)) {
    return BORDER_STATUS_TRANSLATIONS[language]?.unknown || BORDER_STATUS_TRANSLATIONS[DEFAULT_LANGUAGE].unknown
  }
  
  let key: string
  switch (numValue) {
    case 0:
      key = 'closed'
      break
    case 1:
      key = 'dangerous'
      break
    case 2:
      key = 'open'
      break
    default:
      key = 'unknown'
  }
  
  return BORDER_STATUS_TRANSLATIONS[language]?.[key] || BORDER_STATUS_TRANSLATIONS[DEFAULT_LANGUAGE][key]
}

/**
 * Get border status color classes for UI components
 */
export function getBorderStatusColorClasses(isOpen: number | string): string {
  const numValue = Number(isOpen)
  
  switch (numValue) {
    case 0:
      return 'bg-red-100 text-red-800' // Closed - Red
    case 1:
      return 'bg-yellow-100 text-yellow-800' // Dangerous - Yellow
    case 2:
      return 'bg-green-100 text-green-900' // Open - Dark Green
    default:
      return 'bg-gray-100 text-gray-800' // Unknown - Gray
  }
}

/**
 * Translation dictionary for carnet status
 */
const CARNET_STATUS_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'access_forbidden': 'Access forbidden',
    'not_required': 'Not required',
    'required_some': 'Required in some situations',
    'required': 'Mandatory'
  },
  de: {
    'access_forbidden': 'Zugang verboten',
    'not_required': 'Nicht erforderlich',
    'required_some': 'In einigen Situationen erforderlich',
    'required': 'Obligatorisch'
  },
  es: {
    'access_forbidden': 'Acceso prohibido',
    'not_required': 'No requerido',
    'required_some': 'Requerido en algunas situaciones',
    'required': 'Obligatorio'
  },
  fr: {
    'access_forbidden': 'Accès interdit',
    'not_required': 'Non requis',
    'required_some': 'Requis dans certaines situations',
    'required': 'Obligatoire'
  },
  it: {
    'access_forbidden': 'Accesso vietato',
    'not_required': 'Non richiesto',
    'required_some': 'Richiesto in alcune situazioni',
    'required': 'Obbligatorio'
  },
  ja: {
    'access_forbidden': 'アクセス禁止',
    'not_required': '不要',
    'required_some': '一部の状況で必要',
    'required': '必須'
  },
  nl: {
    'access_forbidden': 'Toegang verboden',
    'not_required': 'Niet vereist',
    'required_some': 'Vereist in sommige situaties',
    'required': 'Verplicht'
  },
  ru: {
    'access_forbidden': 'Доступ запрещен',
    'not_required': 'Не требуется',
    'required_some': 'Требуется в некоторых ситуациях',
    'required': 'Обязательно'
  },
  zh: {
    'access_forbidden': '禁止进入',
    'not_required': '不需要',
    'required_some': '某些情况下需要',
    'required': '强制性'
  }
}

/**
 * Get translated carnet status
 */
export function getTranslatedCarnetStatus(
  carnet: number | string | undefined | null,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  if (carnet === undefined || carnet === null || carnet === '' || carnet === 0) {
    return CARNET_STATUS_TRANSLATIONS[language]?.not_required || CARNET_STATUS_TRANSLATIONS[DEFAULT_LANGUAGE].not_required
  }
  
  const numValue = Number(carnet)
  
  if (isNaN(numValue)) {
    return String(carnet) // Return as-is if not a number
  }
  
  let key: string
  switch (numValue) {
    case -1:
      key = 'access_forbidden'
      break
    case 1:
      key = 'required_some'
      break
    case 2:
      key = 'required'
      break
    default:
      key = 'not_required'
  }
  
  return CARNET_STATUS_TRANSLATIONS[language]?.[key] || CARNET_STATUS_TRANSLATIONS[DEFAULT_LANGUAGE][key]
}

/**
 * Get translated overlanding status
 */
export function getTranslatedOverlandingStatus(
  overlanding: number | string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  const numValue = Number(overlanding)
  
  if (isNaN(numValue)) {
    return OVERLANDING_TRANSLATIONS[language]?.unknown || OVERLANDING_TRANSLATIONS[DEFAULT_LANGUAGE].unknown
  }
  
  let key: string
  switch (numValue) {
    case 0:
      key = 'forbidden'
      break
    case 1:
      key = 'war_dangerous'
      break
    case 2:
      key = 'restricted'
      break
    case 3:
      key = 'open'
      break
    default:
      key = 'unknown'
  }
  
  return OVERLANDING_TRANSLATIONS[language]?.[key] || OVERLANDING_TRANSLATIONS[DEFAULT_LANGUAGE][key]
}

/**
 * Translation dictionary for interface labels
 */
const INTERFACE_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Overlanding Status',
    'carnet_requirements': 'Carnet Requirements',
    'border_status': 'Border Status',
    'open': 'Open',
    'restricted_access': 'Restricted access',
    'war_dangerous': 'Unsafe',
    'forbidden': 'Forbidden',
    'unknown': 'Unknown',
    'not_required': 'Not required',
    'required_in_some_situations': 'Required in some situations',
    'mandatory': 'Mandatory',
    'access_forbidden': 'Access forbidden',
    'restricted': 'Restricted',
    'closed': 'Closed',
    'loading_map': 'Loading map...',
    'visa': 'Visa',
    'driving': 'Driving',
    'left': 'Left',
    'right': 'Right',
    'zoom_to_location': 'Zoom to location',
    'borders': 'Borders',
    'border_posts': 'Border Posts',
    'adjacent_countries': 'Adjacent Countries',
    'countries': 'Countries',
    'bilateral': 'Bilateral',
    'restrictions_apply': 'Restrictions apply',
    'temporary_closed': 'Temporary Closed',
    'zones': 'Zones',
    'restricted_areas': 'Restricted areas',
    'zone_closed': 'Closed',
    'zone_guide_escort': 'Guide/Escort Needed',
    'zone_permit': 'Permit Needed',
    'zone_restrictions': 'Restrictions apply',
    'disclaimer_title': 'Travel Disclaimer & Privacy Notice',
    'disclaimer_message': 'The information provided on this website is for general guidance only. While we make every effort to ensure that the content is accurate, complete, and up to date, we cannot guarantee its correctness or current validity. Travel conditions, visa requirements, and border regulations can change at any time without notice. You are responsible for verifying all information with official sources and for exercising your own judgment when making travel decisions. All travel is undertaken at your own risk.',
    'gdpr_title': 'Privacy & Data Protection',
    'gdpr_message': 'We use essential cookies and local storage to improve your experience and remember your preferences (such as language settings). We do not collect personal data or use tracking cookies. By continuing to use this site, you consent to our use of essential cookies and local storage.',
    'disclaimer_accept': 'Accept & Continue',
    'track_pack': 'Track Pack',
    'itinerary_app_promotion': 'For more information, to download and explore the detailed steps of the itinerary, download the mobile app',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'length_unknown': 'Length unknown',
    'steps': 'steps',
    'days': 'days',
    'climate': 'Climate',
    'itineraries': 'Itineraries',
    'description': 'Description',
    'highlights': 'Highlights',
    'monthly_max_temperature': 'Monthly maximum temperature',
    'monthly_precipitation': 'Monthly precipitation',
    'temperature': 'Temperature',
    'precipitation': 'Precipitation',
    'jan': 'Jan',
    'feb': 'Feb',
    'mar': 'Mar',
    'apr': 'Apr',
    'may': 'May',
    'jun': 'Jun',
    'jul': 'Jul',
    'aug': 'Aug',
    'sep': 'Sep',
    'oct': 'Oct',
    'nov': 'Nov',
    'dec': 'Dec'
  },
  de: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Overlanding-Status',
    'carnet_requirements': 'Carnet-Anforderungen',
    'border_status': 'Grenzstatus',
    'open': 'Offen',
    'restricted_access': 'Eingeschränkter Zugang',
    'war_dangerous': 'Unsicher',
    'forbidden': 'Verboten',
    'unknown': 'Unbekannt',
    'not_required': 'Nicht erforderlich',
    'required_in_some_situations': 'In einigen Situationen erforderlich',
    'mandatory': 'Obligatorisch',
    'access_forbidden': 'Zugang verboten',
    'restricted': 'Eingeschränkt',
    'closed': 'Geschlossen',
    'loading_map': 'Karte wird geladen...',
    'visa': 'Visum',
    'driving': 'Fahren',
    'left': 'Links',
    'right': 'Rechts',
    'zoom_to_location': 'Zum Standort zoomen',
    'borders': 'Grenzen',
    'border_posts': 'Grenzposten',
    'adjacent_countries': 'Angrenzende Länder',
    'countries': 'Länder',
    'bilateral': 'Bilateral',
    'restrictions_apply': 'Einschränkungen gelten',
    'temporary_closed': 'Vorübergehend geschlossen',
    'zones': 'Zonen',
    'restricted_areas': 'Sperrgebiete',
    'zone_closed': 'Geschlossen',
    'zone_guide_escort': 'Führer/Begleitung erforderlich',
    'zone_permit': 'Genehmigung erforderlich',
    'zone_restrictions': 'Einschränkungen gelten',
    'disclaimer_title': 'Reise-Haftungsausschluss & Datenschutzhinweis',
    'disclaimer_message': 'Die auf dieser Website bereitgestellten Informationen dienen nur der allgemeinen Orientierung. Obwohl wir uns bemühen sicherzustellen, dass der Inhalt genau, vollständig und aktuell ist, können wir seine Richtigkeit oder aktuelle Gültigkeit nicht garantieren. Reisebedingungen, Visa-Anforderungen und Grenzbestimmungen können sich jederzeit ohne Vorankündigung ändern. Sie sind dafür verantwortlich, alle Informationen bei offiziellen Quellen zu überprüfen und Ihr eigenes Urteilsvermögen bei Reiseentscheidungen zu verwenden. Alle Reisen erfolgen auf eigenes Risiko.',
    'gdpr_title': 'Datenschutz & Datenschutz',
    'gdpr_message': 'Wir verwenden wesentliche Cookies und lokale Speicherung, um Ihre Erfahrung zu verbessern und Ihre Einstellungen (wie Spracheinstellungen) zu speichern. Wir sammeln keine persönlichen Daten und verwenden keine Tracking-Cookies. Durch die weitere Nutzung dieser Website stimmen Sie unserer Verwendung von wesentlichen Cookies und lokaler Speicherung zu.',
    'disclaimer_accept': 'Akzeptieren & Fortfahren',
    'track_pack': 'Track Pack',
    'itinerary_app_promotion': 'Für weitere Informationen, zum Herunterladen und Erkunden der detaillierten Schritte der Reiseroute, laden Sie die mobile App herunter',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'length_unknown': 'Länge unbekannt',
    'steps': 'Schritte',
    'days': 'Tage',
    'climate': 'Klima',
    'itineraries': 'Reiserouten',
    'description': 'Beschreibung',
    'highlights': 'Höhepunkte',
    'monthly_max_temperature': 'Monatliche Höchsttemperatur',
    'monthly_precipitation': 'Monatlicher Niederschlag',
    'temperature': 'Temperatur',
    'precipitation': 'Niederschlag',
    'jan': 'Jan',
    'feb': 'Feb',
    'mar': 'Mär',
    'apr': 'Apr',
    'may': 'Mai',
    'jun': 'Jun',
    'jul': 'Jul',
    'aug': 'Aug',
    'sep': 'Sep',
    'oct': 'Okt',
    'nov': 'Nov',
    'dec': 'Dez'
  },
  es: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Estado de Overlanding',
    'carnet_requirements': 'Requisitos de Carnet',
    'border_status': 'Estado de Frontera',
    'open': 'Abierto',
    'restricted_access': 'Acceso restringido',
    'war_dangerous': 'Inseguro',
    'forbidden': 'Prohibido',
    'unknown': 'Desconocido',
    'not_required': 'No requerido',
    'required_in_some_situations': 'Requerido en algunas situaciones',
    'mandatory': 'Obligatorio',
    'access_forbidden': 'Acceso prohibido',
    'restricted': 'Restringido',
    'closed': 'Cerrado',
    'loading_map': 'Cargando mapa...',
    'visa': 'Visa',
    'driving': 'Conducción',
    'left': 'Izquierda',
    'right': 'Derecha',
    'zoom_to_location': 'Acercar a la ubicación',
    'borders': 'Fronteras',
    'border_posts': 'Puestos fronterizos',
    'adjacent_countries': 'Países adyacentes',
    'countries': 'Países',
    'bilateral': 'Bilateral',
    'restrictions_apply': 'Se aplican restricciones',
    'temporary_closed': 'Cerrado temporalmente',
    'zones': 'Zonas',
    'restricted_areas': 'Áreas restringidas',
    'zone_closed': 'Cerrado',
    'zone_guide_escort': 'Guía/Escolta necesario',
    'zone_permit': 'Permiso necesario',
    'zone_restrictions': 'Se aplican restricciones',
    'disclaimer_title': 'Descargo de Responsabilidad de Viaje y Aviso de Privacidad',
    'disclaimer_message': 'La información proporcionada en este sitio web es solo para orientación general. Aunque hacemos todo lo posible para asegurar que el contenido sea preciso, completo y actualizado, no podemos garantizar su exactitud o validez actual. Las condiciones de viaje, requisitos de visa y regulaciones fronterizas pueden cambiar en cualquier momento sin previo aviso. Usted es responsable de verificar toda la información con fuentes oficiales y de ejercer su propio juicio al tomar decisiones de viaje. Todo viaje se realiza bajo su propio riesgo.',
    'gdpr_title': 'Privacidad y Protección de Datos',
    'gdpr_message': 'Utilizamos cookies esenciales y almacenamiento local para mejorar su experiencia y recordar sus preferencias (como la configuración de idioma). No recopilamos datos personales ni utilizamos cookies de seguimiento. Al continuar usando este sitio, usted consiente nuestro uso de cookies esenciales y almacenamiento local.',
    'disclaimer_accept': 'Aceptar y Continuar',
    'track_pack': 'Paquete de Ruta',
    'itinerary_app_promotion': 'Para más información, para descargar y explorar los pasos detallados del itinerario, descarga la aplicación móvil',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'length_unknown': 'Longitud desconocida',
    'steps': 'pasos',
    'days': 'días',
    'climate': 'Clima',
    'itineraries': 'Itinerarios',
    'description': 'Descripción',
    'highlights': 'Aspectos destacados',
    'monthly_max_temperature': 'Temperatura máxima mensual',
    'monthly_precipitation': 'Precipitación mensual',
    'temperature': 'Temperatura',
    'precipitation': 'Precipitación',
    'jan': 'Ene',
    'feb': 'Feb',
    'mar': 'Mar',
    'apr': 'Abr',
    'may': 'May',
    'jun': 'Jun',
    'jul': 'Jul',
    'aug': 'Ago',
    'sep': 'Sep',
    'oct': 'Oct',
    'nov': 'Nov',
    'dec': 'Dic'
  },
  fr: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Statut Overlanding',
    'carnet_requirements': 'Exigences Carnet',
    'border_status': 'Statut de Frontière',
    'open': 'Ouvert',
    'restricted_access': 'Accès restreint',
    'war_dangerous': 'Dangereux',
    'forbidden': 'Interdit',
    'unknown': 'Inconnu',
    'not_required': 'Non requis',
    'required_in_some_situations': 'Requis dans certaines situations',
    'mandatory': 'Obligatoire',
    'access_forbidden': 'Accès interdit',
    'restricted': 'Restreint',
    'closed': 'Fermé',
    'loading_map': 'Chargement de la carte...',
    'visa': 'Visa',
    'driving': 'Conduite',
    'left': 'Gauche',
    'right': 'Droite',
    'zoom_to_location': 'Zoomer sur l\'emplacement',
    'borders': 'Frontières',
    'border_posts': 'Postes frontières',
    'adjacent_countries': 'Pays adjacents',
    'countries': 'Pays',
    'bilateral': 'Bilatéral',
    'restrictions_apply': 'Restrictions applicables',
    'temporary_closed': 'Fermé temporairement',
    'zones': 'Zones',
    'restricted_areas': 'Zones restreintes',
    'zone_closed': 'Fermé',
    'zone_guide_escort': 'Guide/Escorte nécessaire',
    'zone_permit': 'Permis nécessaire',
    'zone_restrictions': 'Restrictions applicables',
    'disclaimer_title': 'Avertissement de Voyage et Avis de Confidentialité',
    'disclaimer_message': 'Les informations fournies sur ce site web sont uniquement à des fins d\'orientation générale. Bien que nous fassions tous les efforts pour nous assurer que le contenu soit précis, complet et à jour, nous ne pouvons garantir son exactitude ou sa validité actuelle. Les conditions de voyage, les exigences de visa et les réglementations frontalières peuvent changer à tout moment sans préavis. Vous êtes responsable de vérifier toutes les informations auprès de sources officielles et d\'exercer votre propre jugement lors de la prise de décisions de voyage. Tous les voyages sont entrepris à vos propres risques.',
    'gdpr_title': 'Confidentialité et Protection des Données',
    'gdpr_message': 'Nous utilisons des cookies essentiels et le stockage local pour améliorer votre expérience et mémoriser vos préférences (comme les paramètres de langue). Nous ne collectons pas de données personnelles et n\'utilisons pas de cookies de suivi. En continuant à utiliser ce site, vous consentez à notre utilisation de cookies essentiels et du stockage local.',
    'disclaimer_accept': 'Accepter et Continuer',
    'track_pack': 'Pack de Piste',
    'itinerary_app_promotion': 'Pour plus d\'informations, pour télécharger et explorer les étapes détaillées de l\'itinéraire, téléchargez l\'application mobile',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'length_unknown': 'Longueur inconnue',
    'steps': 'étapes',
    'days': 'jours',
    'climate': 'Climat',
    'itineraries': 'Itinéraires',
    'description': 'Description',
    'highlights': 'Points forts',
    'monthly_max_temperature': 'Température maximale mensuelle',
    'monthly_precipitation': 'Précipitations mensuelles',
    'temperature': 'Température',
    'precipitation': 'Précipitations',
    'jan': 'Jan',
    'feb': 'Fév',
    'mar': 'Mar',
    'apr': 'Avr',
    'may': 'Mai',
    'jun': 'Jun',
    'jul': 'Jul',
    'aug': 'Aoû',
    'sep': 'Sep',
    'oct': 'Oct',
    'nov': 'Nov',
    'dec': 'Déc'
  },
  it: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Stato Overlanding',
    'carnet_requirements': 'Requisiti Carnet',
    'border_status': 'Stato del Confine',
    'open': 'Aperto',
    'restricted_access': 'Accesso limitato',
    'war_dangerous': 'Non sicuro',
    'forbidden': 'Vietato',
    'unknown': 'Sconosciuto',
    'not_required': 'Non richiesto',
    'required_in_some_situations': 'Richiesto in alcune situazioni',
    'mandatory': 'Obbligatorio',
    'access_forbidden': 'Accesso vietato',
    'restricted': 'Limitato',
    'closed': 'Chiuso',
    'loading_map': 'Caricamento mappa...',
    'visa': 'Visto',
    'driving': 'Guida',
    'left': 'Sinistra',
    'right': 'Destra',
    'zoom_to_location': 'Zoom sulla posizione',
    'borders': 'Confini',
    'border_posts': 'Posti di frontiera',
    'adjacent_countries': 'Paesi adiacenti',
    'countries': 'Paesi',
    'bilateral': 'Bilaterale',
    'restrictions_apply': 'Si applicano restrizioni',
    'temporary_closed': 'Chiuso temporaneamente',
    'zones': 'Zone',
    'restricted_areas': 'Aree riservate',
    'zone_closed': 'Chiuso',
    'zone_guide_escort': 'Guida/Scorta necessaria',
    'zone_permit': 'Permesso necessario',
    'zone_restrictions': 'Si applicano restrizioni',
    'disclaimer_title': 'Disclaimer di Viaggio e Informativa sulla Privacy',
    'disclaimer_message': 'Le informazioni fornite su questo sito web sono solo per orientamento generale. Sebbene facciamo ogni sforzo per assicurare che il contenuto sia accurato, completo e aggiornato, non possiamo garantire la sua correttezza o validità attuale. Le condizioni di viaggio, i requisiti per i visti e le normative di frontiera possono cambiare in qualsiasi momento senza preavviso. Sei responsabile di verificare tutte le informazioni con fonti ufficiali e di esercitare il tuo giudizio quando prendi decisioni di viaggio. Tutti i viaggi sono intrapresi a tuo rischio.',
    'gdpr_title': 'Privacy e Protezione dei Dati',
    'gdpr_message': 'Utilizziamo cookie essenziali e archiviazione locale per migliorare la tua esperienza e ricordare le tue preferenze (come le impostazioni della lingua). Non raccogliamo dati personali né utilizziamo cookie di tracciamento. Continuando a utilizzare questo sito, acconsenti al nostro uso di cookie essenziali e archiviazione locale.',
    'disclaimer_accept': 'Accetta e Continua',
    'track_pack': 'Pacchetto Traccia',
    'itinerary_app_promotion': 'Per maggiori informazioni, per scaricare ed esplorare i passaggi dettagliati dell\'itinerario, scarica l\'app mobile',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'length_unknown': 'Lunghezza sconosciuta',
    'steps': 'passi',
    'days': 'giorni',
    'climate': 'Clima',
    'itineraries': 'Itinerari',
    'description': 'Descrizione',
    'highlights': 'Punti salienti',
    'monthly_max_temperature': 'Temperatura massima mensile',
    'monthly_precipitation': 'Precipitazioni mensili',
    'temperature': 'Temperatura',
    'precipitation': 'Precipitazioni',
    'jan': 'Gen',
    'feb': 'Feb',
    'mar': 'Mar',
    'apr': 'Apr',
    'may': 'Mag',
    'jun': 'Giu',
    'jul': 'Lug',
    'aug': 'Ago',
    'sep': 'Set',
    'oct': 'Ott',
    'nov': 'Nov',
    'dec': 'Dic'
  },
  ja: {
    'overlanding': 'オーバーランディング',
    'carnet': 'カルネ',
    'overlanding_status': 'オーバーランディング状況',
    'carnet_requirements': 'カルネ要件',
    'border_status': '国境状況',
    'open': '開放',
    'restricted_access': 'アクセス制限',
    'war_dangerous': '危険',
    'forbidden': '禁止',
    'unknown': '不明',
    'not_required': '不要',
    'required_in_some_situations': '一部の状況で必要',
    'mandatory': '必須',
    'access_forbidden': 'アクセス禁止',
    'restricted': '制限',
    'closed': '閉鎖',
    'loading_map': 'マップを読み込み中...',
    'visa': 'ビザ',
    'driving': '運転',
    'left': '左',
    'right': '右',
    'zoom_to_location': '場所にズーム',
    'borders': '国境',
    'border_posts': '国境検問所',
    'adjacent_countries': '隣接国',
    'countries': '国',
    'bilateral': '二国間',
    'restrictions_apply': '制限が適用されます',
    'temporary_closed': '一時閉鎖',
    'zones': 'ゾーン',
    'restricted_areas': '制限区域',
    'zone_closed': '閉鎖',
    'zone_guide_escort': 'ガイド/エスコート必要',
    'zone_permit': '許可証必要',
    'zone_restrictions': '制限が適用されます',
    'disclaimer_title': '旅行免責事項とプライバシー通知',
    'disclaimer_message': 'このウェブサイトで提供される情報は、一般的なガイダンスのみを目的としています。コンテンツが正確で完全かつ最新であることを確保するためにあらゆる努力をしていますが、その正確性や現在の有効性を保証することはできません。旅行条件、ビザ要件、国境規制は予告なくいつでも変更される可能性があります。すべての情報を公式ソースで確認し、旅行の決定を行う際には自分の判断を行使する責任があります。すべての旅行は自己責任で行われます。',
    'gdpr_title': 'プライバシーとデータ保護',
    'gdpr_message': '私たちは、あなたの体験を向上させ、設定（言語設定など）を記憶するために、必須のクッキーとローカルストレージを使用しています。個人データは収集せず、トラッキングクッキーは使用していません。このサイトを継続して使用することで、必須のクッキーとローカルストレージの使用に同意したものとみなされます。',
    'disclaimer_accept': '同意して続行',
    'track_pack': 'トラックパック',
    'itinerary_app_promotion': '詳細情報、旅程の詳細なステップをダウンロードして探索するには、モバイルアプリをダウンロードしてください',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'length_unknown': '長さ不明',
    'steps': 'ステップ',
    'days': '日',
    'climate': '気候',
    'itineraries': '旅程',
    'description': '説明',
    'highlights': 'ハイライト',
    'monthly_max_temperature': '月間最高気温',
    'monthly_precipitation': '月間降水量',
    'temperature': '気温',
    'precipitation': '降水量',
    'jan': '1月',
    'feb': '2月',
    'mar': '3月',
    'apr': '4月',
    'may': '5月',
    'jun': '6月',
    'jul': '7月',
    'aug': '8月',
    'sep': '9月',
    'oct': '10月',
    'nov': '11月',
    'dec': '12月'
  },
  nl: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Overlanding Status',
    'carnet_requirements': 'Carnet Vereisten',
    'border_status': 'Grens Status',
    'open': 'Open',
    'restricted_access': 'Beperkte toegang',
    'war_dangerous': 'Onveilig',
    'forbidden': 'Verboden',
    'unknown': 'Onbekend',
    'not_required': 'Niet vereist',
    'required_in_some_situations': 'Vereist in sommige situaties',
    'mandatory': 'Verplicht',
    'access_forbidden': 'Toegang verboden',
    'restricted': 'Beperkt',
    'closed': 'Gesloten',
    'loading_map': 'Kaart laden...',
    'visa': 'Visum',
    'driving': 'Rijden',
    'left': 'Links',
    'right': 'Rechts',
    'zoom_to_location': 'Zoom naar locatie',
    'borders': 'Grenzen',
    'border_posts': 'Grensposten',
    'adjacent_countries': 'Aangrenzende landen',
    'countries': 'Landen',
    'bilateral': 'Bilateraal',
    'restrictions_apply': 'Beperkingen van toepassing',
    'temporary_closed': 'Tijdelijk gesloten',
    'zones': 'Zones',
    'restricted_areas': 'Beperkte gebieden',
    'zone_closed': 'Gesloten',
    'zone_guide_escort': 'Gids/Begeleiding vereist',
    'zone_permit': 'Vergunning vereist',
    'zone_restrictions': 'Beperkingen van toepassing',
    'disclaimer_title': 'Reis Disclaimer & Privacyverklaring',
    'disclaimer_message': 'De informatie op deze website is alleen bedoeld voor algemene begeleiding. Hoewel we er alles aan doen om ervoor te zorgen dat de inhoud accuraat, compleet en up-to-date is, kunnen we de juistheid of huidige geldigheid ervan niet garanderen. Reisomstandigheden, visumvereisten en grensreglementen kunnen op elk moment zonder kennisgeving veranderen. U bent verantwoordelijk voor het verifiëren van alle informatie bij officiële bronnen en voor het gebruiken van uw eigen oordeel bij het nemen van reisbeslissingen. Alle reizen worden ondernomen op eigen risico.',
    'gdpr_title': 'Privacy & Gegevensbescherming',
    'gdpr_message': 'We gebruiken essentiële cookies en lokale opslag om uw ervaring te verbeteren en uw voorkeuren (zoals taalinstellingen) te onthouden. We verzamelen geen persoonlijke gegevens en gebruiken geen tracking cookies. Door deze site te blijven gebruiken, stemt u in met ons gebruik van essentiële cookies en lokale opslag.',
    'disclaimer_accept': 'Accepteren & Doorgaan',
    'track_pack': 'Track Pack',
    'itinerary_app_promotion': 'Voor meer informatie, om de gedetailleerde stappen van de route te downloaden en te verkennen, download de mobiele app',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'length_unknown': 'Lengte onbekend',
    'steps': 'stappen',
    'days': 'dagen',
    'climate': 'Klimaat',
    'itineraries': 'Reisroutes',
    'description': 'Beschrijving',
    'highlights': 'Hoogtepunten',
    'monthly_max_temperature': 'Maandelijkse maximumtemperatuur',
    'monthly_precipitation': 'Maandelijkse neerslag',
    'temperature': 'Temperatuur',
    'precipitation': 'Neerslag',
    'jan': 'Jan',
    'feb': 'Feb',
    'mar': 'Mrt',
    'apr': 'Apr',
    'may': 'Mei',
    'jun': 'Jun',
    'jul': 'Jul',
    'aug': 'Aug',
    'sep': 'Sep',
    'oct': 'Okt',
    'nov': 'Nov',
    'dec': 'Dec'
  },
  ru: {
    'overlanding': 'Оверлендинг',
    'carnet': 'Карне',
    'overlanding_status': 'Статус оверлендинга',
    'carnet_requirements': 'Требования карне',
    'border_status': 'Статус границы',
    'open': 'Открыто',
    'restricted_access': 'Ограниченный доступ',
    'war_dangerous': 'Небезопасно',
    'forbidden': 'Запрещено',
    'unknown': 'Неизвестно',
    'not_required': 'Не требуется',
    'required_in_some_situations': 'Требуется в некоторых ситуациях',
    'mandatory': 'Обязательно',
    'access_forbidden': 'Доступ запрещен',
    'restricted': 'Ограничено',
    'closed': 'Закрыто',
    'loading_map': 'Загрузка карты...',
    'visa': 'Виза',
    'driving': 'Вождение',
    'left': 'Левостороннее',
    'right': 'Правостороннее',
    'zoom_to_location': 'Увеличить до местоположения',
    'borders': 'Границы',
    'border_posts': 'Пограничные посты',
    'adjacent_countries': 'Соседние страны',
    'countries': 'Страны',
    'bilateral': 'Двусторонний',
    'restrictions_apply': 'Применяются ограничения',
    'temporary_closed': 'Временно закрыто',
    'zones': 'Зоны',
    'restricted_areas': 'Запретные зоны',
    'zone_closed': 'Закрыто',
    'zone_guide_escort': 'Требуется гид/сопровождение',
    'zone_permit': 'Требуется разрешение',
    'zone_restrictions': 'Применяются ограничения',
    'disclaimer_title': 'Отказ от ответственности за путешествие и Уведомление о конфиденциальности',
    'disclaimer_message': 'Информация, представленная на этом веб-сайте, предназначена только для общего руководства. Хотя мы прилагаем все усилия для обеспечения точности, полноты и актуальности контента, мы не можем гарантировать его правильность или текущую действительность. Условия путешествий, визовые требования и пограничные правила могут измениться в любое время без предварительного уведомления. Вы несете ответственность за проверку всей информации в официальных источниках и за использование собственного суждения при принятии решений о путешествиях. Все путешествия предпринимаются на ваш собственный риск.',
    'gdpr_title': 'Конфиденциальность и Защита данных',
    'gdpr_message': 'Мы используем необходимые файлы cookie и локальное хранилище для улучшения вашего опыта и запоминания ваших предпочтений (таких как языковые настройки). Мы не собираем личные данные и не используем отслеживающие файлы cookie. Продолжая использовать этот сайт, вы соглашаетесь на наше использование необходимых файлов cookie и локального хранилища.',
    'disclaimer_accept': 'Принять и Продолжить',
    'track_pack': 'Трек Пак',
    'itinerary_app_promotion': 'Для получения дополнительной информации, чтобы загрузить и изучить подробные шаги маршрута, загрузите мобильное приложение',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'length_unknown': 'Длина неизвестна',
    'steps': 'шагов',
    'days': 'дней',
    'climate': 'Климат',
    'itineraries': 'Маршруты',
    'description': 'Описание',
    'highlights': 'Основные моменты',
    'monthly_max_temperature': 'Месячная максимальная температура',
    'monthly_precipitation': 'Месячные осадки',
    'temperature': 'Температура',
    'precipitation': 'Осадки',
    'jan': 'Янв',
    'feb': 'Фев',
    'mar': 'Мар',
    'apr': 'Апр',
    'may': 'Май',
    'jun': 'Июн',
    'jul': 'Июл',
    'aug': 'Авг',
    'sep': 'Сен',
    'oct': 'Окт',
    'nov': 'Ноя',
    'dec': 'Дек'
  },
  zh: {
    'overlanding': '越野旅行',
    'carnet': '通行证',
    'overlanding_status': '越野旅行状态',
    'carnet_requirements': '通行证要求',
    'border_status': '边境状态',
    'open': '开放',
    'restricted_access': '限制访问',
    'war_dangerous': '不安全',
    'forbidden': '禁止',
    'unknown': '未知',
    'not_required': '不需要',
    'required_in_some_situations': '某些情况下需要',
    'mandatory': '强制性',
    'access_forbidden': '禁止访问',
    'restricted': '受限',
    'closed': '关闭',
    'loading_map': '正在加载地图...',
    'visa': '签证',
    'driving': '驾驶',
    'left': '左侧',
    'right': '右侧',
    'zoom_to_location': '缩放到位置',
    'borders': '边界',
    'border_posts': '边境哨所',
    'adjacent_countries': '邻国',
    'countries': '国家',
    'bilateral': '双边',
    'restrictions_apply': '适用限制',
    'temporary_closed': '暂时关闭',
    'zones': '区域',
    'restricted_areas': '限制区域',
    'zone_closed': '关闭',
    'zone_guide_escort': '需要向导/护送',
    'zone_permit': '需要许可证',
    'zone_restrictions': '适用限制',
    'disclaimer_title': '旅行免责声明和隐私声明',
    'disclaimer_message': '本网站提供的信息仅供一般指导。虽然我们尽一切努力确保内容准确、完整和最新，但我们不能保证其正确性或当前有效性。旅行条件、签证要求和边境法规可能随时更改，恕不另行通知。您有责任通过官方渠道核实所有信息，并在做出旅行决定时运用自己的判断。所有旅行均由您自担风险。',
    'gdpr_title': '隐私和数据保护',
    'gdpr_message': '我们使用必要的cookie和本地存储来改善您的体验并记住您的偏好（如语言设置）。我们不收集个人数据，也不使用跟踪cookie。继续使用本网站即表示您同意我们使用必要的cookie和本地存储。',
    'disclaimer_accept': '接受并继续',
    'track_pack': '路线包',
    'itinerary_app_promotion': '如需更多信息，下载并探索行程的详细步骤，请下载移动应用',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'length_unknown': '长度未知',
    'steps': '步骤',
    'days': '天',
    'climate': '气候',
    'itineraries': '行程',
    'description': '描述',
    'highlights': '亮点',
    'monthly_max_temperature': '月最高气温',
    'monthly_precipitation': '月降水量',
    'temperature': '气温',
    'precipitation': '降水量',
    'jan': '1月',
    'feb': '2月',
    'mar': '3月',
    'apr': '4月',
    'may': '5月',
    'jun': '6月',
    'jul': '7月',
    'aug': '8月',
    'sep': '9月',
    'oct': '10月',
    'nov': '11月',
    'dec': '12月'
  }
}

/**
 * Get translated interface label
 */
export function getTranslatedLabel(
  key: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  return INTERFACE_TRANSLATIONS[language]?.[key] || INTERFACE_TRANSLATIONS[DEFAULT_LANGUAGE][key] || key
}

/**
 * Get translated month abbreviations
 */
export function getTranslatedMonths(language: SupportedLanguage = DEFAULT_LANGUAGE): string[] {
  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  return monthKeys.map(key => getTranslatedLabel(key, language))
}

/**
 * Get translated field value with fallback chain
 * This is a generic utility that handles the translation lookup logic for any field
 */
export function getTranslatedField(
  data: any,
  fieldName: string,
  translationFieldName: string,
  language: SupportedLanguage
): string | null {
  if (!data) {
    return null
  }

  // Check both direct field access and parameters field access for flexibility
  const directTranslations = data[translationFieldName]
  const parametersTranslations = data.parameters?.[translationFieldName]
  const translations = directTranslations || parametersTranslations

  // If translation map exists and is valid, try to get the translation for the selected language
  if (translations && typeof translations === 'object' && translations[language]) {
    return translations[language]
  }

  // Fallback to original field value (check both locations)
  const directField = data[fieldName]
  const parametersField = data.parameters?.[fieldName]
  const originalValue = directField || parametersField

  return originalValue || null
}

/**
 * Get translated comment from country data
 */
export function getTranslatedComment(
  countryData: CountryData,
  language: SupportedLanguage
): string | null {
  return getTranslatedField(countryData, 'comment', 'comment_translations', language)
}

/**
 * Get translated visa comment from country data
 */
export function getTranslatedVisaComment(
  countryData: CountryData,
  language: SupportedLanguage
): string | null {
  return getTranslatedField(countryData, 'visa_comment', 'visa_comment_translations', language)
}

/**
 * Get translated insurance comment from country data
 */
export function getTranslatedInsuranceComment(
  countryData: CountryData,
  language: SupportedLanguage
): string | null {
  return getTranslatedField(countryData, 'insurance_comment', 'insurance_comment_translations', language)
}

/**
 * Get translated tip from country data
 */
export function getTranslatedTip(
  countryData: CountryData,
  language: SupportedLanguage
): string | null {
  return getTranslatedField(countryData, 'tip', 'tip_translations', language)
}

/**
 * Get translated stay duration from country data
 */
export function getTranslatedStayDuration(
  countryData: CountryData,
  language: SupportedLanguage
): string | null {
  return getTranslatedField(countryData, 'stay_duration', 'stay_duration_translations', language)
}