# Design Document

## Overview

This feature extends the existing internationalization system to support translated "crossing between..." text in border post detail views. The implementation will integrate seamlessly with the current i18n infrastructure while maintaining consistency with existing translation patterns.

## Architecture

The solution leverages the existing translation architecture:

- **i18n System**: Extends the current `INTERFACE_TRANSLATIONS` dictionary with new translation keys
- **Language Context**: Uses the existing `LanguageContext` to determine the user's selected language
- **Translation Functions**: Utilizes existing `getTranslatedLabel` and `getTranslatedCountryName` functions
- **Component Integration**: Modifies the `generateCrossingText` function in `DetailSidebar.tsx`

## Components and Interfaces

### Translation Keys

New translation keys will be added to the `INTERFACE_TRANSLATIONS` dictionary in `src/lib/i18n.ts`:

```typescript
'crossing_between': 'Crossing between {country1} and {country2}'
```

### Modified Functions

#### `generateCrossingText` Function
- **Location**: `src/components/DetailSidebar.tsx`
- **Current Behavior**: Returns hardcoded English text
- **New Behavior**: Returns translated text using the user's selected language
- **Parameters**: 
  - `countriesField: string` - The country codes (e.g., "RUS-KAZ")
  - `language: SupportedLanguage` - The user's selected language
- **Return**: Translated crossing text

#### Translation Template Processing
- **Approach**: Use string interpolation with placeholders
- **Template**: `"Crossing between {country1} and {country2}"`
- **Processing**: Replace placeholders with translated country names

## Data Models

### Translation Structure

```typescript
// Addition to existing INTERFACE_TRANSLATIONS
const INTERFACE_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // existing translations...
    'crossing_between': 'Crossing between {country1} and {country2}'
  },
  de: {
    // existing translations...
    'crossing_between': 'Grenzübergang zwischen {country1} und {country2}'
  },
  es: {
    // existing translations...
    'crossing_between': 'Cruce entre {country1} y {country2}'
  },
  fr: {
    // existing translations...
    'crossing_between': 'Passage entre {country1} et {country2}'
  },
  it: {
    // existing translations...
    'crossing_between': 'Attraversamento tra {country1} e {country2}'
  },
  ja: {
    // existing translations...
    'crossing_between': '{country1}と{country2}の間の国境'
  },
  nl: {
    // existing translations...
    'crossing_between': 'Grensovergang tussen {country1} en {country2}'
  },
  ru: {
    // existing translations...
    'crossing_between': 'Переход между {country1} и {country2}'
  },
  zh: {
    // existing translations...
    'crossing_between': '{country1}和{country2}之间的过境点'
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Language-specific crossing text generation
*For any* border post with valid country codes and any supported language, the generated crossing text should be in the specified language
**Validates: Requirements 1.1**

Property 2: Translated country names in crossing text
*For any* country codes and any supported language, the crossing text should contain the translated country names rather than the original country codes
**Validates: Requirements 1.2**

Property 3: Language change reactivity
*For any* border post crossing text, changing the language preference should result in the text being updated to the new language
**Validates: Requirements 1.3**

Property 4: Fallback to English default
*For any* border post crossing text, when translation data is missing for the selected language, the system should fall back to English
**Validates: Requirements 1.4**

Property 5: Proper formatting for all languages
*For any* supported language, the crossing text should follow the correct grammatical structure and formatting for that language
**Validates: Requirements 1.5**

Property 6: Complete language coverage
*For any* new translation key added to the system, all supported languages (en, de, es, fr, it, ja, nl, ru, zh) should have corresponding translations
**Validates: Requirements 2.2**

## Error Handling

### Missing Translation Data
- **Scenario**: Translation key not found for selected language
- **Handling**: Fall back to English translation
- **Fallback Chain**: Selected Language → English → Original key

### Invalid Country Codes
- **Scenario**: Country codes cannot be parsed or translated
- **Handling**: Return original country codes as fallback
- **User Experience**: Display codes rather than failing silently

### Missing Country Data
- **Scenario**: Country translation not available
- **Handling**: Use country code as fallback
- **Consistency**: Maintain text structure even with missing data

## Testing Strategy

### Unit Testing
- Test translation key lookup for all supported languages
- Test country code parsing and validation
- Test fallback behavior when translations are missing
- Test string interpolation with various country name combinations

### Property-Based Testing
The testing approach will use **fast-check** as the property-based testing library for JavaScript/TypeScript, configured to run a minimum of 100 iterations per property test.

Each property-based test will be tagged with comments explicitly referencing the correctness property in the design document using this format: `**Feature: border-crossing-text-translations, Property {number}: {property_text}**`

Property tests will verify:
- Language consistency across all supported languages and country combinations
- Correct country name translation for randomly generated country codes
- Proper fallback behavior when translation data is intentionally removed
- Text format validation for all language templates
- Complete translation coverage for all supported languages

### Integration Testing
- Test crossing text display in border post detail view
- Test language switching functionality in the UI
- Test interaction with existing translation system components