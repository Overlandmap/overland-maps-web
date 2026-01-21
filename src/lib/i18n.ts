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
 * Translation dictionary for visa status
 */
const VISA_STATUS_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'no_visa_required': 'No visa required',
    'visa_on_arrival': 'Visa at the border (VOA)',
    'evisa_online': 'e-visa available online',
    'visa_at_embassy': 'Visa can be obtained at an embassy',
    'visa_difficult': 'Visa is difficult to get',
    'unknown': 'Unknown'
  },
  de: {
    'no_visa_required': 'Kein Visum erforderlich',
    'visa_on_arrival': 'Visum an der Grenze (VOA)',
    'evisa_online': 'e-Visum online verfügbar',
    'visa_at_embassy': 'Visum kann bei einer Botschaft erhalten werden',
    'visa_difficult': 'Visum ist schwer zu bekommen',
    'unknown': 'Unbekannt'
  },
  es: {
    'no_visa_required': 'No se requiere visa',
    'visa_on_arrival': 'Visa en la frontera (VOA)',
    'evisa_online': 'e-visa disponible en línea',
    'visa_at_embassy': 'La visa se puede obtener en una embajada',
    'visa_difficult': 'La visa es difícil de obtener',
    'unknown': 'Desconocido'
  },
  fr: {
    'no_visa_required': 'Aucun visa requis',
    'visa_on_arrival': 'Visa à la frontière (VOA)',
    'evisa_online': 'e-visa disponible en ligne',
    'visa_at_embassy': 'Le visa peut être obtenu auprès d\'une ambassade',
    'visa_difficult': 'Le visa est difficile à obtenir',
    'unknown': 'Inconnu'
  },
  it: {
    'no_visa_required': 'Nessun visto richiesto',
    'visa_on_arrival': 'Visto alla frontiera (VOA)',
    'evisa_online': 'e-visto disponibile online',
    'visa_at_embassy': 'Il visto può essere ottenuto presso un\'ambasciata',
    'visa_difficult': 'Il visto è difficile da ottenere',
    'unknown': 'Sconosciuto'
  },
  ja: {
    'no_visa_required': 'ビザ不要',
    'visa_on_arrival': '国境でビザ取得可能（VOA）',
    'evisa_online': 'オンラインでe-ビザ取得可能',
    'visa_at_embassy': '大使館でビザを取得できます',
    'visa_difficult': 'ビザの取得が困難',
    'unknown': '不明'
  },
  nl: {
    'no_visa_required': 'Geen visum vereist',
    'visa_on_arrival': 'Visum aan de grens (VOA)',
    'evisa_online': 'e-visum online beschikbaar',
    'visa_at_embassy': 'Visum kan bij een ambassade worden verkregen',
    'visa_difficult': 'Visum is moeilijk te verkrijgen',
    'unknown': 'Onbekend'
  },
  ru: {
    'no_visa_required': 'Виза не требуется',
    'visa_on_arrival': 'Виза на границе (VOA)',
    'evisa_online': 'Электронная виза доступна онлайн',
    'visa_at_embassy': 'Визу можно получить в посольстве',
    'visa_difficult': 'Визу сложно получить',
    'unknown': 'Неизвестно'
  },
  zh: {
    'no_visa_required': '无需签证',
    'visa_on_arrival': '落地签（VOA）',
    'evisa_online': '可在线申请电子签证',
    'visa_at_embassy': '可在大使馆获得签证',
    'visa_difficult': '签证难以获得',
    'unknown': '未知'
  }
}

/**
 * Get translated visa status
 */
