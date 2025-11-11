/**
 * Internationalization utilities for multi-language support
 */

export type SupportedLanguage = 'en' | 'de' | 'es' | 'fr' | 'it' | 'ja' | 'ru' | 'zh'

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
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' }
]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

/**
 * Get translated country name from country data
 */
export function getTranslatedCountryName(
  countryData: any, 
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
  countryData: any, 
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
    'war_dangerous': 'War / Dangerous',
    'restricted': 'Restricted access',
    'open': 'Open',
    'unknown': 'Unknown'
  },
  de: {
    'forbidden': 'Verboten',
    'war_dangerous': 'Krieg / Gefährlich',
    'restricted': 'Eingeschränkter Zugang',
    'open': 'Offen',
    'unknown': 'Unbekannt'
  },
  es: {
    'forbidden': 'Prohibido',
    'war_dangerous': 'Guerra / Peligroso',
    'restricted': 'Acceso restringido',
    'open': 'Abierto',
    'unknown': 'Desconocido'
  },
  fr: {
    'forbidden': 'Interdit',
    'war_dangerous': 'Guerre / Dangereux',
    'restricted': 'Accès restreint',
    'open': 'Ouvert',
    'unknown': 'Inconnu'
  },
  it: {
    'forbidden': 'Vietato',
    'war_dangerous': 'Guerra / Pericoloso',
    'restricted': 'Accesso limitato',
    'open': 'Aperto',
    'unknown': 'Sconosciuto'
  },
  ja: {
    'forbidden': '禁止',
    'war_dangerous': '戦争/危険',
    'restricted': 'アクセス制限',
    'open': 'オープン',
    'unknown': '不明'
  },
  ru: {
    'forbidden': 'Запрещено',
    'war_dangerous': 'Война / Опасно',
    'restricted': 'Ограниченный доступ',
    'open': 'Открыто',
    'unknown': 'Неизвестно'
  },
  zh: {
    'forbidden': '禁止',
    'war_dangerous': '战争/危险',
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
    'war_dangerous': 'War / Dangerous',
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
    'bilateral': 'Bilateral',
    'restrictions_apply': 'Restrictions apply',
    'temporary_closed': 'Temporary Closed'
  },
  de: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Overlanding-Status',
    'carnet_requirements': 'Carnet-Anforderungen',
    'border_status': 'Grenzstatus',
    'open': 'Offen',
    'restricted_access': 'Eingeschränkter Zugang',
    'war_dangerous': 'Krieg / Gefährlich',
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
    'bilateral': 'Bilateral',
    'restrictions_apply': 'Einschränkungen gelten',
    'temporary_closed': 'Vorübergehend geschlossen'
  },
  es: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Estado de Overlanding',
    'carnet_requirements': 'Requisitos de Carnet',
    'border_status': 'Estado de Frontera',
    'open': 'Abierto',
    'restricted_access': 'Acceso restringido',
    'war_dangerous': 'Guerra / Peligroso',
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
    'bilateral': 'Bilateral',
    'restrictions_apply': 'Se aplican restricciones',
    'temporary_closed': 'Cerrado temporalmente'
  },
  fr: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Statut Overlanding',
    'carnet_requirements': 'Exigences Carnet',
    'border_status': 'Statut de Frontière',
    'open': 'Ouvert',
    'restricted_access': 'Accès restreint',
    'war_dangerous': 'Guerre / Dangereux',
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
    'bilateral': 'Bilatéral',
    'restrictions_apply': 'Restrictions applicables',
    'temporary_closed': 'Fermé temporairement'
  },
  it: {
    'overlanding': 'Overlanding',
    'carnet': 'Carnet',
    'overlanding_status': 'Stato Overlanding',
    'carnet_requirements': 'Requisiti Carnet',
    'border_status': 'Stato del Confine',
    'open': 'Aperto',
    'restricted_access': 'Accesso limitato',
    'war_dangerous': 'Guerra / Pericoloso',
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
    'bilateral': 'Bilaterale',
    'restrictions_apply': 'Si applicano restrizioni',
    'temporary_closed': 'Chiuso temporaneamente'
  },
  ja: {
    'overlanding': 'オーバーランディング',
    'carnet': 'カルネ',
    'overlanding_status': 'オーバーランディング状況',
    'carnet_requirements': 'カルネ要件',
    'border_status': '国境状況',
    'open': '開放',
    'restricted_access': 'アクセス制限',
    'war_dangerous': '戦争/危険',
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
    'bilateral': '二国間',
    'restrictions_apply': '制限が適用されます',
    'temporary_closed': '一時閉鎖'
  },
  ru: {
    'overlanding': 'Оверлендинг',
    'carnet': 'Карне',
    'overlanding_status': 'Статус оверлендинга',
    'carnet_requirements': 'Требования карне',
    'border_status': 'Статус границы',
    'open': 'Открыто',
    'restricted_access': 'Ограниченный доступ',
    'war_dangerous': 'Война / Опасно',
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
    'bilateral': 'Двусторонний',
    'restrictions_apply': 'Применяются ограничения',
    'temporary_closed': 'Временно закрыто'
  },
  zh: {
    'overlanding': '越野旅行',
    'carnet': '通行证',
    'overlanding_status': '越野旅行状态',
    'carnet_requirements': '通行证要求',
    'border_status': '边境状态',
    'open': '开放',
    'restricted_access': '限制访问',
    'war_dangerous': '战争/危险',
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
    'bilateral': '双边',
    'restrictions_apply': '适用限制',
    'temporary_closed': '暂时关闭'
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