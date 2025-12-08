/**
 * Color expression generation utilities for MapLibre
 * This module contains the core logic for generating color expressions
 * without React dependencies for easier testing.
 */

// Color scheme types
export type ColorScheme = 'overlanding' | 'carnet' | 'climate'

// Color definition interface
export interface ColorDefinition {
  color: string
  label: string
}

// Scheme definition interface
export interface SchemeDefinition {
  name: string
  colors: Record<string | number, ColorDefinition>
}

// Color scheme constants with overlanding, carnet, and climate mappings
export const COLOR_SCHEMES: Record<ColorScheme, SchemeDefinition> = {
  overlanding: {
    name: 'Overlanding Status',
    colors: {
      0: { color: '#1a1a1a', label: 'Forbidden' },
      1: { color: '#dc2626', label: 'Unsafe' },
      2: { color: '#eab308', label: 'Restrictions Apply' },
      3: { color: '#16a34a', label: 'Open' },
      default: { color: '#9ca3af', label: 'Unknown' }
    }
  },
  carnet: {
    name: 'Carnet Requirements',
    colors: {
      '-1': { color: '#000000', label: 'Access forbidden' },
      0: { color: '#16a34a', label: 'Not required' },
      1: { color: '#eab308', label: 'Required in some situations' },
      2: { color: '#dc2626', label: 'Mandatory' },
      default: { color: '#16a34a', label: 'Not required' }
    }
  },
  climate: {
    name: 'Climate Data',
    colors: {
      default: { color: '#9ca3af', label: 'Climate' }
    }
  }
}

// Generate MapLibre color expression for overlanding scheme
function generateOverlandingColorExpression(): any[] {
  const scheme = COLOR_SCHEMES.overlanding
  
  return [
    'case',
    // Handle overlanding value 0 (Forbidden) - black
    ['any',
      ['==', ['get', 'overlanding'], 0],
      ['==', ['get', 'overlanding'], '0']
    ], scheme.colors[0].color,
    // Handle overlanding value 1 (Unsafe) - red
    ['any',
      ['==', ['get', 'overlanding'], 1],
      ['==', ['get', 'overlanding'], '1']
    ], scheme.colors[1].color,
    // Handle overlanding value 2 (Restrictions Apply) - yellow
    ['any',
      ['==', ['get', 'overlanding'], 2],
      ['==', ['get', 'overlanding'], '2']
    ], scheme.colors[2].color,
    // Handle overlanding value 3 (Open) - green
    ['any',
      ['==', ['get', 'overlanding'], 3],
      ['==', ['get', 'overlanding'], '3']
    ], scheme.colors[3].color,
    // Fallback to default (Unknown)
    scheme.colors.default.color
  ]
}

// Generate MapLibre color expression for carnet scheme
function generateCarnetColorExpression(): any[] {
  const scheme = COLOR_SCHEMES.carnet
  
  return [
    'case',
    // Handle carnet value -1 (Access Forbidden) - black color
    ['any',
      ['==', ['get', 'carnet'], -1],
      ['==', ['get', 'carnet'], '-1']
    ], scheme.colors['-1'].color,
    // Handle null, 0, or missing carnet field - all should be green (no carnet required)
    ['any',
      ['==', ['get', 'carnet'], null],
      ['==', ['get', 'carnet'], 0],
      ['==', ['get', 'carnet'], '0'],
      ['!', ['has', 'carnet']]
    ], scheme.colors[0].color,
    // Handle carnet value 1 (Required in Some Situations) - yellow
    ['any',
      ['==', ['get', 'carnet'], 1],
      ['==', ['get', 'carnet'], '1']
    ], scheme.colors[1].color,
    // Handle carnet value 2 (Mandatory) - red
    ['any',
      ['==', ['get', 'carnet'], 2],
      ['==', ['get', 'carnet'], '2']
    ], scheme.colors[2].color,
    // Fallback to default (no carnet required)
    scheme.colors.default.color
  ]
}

// Utility function to validate color expression structure
function validateColorExpression(expression: any[]): boolean {
  try {
    // Basic validation - should be an array starting with 'case'
    return Array.isArray(expression) && expression.length > 0 && expression[0] === 'case'
  } catch (error) {
    console.warn('Invalid color expression structure:', error)
    return false
  }
}

// Main function to generate MapLibre color expressions based on active scheme
export function generateColorExpression(scheme: ColorScheme): any[] {
  let expression: any[]
  
  try {
    switch (scheme) {
      case 'overlanding':
        expression = generateOverlandingColorExpression()
        break
      case 'carnet':
        expression = generateCarnetColorExpression()
        break
      default:
        console.warn(`Invalid color scheme: ${scheme}, falling back to overlanding`)
        expression = generateOverlandingColorExpression()
        break
    }
    
    // Validate the generated expression
    if (!validateColorExpression(expression)) {
      console.warn(`Generated invalid color expression for scheme: ${scheme}, using fallback`)
      return generateOverlandingColorExpression()
    }
    
    return expression
  } catch (error) {
    console.error(`Error generating color expression for scheme: ${scheme}`, error)
    // Return a safe fallback expression
    return [
      'case',
      ['has', 'overlanding'], COLOR_SCHEMES.overlanding.colors.default.color,
      COLOR_SCHEMES.overlanding.colors.default.color
    ]
  }
}

// Utility function to get color definition for a value in the active scheme
export function getColorForValue(
  scheme: ColorScheme, 
  value: string | number | null | undefined
): ColorDefinition {
  const schemeDefinition = COLOR_SCHEMES[scheme]
  
  // Handle null/undefined values
  if (value === null || value === undefined) {
    // For carnet scheme, null values should be treated as "not required" (same as 0)
    if (scheme === 'carnet') {
      return schemeDefinition.colors[0]
    }
    // For other schemes, use explicit null entry or fall back to default
    return schemeDefinition.colors.null || schemeDefinition.colors.default
  }
  
  // Look for exact match
  const colorDef = schemeDefinition.colors[value]
  if (colorDef) {
    return colorDef
  }
  
  // Fall back to default
  return schemeDefinition.colors.default
}

// Utility function to get all available color schemes
export function getAvailableColorSchemes(): ColorScheme[] {
  return Object.keys(COLOR_SCHEMES) as ColorScheme[]
}

// Utility function to validate if a scheme exists
export function isValidColorScheme(scheme: string): scheme is ColorScheme {
  return scheme in COLOR_SCHEMES
}