export function getTranslatedVisaStatus(
  visa: number | null | undefined,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  if (visa === null || visa === undefined || visa === 0) {
    return VISA_STATUS_TRANSLATIONS[language]?.no_visa_required || VISA_STATUS_TRANSLATIONS[DEFAULT_LANGUAGE].no_visa_required
  }
  
  const numValue = Number(visa)
  
  if (isNaN(numValue)) {
    return VISA_STATUS_TRANSLATIONS[language]?.unknown || VISA_STATUS_TRANSLATIONS[DEFAULT_LANGUAGE].unknown
  }
  
  let key: string
  switch (numValue) {
    case 1:
      key = 'visa_on_arrival'
      break
    case 2:
      key = 'evisa_online'
      break
    case 3:
      key = 'visa_at_embassy'
      break
    case 4:
      key = 'visa_difficult'
      break
    default:
      key = 'unknown'
  }
  
  return VISA_STATUS_TRANSLATIONS[language]?.[key] || VISA_STATUS_TRANSLATIONS[DEFAULT_LANGUAGE][key]
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
    'crossing_between': 'Crossing between {country1} and {country2}',
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
    'vehicle': 'Vehicle',
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
    'border_post_app_promotion': 'To discuss the status or describe the crossing of this border post, open the mobile app and create an account',
    'country_app_promotion': 'Discuss the visa and vehicle requirements in the mobile app',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'nav_map': 'Map',
    'nav_about': 'About',
    'nav_contact': 'Contact',
    'nav_app': 'App',
    'nav_faq': 'FAQ',
    'nav_support': 'Support',
    'nav_menu': 'Menu',
    'nav_close_menu': 'Close menu',
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
    'status_explanations': 'Status Explanations',
    'requirements_explanations': 'Requirements Explanations',
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
    'dec': 'Dec',
    'general': 'General',
    'capital': 'Capital',
    'currency': 'Currency',
    'comment': 'Comment',
    'visa_comment': 'Visa Comment',
    'visa_url': 'Visa URL',
    'official_website': 'Official website',
    'carnet_comment': 'Carnet Comment',
    'tip': 'Tip',
    'tip_label': 'TIP (temporary import permit)',
    'tip_comment': 'Tip Comment',
    'stay_duration': 'Stay Duration',
    'maximum_stay': 'Maximum stay',
    'insurance': 'Insurance',
    'insurance_comment': 'Insurance Comment',
    'insurance_url': 'Insurance URL',
    'insurance_system': 'Insurance system',
    'no_borders': 'No borders available',
    'data_coming_soon': 'Data is coming, come back later...',
    'onboarding_tooltip_title': 'Explore Different Map Layers',
    'onboarding_tooltip_message': 'Tap the button above to switch between different map layers: overland friendliness, carnet requirements, climate and itineraries.',
    'onboarding_tooltip_got_it': 'Got it!',
    'help_button_title': 'Layer Information',
    'help_overlanding_title': 'Overlanding Friendliness',
    'help_overlanding_text': 'Shows how easy it is to visit each country as an overlander. Green indicates normal access (easy) - you only need proper visa and standard vehicle paperwork. Black means it is (almost) impossible to visit the country with a motor vehicle, though it may be possible on foot or by bicycle.',
    'help_carnet_title': 'Carnet Requirements',
    'help_carnet_text': 'Shows which countries require a Carnet de Passage en Douane, a document provided by your local automobile club that, in exchange for a large refundable deposit, allows you to enter the country without paying import taxes. This represents the on-the-ground reality, which differs from what "official" websites state, as they often contain outdated information. Use the mobile app to log in and discuss the current situation, which will eventually be reflected here when it changes.',
    'help_climate_title': 'Climate Data',
    'help_climate_text': 'Displays monthly maximum temperatures and precipitation, averaged over the last 50 years. This gives you an indication of which season is best suited for travel in different parts of the world.',
    'help_itineraries_title': 'Itineraries',
    'help_itineraries_text': 'A selection of detailed itineraries specifically crafted for overlanders are available to test and download in the mobile app (purchase optional).'
  },
  de: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Overlanding-Status',
    'carnet_requirements': 'Carnet-Anforderungen',
    'border_status': 'Grenzstatus',
    'crossing_between': 'Grenzübergang zwischen {country1} und {country2}',
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
    'vehicle': 'Fahrzeug',
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
    'border_post_app_promotion': 'Um den Status zu diskutieren oder die Überquerung dieses Grenzpostens zu beschreiben, öffnen Sie die mobile App und erstellen Sie ein Konto',
    'country_app_promotion': 'Diskutieren Sie die Visa- und Fahrzeuganforderungen in der mobilen App',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'nav_map': 'Karte',
    'nav_about': 'Über',
    'nav_contact': 'Kontakt',
    'nav_app': 'App',
    'nav_faq': 'FAQ',
    'nav_support': 'Unterstützung',
    'nav_menu': 'Menü',
    'nav_close_menu': 'Menü schließen',
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
    'status_explanations': 'Status-Erklärungen',
    'requirements_explanations': 'Anforderungs-Erklärungen',
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
    'dec': 'Dez',
    'general': 'Allgemein',
    'capital': 'Hauptstadt',
    'currency': 'Währung',
    'comment': 'Kommentar',
    'visa_comment': 'Visum-Kommentar',
    'visa_url': 'Visum-URL',
    'official_website': 'Offizielle Website',
    'carnet_comment': 'Carnet-Kommentar',
    'tip': 'Tipp',
    'tip_label': 'TIP (vorübergehende Einfuhrgenehmigung)',
    'tip_comment': 'Tipp-Kommentar',
    'stay_duration': 'Aufenthaltsdauer',
    'maximum_stay': 'Maximale Aufenthaltsdauer',
    'insurance': 'Versicherung',
    'insurance_comment': 'Versicherungs-Kommentar',
    'insurance_url': 'Versicherungs-URL',
    'insurance_system': 'Versicherungssystem',
    'no_borders': 'Keine Grenzen verfügbar',
    'data_coming_soon': 'Daten kommen bald, schauen Sie später vorbei...',
    'onboarding_tooltip_title': 'Verschiedene Kartenebenen erkunden',
    'onboarding_tooltip_message': 'Tippen Sie auf die Schaltfläche oben, um zwischen verschiedenen Kartenebenen zu wechseln: Overland-Freundlichkeit, Carnet-Anforderungen, Klima und Reiserouten.',
    'onboarding_tooltip_got_it': 'Verstanden!',
    'help_button_title': 'Ebeneninformationen',
    'help_overlanding_title': 'Overlanding-Freundlichkeit',
    'help_overlanding_text': 'Zeigt, wie einfach es ist, jedes Land als Overlander zu besuchen. Grün bedeutet normaler Zugang (einfach) - Sie benötigen nur ein ordnungsgemäßes Visum und Standardfahrzeugpapiere. Schwarz bedeutet, dass es (fast) unmöglich ist, das Land mit einem Kraftfahrzeug zu besuchen, obwohl es zu Fuß oder mit dem Fahrrad möglich sein kann.',
    'help_carnet_title': 'Carnet-Anforderungen',
    'help_carnet_text': 'Zeigt, welche Länder ein Carnet de Passage en Douane benötigen, ein Dokument Ihres lokalen Automobilclubs, das Ihnen im Austausch gegen eine große rückzahlbare Kaution ermöglicht, das Land ohne Zahlung von Einfuhrsteuern zu betreten. Dies spiegelt die Realität vor Ort wider, die sich von den "offiziellen" Websites unterscheidet, da diese oft veraltete Informationen enthalten. Nutzen Sie die mobile App, um sich anzumelden und die aktuelle Situation zu diskutieren, die hier schließlich widergespiegelt wird, wenn sie sich ändert.',
    'help_climate_title': 'Klimadaten',
    'help_climate_text': 'Zeigt monatliche Höchsttemperaturen und Niederschläge, gemittelt über die letzten 50 Jahre. Dies gibt Ihnen einen Hinweis darauf, welche Jahreszeit am besten für Reisen in verschiedenen Teilen der Welt geeignet ist.',
    'help_itineraries_title': 'Reiserouten',
    'help_itineraries_text': 'Eine Auswahl detaillierter Reiserouten, speziell für Overlander erstellt, sind in der mobilen App zum Testen und Herunterladen verfügbar (Kauf optional).'
  },
  es: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Estado de Overlanding',
    'carnet_requirements': 'Requisitos de Carnet',
    'border_status': 'Estado de Frontera',
    'crossing_between': 'Cruce entre {country1} y {country2}',
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
    'vehicle': 'Vehículo',
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
    'border_post_app_promotion': 'Para discutir el estado o describir el cruce de este puesto fronterizo, abre la aplicación móvil y crea una cuenta',
    'country_app_promotion': 'Discute los requisitos de visa y vehículo en la aplicación móvil',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'nav_map': 'Mapa',
    'nav_about': 'Acerca de',
    'nav_contact': 'Contacto',
    'nav_app': 'App',
    'nav_faq': 'Preguntas frecuentes',
    'nav_support': 'Soporte',
    'nav_menu': 'Menú',
    'nav_close_menu': 'Cerrar menú',
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
    'status_explanations': 'Explicaciones de Estado',
    'requirements_explanations': 'Explicaciones de Requisitos',
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
    'dec': 'Dic',
    'general': 'General',
    'capital': 'Capital',
    'currency': 'Moneda',
    'comment': 'Comentario',
    'visa_comment': 'Comentario de Visa',
    'visa_url': 'URL de Visa',
    'official_website': 'Sitio web oficial',
    'carnet_comment': 'Comentario de Carnet',
    'tip': 'Consejo',
    'tip_label': 'TIP (permiso de importación temporal)',
    'tip_comment': 'Comentario de Consejo',
    'stay_duration': 'Duración de Estancia',
    'maximum_stay': 'Estancia máxima',
    'insurance': 'Seguro',
    'insurance_comment': 'Comentario de Seguro',
    'insurance_url': 'URL de Seguro',
    'insurance_system': 'Sistema de seguro',
    'no_borders': 'No hay fronteras disponibles',
    'data_coming_soon': 'Los datos están llegando, vuelve más tarde...',
    'onboarding_tooltip_title': 'Explora diferentes capas del mapa',
    'onboarding_tooltip_message': 'Toca el botón de arriba para cambiar entre diferentes capas del mapa: facilidad para overland, requisitos de carnet, clima e itinerarios.',
    'onboarding_tooltip_got_it': '¡Entendido!',
    'help_button_title': 'Información de Capas',
    'help_overlanding_title': 'Facilidad para Overlanding',
    'help_overlanding_text': 'Muestra qué tan fácil es visitar cada país como overlander. Verde indica acceso normal (fácil) - solo necesitas visa adecuada y documentación vehicular estándar. Negro significa que es (casi) imposible visitar el país con un vehículo motorizado, aunque puede ser posible a pie o en bicicleta.',
    'help_carnet_title': 'Requisitos de Carnet',
    'help_carnet_text': 'Muestra qué países requieren un Carnet de Passage en Douane, un documento proporcionado por tu club automovilístico local que, a cambio de un gran depósito reembolsable, te permite ingresar al país sin pagar impuestos de importación. Esto representa la realidad sobre el terreno, que difiere de lo que dicen los sitios web "oficiales", ya que a menudo contienen información desactualizada. Usa la aplicación móvil para iniciar sesión y discutir la situación actual, que eventualmente se reflejará aquí cuando cambie.',
    'help_climate_title': 'Datos Climáticos',
    'help_climate_text': 'Muestra temperaturas máximas mensuales y precipitaciones, promediadas durante los últimos 50 años. Esto te da una indicación de qué temporada es más adecuada para viajar en diferentes partes del mundo.',
    'help_itineraries_title': 'Itinerarios',
    'help_itineraries_text': 'Una selección de itinerarios detallados específicamente diseñados para overlanders están disponibles para probar y descargar en la aplicación móvil (compra opcional).'
  },
  fr: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Statut Overlanding',
    'carnet_requirements': 'Exigences Carnet',
    'border_status': 'Statut de Frontière',
    'crossing_between': 'Passage entre {country1} et {country2}',
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
    'vehicle': 'Véhicule',
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
    'border_post_app_promotion': 'Pour discuter du statut ou décrire le passage de ce poste frontière, ouvrez l\'application mobile et créez un compte',
    'country_app_promotion': 'Discutez des exigences de visa et de véhicule dans l\'application mobile',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'nav_map': 'Carte',
    'nav_about': 'À propos',
    'nav_contact': 'Contact',
    'nav_app': 'App',
    'nav_faq': 'FAQ',
    'nav_support': 'Support',
    'nav_menu': 'Menu',
    'nav_close_menu': 'Fermer le menu',
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
    'status_explanations': 'Explications des Statuts',
    'requirements_explanations': 'Explications des Exigences',
    'jan': 'Jan',
    'feb': 'Fév',
    'mar': 'Mar',
    'apr': 'Avr',
    'may': 'Mai',
    'jun': 'Juin',
    'jul': 'Juil',
    'aug': 'Août',
    'sep': 'Sep',
    'oct': 'Oct',
    'nov': 'Nov',
    'dec': 'Déc',
    'general': 'Général',
    'capital': 'Capitale',
    'currency': 'Monnaie',
    'comment': 'Commentaire',
    'visa_comment': 'Commentaire Visa',
    'visa_url': 'URL Visa',
    'official_website': 'Site officiel',
    'carnet_comment': 'Commentaire Carnet',
    'tip': 'Conseil',
    'tip_label': 'TIP (permis d\'importation temporaire)',
    'tip_comment': 'Commentaire Conseil',
    'stay_duration': 'Durée de Séjour',
    'maximum_stay': 'Séjour maximum',
    'insurance': 'Assurance',
    'insurance_comment': 'Commentaire Assurance',
    'insurance_url': 'URL Assurance',
    'insurance_system': 'Système d\'assurance',
    'no_borders': 'Aucune frontière disponible',
    'data_coming_soon': 'Les données arrivent, revenez plus tard...',
    'onboarding_tooltip_title': 'Explorez différentes couches de carte',
    'onboarding_tooltip_message': 'Appuyez sur le bouton ci-dessus pour basculer entre différentes couches de carte : facilité d\'overland, exigences carnet, climat et itinéraires.',
    'onboarding_tooltip_got_it': 'Compris !',
    'help_button_title': 'Informations sur les Couches',
    'help_overlanding_title': 'Facilité d\'Overlanding',
    'help_overlanding_text': 'Montre à quel point il est facile de visiter chaque pays en tant qu\'overlander. Le vert indique un accès normal (facile) - vous n\'avez besoin que d\'un visa approprié et de documents véhicule standard. Le noir signifie qu\'il est (presque) impossible de visiter le pays avec un véhicule à moteur, bien que cela puisse être possible à pied ou à vélo.',
    'help_carnet_title': 'Exigences Carnet',
    'help_carnet_text': 'Montre quels pays nécessitent un Carnet de Passage en Douane, un document fourni par votre club automobile local qui, en échange d\'un dépôt important remboursable, vous permet d\'entrer dans le pays sans payer de taxes d\'importation. Cela représente la réalité sur le terrain, qui diffère de ce que disent les sites web "officiels", car ils contiennent souvent des informations obsolètes. Utilisez l\'application mobile pour vous connecter et discuter de la situation actuelle, qui sera finalement reflétée ici lorsqu\'elle changera.',
    'help_climate_title': 'Données Climatiques',
    'help_climate_text': 'Affiche les températures maximales mensuelles et les précipitations, moyennées sur les 50 dernières années. Cela vous donne une indication de la saison la mieux adaptée pour voyager dans différentes parties du monde.',
    'help_itineraries_title': 'Itinéraires',
    'help_itineraries_text': 'Une sélection d\'itinéraires détaillés spécialement conçus pour les overlanders sont disponibles pour tester et télécharger dans l\'application mobile (achat optionnel).'
  },
  it: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Stato Overlanding',
    'carnet_requirements': 'Requisiti Carnet',
    'border_status': 'Stato del Confine',
    'crossing_between': 'Attraversamento tra {country1} e {country2}',
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
    'vehicle': 'Veicolo',
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
    'border_post_app_promotion': 'Per discutere dello stato o descrivere l\'attraversamento di questo posto di frontiera, apri l\'app mobile e crea un account',
    'country_app_promotion': 'Discuti i requisiti di visto e veicolo nell\'app mobile',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'nav_map': 'Mappa',
    'nav_about': 'Chi siamo',
    'nav_contact': 'Contatto',
    'nav_app': 'App',
    'nav_faq': 'Domande frequenti',
    'nav_support': 'Supporto',
    'nav_menu': 'Menu',
    'nav_close_menu': 'Chiudi menu',
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
    'status_explanations': 'Spiegazioni dello Stato',
    'requirements_explanations': 'Spiegazioni dei Requisiti',
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
    'dec': 'Dic',
    'general': 'Generale',
    'capital': 'Capitale',
    'currency': 'Valuta',
    'comment': 'Commento',
    'visa_comment': 'Commento Visto',
    'visa_url': 'URL Visto',
    'official_website': 'Sito ufficiale',
    'carnet_comment': 'Commento Carnet',
    'tip': 'Suggerimento',
    'tip_label': 'TIP (permesso di importazione temporanea)',
    'tip_comment': 'Commento Suggerimento',
    'stay_duration': 'Durata del Soggiorno',
    'maximum_stay': 'Soggiorno massimo',
    'insurance': 'Assicurazione',
    'insurance_comment': 'Commento Assicurazione',
    'insurance_url': 'URL Assicurazione',
    'insurance_system': 'Sistema assicurativo',
    'no_borders': 'Nessun confine disponibile',
    'data_coming_soon': 'I dati stanno arrivando, torna più tardi...',
    'onboarding_tooltip_title': 'Esplora diversi livelli della mappa',
    'onboarding_tooltip_message': 'Tocca il pulsante sopra per passare tra diversi livelli della mappa: facilità di overland, requisiti carnet, clima e itinerari.',
    'onboarding_tooltip_got_it': 'Capito!',
    'help_button_title': 'Informazioni sui Livelli',
    'help_overlanding_title': 'Facilità di Overlanding',
    'help_overlanding_text': 'Mostra quanto è facile visitare ogni paese come overlander. Il verde indica accesso normale (facile) - hai solo bisogno di un visto appropriato e documenti del veicolo standard. Il nero significa che è (quasi) impossibile visitare il paese con un veicolo a motore, anche se potrebbe essere possibile a piedi o in bicicletta.',
    'help_carnet_title': 'Requisiti Carnet',
    'help_carnet_text': 'Mostra quali paesi richiedono un Carnet de Passage en Douane, un documento fornito dal tuo club automobilistico locale che, in cambio di un grande deposito rimborsabile, ti permette di entrare nel paese senza pagare tasse di importazione. Questo rappresenta la realtà sul campo, che differisce da ciò che dicono i siti web "ufficiali", poiché spesso contengono informazioni obsolete. Usa l\'app mobile per accedere e discutere della situazione attuale, che sarà eventualmente riflessa qui quando cambierà.',
    'help_climate_title': 'Dati Climatici',
    'help_climate_text': 'Visualizza le temperature massime mensili e le precipitazioni, mediate negli ultimi 50 anni. Questo ti dà un\'indicazione di quale stagione è più adatta per viaggiare in diverse parti del mondo.',
    'help_itineraries_title': 'Itinerari',
    'help_itineraries_text': 'Una selezione di itinerari dettagliati specificamente creati per overlanders sono disponibili per testare e scaricare nell\'app mobile (acquisto opzionale).'
  },
  ja: {
    'overlanding': 'オーバーランディング',
    'carnet': 'カルネ',
    'overlanding_status': 'オーバーランディング状況',
    'carnet_requirements': 'カルネ要件',
    'border_status': '国境状況',
    'crossing_between': '{country1}と{country2}の間の国境',
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
    'vehicle': '車両',
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
    'border_post_app_promotion': 'この国境検問所の状況について議論したり、通過について説明したりするには、モバイルアプリを開いてアカウントを作成してください',
    'country_app_promotion': 'モバイルアプリでビザと車両の要件について議論する',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'nav_map': 'マップ',
    'nav_about': 'について',
    'nav_contact': 'お問い合わせ',
    'nav_app': 'アプリ',
    'nav_faq': 'よくある質問',
    'nav_support': 'サポート',
    'nav_menu': 'メニュー',
    'nav_close_menu': 'メニューを閉じる',
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
    'status_explanations': 'ステータス説明',
    'requirements_explanations': '要件説明',
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
    'dec': '12月',
    'general': '一般',
    'capital': '首都',
    'currency': '通貨',
    'comment': 'コメント',
    'visa_comment': 'ビザコメント',
    'visa_url': 'ビザURL',
    'official_website': '公式ウェブサイト',
    'carnet_comment': 'カルネコメント',
    'tip': 'ヒント',
    'tip_label': 'TIP（一時輸入許可証）',
    'tip_comment': 'ヒントコメント',
    'stay_duration': '滞在期間',
    'maximum_stay': '最大滞在期間',
    'insurance': '保険',
    'insurance_comment': '保険コメント',
    'insurance_url': '保険URL',
    'insurance_system': '保険システム',
    'no_borders': '利用可能な国境がありません',
    'data_coming_soon': 'データは近日公開予定です。後でまたお越しください...',
    'onboarding_tooltip_title': '異なる地図レイヤーを探索',
    'onboarding_tooltip_message': '上のボタンをタップして、異なる地図レイヤーを切り替えます：オーバーランドの利便性、カルネ要件、気候、旅程。',
    'onboarding_tooltip_got_it': 'わかりました！',
    'help_button_title': 'レイヤー情報',
    'help_overlanding_title': 'オーバーランディングの利便性',
    'help_overlanding_text': '各国をオーバーランダーとして訪問することがどれだけ簡単かを示します。緑は通常のアクセス（簡単）を示します - 適切なビザと標準的な車両書類のみが必要です。黒は、自動車で国を訪問することが（ほぼ）不可能であることを意味しますが、徒歩や自転車では可能かもしれません。',
    'help_carnet_title': 'カルネ要件',
    'help_carnet_text': 'どの国がカルネ・ド・パッサージュ・アン・ドゥアーヌを必要とするかを示します。これは、地元の自動車クラブが提供する文書で、大きな返金可能な保証金と引き換えに、輸入税を支払わずに国に入国できます。これは現地の実情を表しており、「公式」ウェブサイトが述べていることとは異なります。それらはしばしば古い情報を含んでいます。モバイルアプリを使用してログインし、現在の状況について議論してください。それが変更されると、最終的にここに反映されます。',
    'help_climate_title': '気候データ',
    'help_climate_text': '過去50年間の平均月間最高気温と降水量を表示します。これにより、世界のさまざまな地域で旅行に最適な季節がわかります。',
    'help_itineraries_title': '旅程',
    'help_itineraries_text': 'オーバーランダー向けに特別に作成された詳細な旅程の選択は、モバイルアプリでテストおよびダウンロードできます（購入はオプション）。'
  },
  nl: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Overlanding Status',
    'carnet_requirements': 'Carnet Vereisten',
    'border_status': 'Grens Status',
    'crossing_between': 'Grensovergang tussen {country1} en {country2}',
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
    'vehicle': 'Voertuig',
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
    'border_post_app_promotion': 'Om de status te bespreken of de oversteek van deze grenspost te beschrijven, open de mobiele app en maak een account aan',
    'country_app_promotion': 'Bespreek de visum- en voertuigvereisten in de mobiele app',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'nav_map': 'Kaart',
    'nav_about': 'Over',
    'nav_contact': 'Contact',
    'nav_app': 'App',
    'nav_faq': 'Veelgestelde vragen',
    'nav_support': 'Ondersteuning',
    'nav_menu': 'Menu',
    'nav_close_menu': 'Menu sluiten',
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
    'status_explanations': 'Status Uitleg',
    'requirements_explanations': 'Vereisten Uitleg',
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
    'dec': 'Dec',
    'general': 'Algemeen',
    'capital': 'Hoofdstad',
    'currency': 'Valuta',
    'comment': 'Opmerking',
    'visa_comment': 'Visum Opmerking',
    'visa_url': 'Visum URL',
    'official_website': 'Officiële website',
    'carnet_comment': 'Carnet Opmerking',
    'tip': 'Tip',
    'tip_label': 'TIP (tijdelijke invoervergunning)',
    'tip_comment': 'Tip Opmerking',
    'stay_duration': 'Verblijfsduur',
    'maximum_stay': 'Maximaal verblijf',
    'insurance': 'Verzekering',
    'insurance_comment': 'Verzekering Opmerking',
    'insurance_url': 'Verzekering URL',
    'insurance_system': 'Verzekeringssysteem',
    'no_borders': 'Geen grenzen beschikbaar',
    'data_coming_soon': 'Gegevens komen eraan, kom later terug...',
    'onboarding_tooltip_title': 'Verken verschillende kaartlagen',
    'onboarding_tooltip_message': 'Tik op de knop hierboven om te schakelen tussen verschillende kaartlagen: overland-vriendelijkheid, carnet-vereisten, klimaat en reisroutes.',
    'onboarding_tooltip_got_it': 'Begrepen!',
    'help_button_title': 'Laaginformatie',
    'help_overlanding_title': 'Overlanding-vriendelijkheid',
    'help_overlanding_text': 'Toont hoe gemakkelijk het is om elk land als overlander te bezoeken. Groen geeft normale toegang aan (gemakkelijk) - je hebt alleen een juist visum en standaard voertuigdocumenten nodig. Zwart betekent dat het (bijna) onmogelijk is om het land met een motorvoertuig te bezoeken, hoewel het te voet of per fiets mogelijk kan zijn.',
    'help_carnet_title': 'Carnet Vereisten',
    'help_carnet_text': 'Toont welke landen een Carnet de Passage en Douane vereisen, een document verstrekt door je lokale automobielclub dat, in ruil voor een grote terugbetaalbare borg, je toestaat het land binnen te komen zonder invoerbelasting te betalen. Dit vertegenwoordigt de realiteit ter plaatse, die verschilt van wat "officiële" websites zeggen, omdat ze vaak verouderde informatie bevatten. Gebruik de mobiele app om in te loggen en de huidige situatie te bespreken, die uiteindelijk hier zal worden weergegeven wanneer deze verandert.',
    'help_climate_title': 'Klimaatgegevens',
    'help_climate_text': 'Toont maandelijkse maximumtemperaturen en neerslag, gemiddeld over de afgelopen 50 jaar. Dit geeft je een indicatie van welk seizoen het beste geschikt is om te reizen in verschillende delen van de wereld.',
    'help_itineraries_title': 'Reisroutes',
    'help_itineraries_text': 'Een selectie van gedetailleerde reisroutes speciaal gemaakt voor overlanders zijn beschikbaar om te testen en te downloaden in de mobiele app (aankoop optioneel).'
  },
  ru: {
    'overlanding': 'Оверлендинг',
    'carnet': 'Карне',
    'overlanding_status': 'Статус оверлендинга',
    'carnet_requirements': 'Требования карне',
    'border_status': 'Статус границы',
    'crossing_between': 'Переход между {country1} и {country2}',
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
    'vehicle': 'Транспорт',
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
    'border_post_app_promotion': 'Чтобы обсудить статус или описать пересечение этого пограничного пункта, откройте мобильное приложение и создайте учетную запись',
    'country_app_promotion': 'Обсудите требования к визе и транспортному средству в мобильном приложении',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'nav_map': 'Карта',
    'nav_about': 'О нас',
    'nav_contact': 'Контакт',
    'nav_app': 'Приложение',
    'nav_faq': 'Часто задаваемые вопросы',
    'nav_support': 'Поддержка',
    'nav_menu': 'Меню',
    'nav_close_menu': 'Закрыть меню',
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
    'status_explanations': 'Объяснения Статуса',
    'requirements_explanations': 'Объяснения Требований',
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
    'dec': 'Дек',
    'general': 'Общее',
    'capital': 'Столица',
    'currency': 'Валюта',
    'comment': 'Комментарий',
    'visa_comment': 'Комментарий к визе',
    'visa_url': 'URL визы',
    'official_website': 'Официальный сайт',
    'carnet_comment': 'Комментарий к карне',
    'tip': 'Совет',
    'tip_label': 'TIP (разрешение на временный ввоз)',
    'tip_comment': 'Комментарий к совету',
    'stay_duration': 'Продолжительность пребывания',
    'maximum_stay': 'Максимальное пребывание',
    'insurance': 'Страхование',
    'insurance_comment': 'Комментарий к страхованию',
    'insurance_url': 'URL страхования',
    'insurance_system': 'Система страхования',
    'no_borders': 'Нет доступных границ',
    'data_coming_soon': 'Данные скоро появятся, зайдите позже...',
    'onboarding_tooltip_title': 'Изучите различные слои карты',
    'onboarding_tooltip_message': 'Нажмите на кнопку выше, чтобы переключаться между различными слоями карты: удобство оверленда, требования карне, климат и маршруты.',
    'onboarding_tooltip_got_it': 'Понятно!',
    'help_button_title': 'Информация о слоях',
    'help_overlanding_title': 'Удобство оверлендинга',
    'help_overlanding_text': 'Показывает, насколько легко посетить каждую страну как оверлендер. Зеленый цвет указывает на нормальный доступ (легко) - вам нужна только правильная виза и стандартные документы на транспорт. Черный означает, что посетить страну на автомобиле (почти) невозможно, хотя это может быть возможно пешком или на велосипеде.',
    'help_carnet_title': 'Требования к карне',
    'help_carnet_text': 'Показывает, какие страны требуют Carnet de Passage en Douane, документ, предоставляемый вашим местным автомобильным клубом, который в обмен на большой возвратный депозит позволяет вам въехать в страну без уплаты импортных налогов. Это отражает реальность на местах, которая отличается от того, что говорят "официальные" веб-сайты, поскольку они часто содержат устаревшую информацию. Используйте мобильное приложение, чтобы войти и обсудить текущую ситуацию, которая в конечном итоге будет отражена здесь, когда она изменится.',
    'help_climate_title': 'Климатические данные',
    'help_climate_text': 'Отображает месячные максимальные температуры и осадки, усредненные за последние 50 лет. Это дает вам представление о том, какой сезон лучше всего подходит для путешествий в разных частях мира.',
    'help_itineraries_title': 'Маршруты',
    'help_itineraries_text': 'Подборка подробных маршрутов, специально созданных для оверлендеров, доступна для тестирования и загрузки в мобильном приложении (покупка необязательна).'
  },
  zh: {
    'overlanding': '越野旅行',
    'carnet': '通行证',
    'overlanding_status': '越野旅行状态',
    'carnet_requirements': '通行证要求',
    'border_status': '边境状态',
    'crossing_between': '{country1}和{country2}之间的过境点',
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
    'vehicle': '车辆',
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
    'border_post_app_promotion': '要讨论此边境哨所的状态或描述过境情况，请打开移动应用并创建账户',
    'country_app_promotion': '在移动应用中讨论签证和车辆要求',
    'app_store': 'App Store',
    'play_store': 'Play Store',
    'nav_map': '地图',
    'nav_about': '关于',
    'nav_contact': '联系',
    'nav_app': '应用',
    'nav_faq': '常见问题',
    'nav_support': '支持',
    'nav_menu': '菜单',
    'nav_close_menu': '关闭菜单',
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
    'status_explanations': '状态说明',
    'requirements_explanations': '要求说明',
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
    'dec': '12月',
    'general': '一般',
    'capital': '首都',
    'currency': '货币',
    'comment': '评论',
    'visa_comment': '签证评论',
    'visa_url': '签证URL',
    'official_website': '官方网站',
    'carnet_comment': '通行证评论',
    'tip': '提示',
    'tip_label': 'TIP（临时进口许可证）',
    'tip_comment': '提示评论',
    'stay_duration': '停留时间',
    'maximum_stay': '最长停留时间',
    'insurance': '保险',
    'insurance_comment': '保险评论',
    'insurance_url': '保险URL',
    'insurance_system': '保险系统',
    'no_borders': '没有可用的边界',
    'data_coming_soon': '数据即将推出，请稍后再来...',
    'onboarding_tooltip_title': '探索不同的地图图层',
    'onboarding_tooltip_message': '点击上方按钮在不同的地图图层之间切换：越野友好度、通行证要求、气候和行程。',
    'onboarding_tooltip_got_it': '明白了！',
    'help_button_title': '图层信息',
    'help_overlanding_title': '越野旅行友好度',
    'help_overlanding_text': '显示作为越野旅行者访问每个国家的难易程度。绿色表示正常访问（容易）- 您只需要适当的签证和标准车辆文件。黑色表示用机动车访问该国（几乎）不可能，尽管步行或骑自行车可能可行。',
    'help_carnet_title': '通行证要求',
    'help_carnet_text': '显示哪些国家需要Carnet de Passage en Douane（海关通行证），这是由您当地的汽车俱乐部提供的文件，通过支付大额可退还押金，允许您在不支付进口税的情况下进入该国。这代表了实地情况，与"官方"网站所说的不同，因为它们通常包含过时的信息。使用移动应用程序登录并讨论当前情况，当情况发生变化时，最终会在这里反映出来。',
    'help_climate_title': '气候数据',
    'help_climate_text': '显示过去50年的月最高温度和降水量平均值。这为您提供了世界不同地区最适合旅行的季节指示。',
    'help_itineraries_title': '行程',
    'help_itineraries_text': '专为越野旅行者精心设计的详细行程可在移动应用程序中测试和下载（购买可选）。'
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

/**
 * Get translated tip comment from country data
 */
export function getTranslatedTipComment(
  countryData: CountryData,
  language: SupportedLanguage
): string | null {
  return getTranslatedField(countryData, 'tip_comment', 'tip_comment_translations', language)
}

/**
 * Get translated carnet comment from country data
 */
export function getTranslatedCarnetComment(
  countryData: CountryData,
  language: SupportedLanguage
): string | null {
  return getTranslatedField(countryData, 'carnet_comment', 'carnet_comment_translations', language)
}

/**
 * Get translated disputed text from country data
 */
export function getTranslatedDisputed(
  countryData: CountryData,
  language: SupportedLanguage
): string | null {
  return getTranslatedField(countryData, 'disputed', 'disputed_translations', language)
}

/**
 * Translation dictionary for insurance scheme
 */
const INSURANCE_SCHEME_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'brown_card': 'Brown card',
    'yellow_card': 'Yellow card COMESA',
    'green_card': 'Green card',
    'soat': 'SOAT',
    'mercosur': 'Mercosur'
  },
  de: {
    'brown_card': 'Brown card',
    'yellow_card': 'Yellow card COMESA',
    'green_card': 'Grüne Karte',
    'soat': 'SOAT',
    'mercosur': 'Mercosur'
  },
  es: {
    'brown_card': 'Brown card',
    'yellow_card': 'Yellow card COMESA',
    'green_card': 'Tarjeta verde',
    'soat': 'SOAT',
    'mercosur': 'Mercosur'
  },
  fr: {
    'brown_card': 'Carte brune',
    'yellow_card': 'Carte jaune COMESA',
    'green_card': 'Carte verte',
    'soat': 'SOAT',
    'mercosur': 'Mercosur'
  },
  it: {
    'brown_card': 'Brown card',
    'yellow_card': 'Yellow card COMESA',
    'green_card': 'Carta verde',
    'soat': 'SOAT',
    'mercosur': 'Mercosur'
  },
  ja: {
    'brown_card': 'Brown card',
    'yellow_card': 'Yellow card COMESA',
    'green_card': 'グリーンカード',
    'soat': 'SOAT',
    'mercosur': 'Mercosur'
  },
  nl: {
    'brown_card': 'Brown card',
    'yellow_card': 'Yellow card COMESA',
    'green_card': 'Groene kaart',
    'soat': 'SOAT',
    'mercosur': 'Mercosur'
  },
  ru: {
    'brown_card': 'Brown card',
    'yellow_card': 'Yellow card COMESA',
    'green_card': 'Зелёная карта',
    'soat': 'SOAT',
    'mercosur': 'Mercosur'
  },
  zh: {
    'brown_card': 'Brown card',
    'yellow_card': 'Yellow card COMESA',
    'green_card': '绿卡',
    'soat': 'SOAT',
    'mercosur': 'Mercosur'
  }
}

/**
 * Get translated insurance scheme
 */
export function getTranslatedInsuranceScheme(
  scheme: string | undefined | null,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  if (!scheme) {
    return ''
  }
  
  return INSURANCE_SCHEME_TRANSLATIONS[language]?.[scheme] || scheme
}
