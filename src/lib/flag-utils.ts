/**
 * Utility functions for working with country flags
 */

/**
 * Get the flag SVG path for a country by its ADM0_A3 code
 * @param adm0A3 - The ADM0_A3 country code (e.g., 'USA', 'FRA', 'GBR')
 * @returns The path to the flag SVG file
 */
export function getFlagPath(adm0A3: string): string {
  return `/flags/${adm0A3}.svg`
}

/**
 * Check if a flag exists for the given ADM0_A3 code
 * @param adm0A3 - The ADM0_A3 country code
 * @returns Promise that resolves to true if flag exists, false otherwise
 */
export async function flagExists(adm0A3: string): Promise<boolean> {
  try {
    const response = await fetch(getFlagPath(adm0A3), { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get flag URL with fallback to a default flag or placeholder
 * @param adm0A3 - The ADM0_A3 country code
 * @param fallback - Optional fallback URL (defaults to a generic flag icon)
 * @returns The flag URL or fallback
 */
export function getFlagWithFallback(adm0A3: string, fallback?: string): string {
  if (!adm0A3) {
    return fallback || '🏳️' // Unicode flag emoji as ultimate fallback
  }
  return getFlagPath(adm0A3)
}

/**
 * Available flag codes (ADM0_A3 codes that have corresponding flag files)
 * This list is generated from the successful flag copying process
 */
export const AVAILABLE_FLAGS = [
  'ABK', 'ABW', 'AFG', 'AGO', 'AIA', 'ALD', 'ALB', 'AND', 'ARE', 'ARG', 'ARM', 'ASM', 'ATA', 'ATF', 'ATG', 'AUS', 'AUT', 'AZE',
  'BDI', 'BEL', 'BEN', 'BFA', 'BGD', 'BGR', 'BHR', 'BHS', 'BIH', 'BLM', 'BLR', 'BLZ', 'BMU', 'BOL', 'BRA', 'BRB', 'BRN',
  'BTN', 'BWA', 'CAF', 'CAN', 'CHE', 'CHL', 'CHN', 'CIV', 'CMR', 'COD', 'COG', 'COK', 'COL', 'COM', 'CPV', 'CRI',
  'CUB', 'CUW', 'CYM', 'CYN', 'CYP', 'CZE', 'DEU', 'DJI', 'DMA', 'DNK', 'DOM', 'DZA', 'ECU', 'EGY', 'ERI', 'ESP', 'EST',
  'ETH', 'FIN', 'FJI', 'FLK', 'FRA', 'FRO', 'FSM', 'GAB', 'GBR', 'GEO', 'GGY', 'GHA', 'GIN', 'GMB', 'GNB', 'GNQ',
  'GRC', 'GRD', 'GRL', 'GTM', 'GUM', 'GUY', 'HKG', 'HMD', 'HND', 'HRV', 'HTI', 'HUN', 'IDN', 'IMN', 'IND', 'IOT', 'IRL',
  'IRN', 'IRQ', 'ISL', 'ISR', 'ITA', 'JAM', 'JEY', 'JOR', 'JPN', 'KAZ', 'KEN', 'KGZ', 'KHM', 'KIR', 'KNA', 'KOR', 'KOS', 'KWT',
  'LAO', 'LBN', 'LBR', 'LBY', 'LCA', 'LIE', 'LKA', 'LSO', 'LTU', 'LUX', 'LVA', 'MAC', 'MAF', 'MAR', 'MCO', 'MDA', 'MDG', 'MDV',
  'MEX', 'MHL', 'MKD', 'MLI', 'MLT', 'MMR', 'MNE', 'MNG', 'MNP', 'MOZ', 'MRT', 'MSR', 'MUS', 'MWI', 'MYS', 'NAM',
  'NCL', 'NER', 'NFK', 'NGA', 'NGK', 'NIC', 'NIU', 'NLD', 'NOR', 'NPL', 'NRU', 'NZL', 'OMN', 'PAK', 'PAN', 'PCN', 'PER', 'PHL', 'PLW',
  'PMR', 'PNG', 'POL', 'PRI', 'PRK', 'PRT', 'PRY', 'PSX', 'PYF', 'QAT', 'ROU', 'RUS', 'RWA', 'SAH', 'SAU', 'SDN', 'SDS', 'SEN', 'SGP', 'SGS',
  'SHN', 'SLB', 'SLE', 'SLV', 'SMR', 'SOL', 'SOM', 'SOS', 'SPM', 'SRB', 'STP', 'SUR', 'SVK', 'SVN', 'SWE', 'SWZ', 'SXM', 'SYC',
  'SYR', 'TCA', 'TCD', 'TGO', 'THA', 'TJK', 'TKM', 'TLS', 'TON', 'TTO', 'TUN', 'TUR', 'TWN', 'TZA', 'UGA', 'UKR',
  'URY', 'USA', 'UZB', 'VAT', 'VCT', 'VEN', 'VGB', 'VIR', 'VNM', 'VUT', 'WLF', 'WSM', 'YEM', 'ZAF', 'ZMB', 'ZWE'
] as const

export type FlagCode = typeof AVAILABLE_FLAGS[number]

/**
 * Check if a given ADM0_A3 code has an available flag
 * @param adm0A3 - The ADM0_A3 country code
 * @returns True if flag is available, false otherwise
 */
export function hasFlagAvailable(adm0A3: string): adm0A3 is FlagCode {
  return AVAILABLE_FLAGS.includes(adm0A3 as FlagCode)
}