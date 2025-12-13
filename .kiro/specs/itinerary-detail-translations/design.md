# Design Document

## Overview

This design implements internationalization for hardcoded English text strings in the itinerary detail panel of the DetailSidebar component. The solution extends the existing i18n system by adding new translation keys to the INTERFACE_TRANSLATIONS dictionary and updating the renderItineraryDetails function to use translated text.

## Architecture

The translation system follows the existing i18n architecture:
- Translation keys are stored in the INTERFACE_TRANSLATIONS dictionary in `src/lib/i18n.ts`
- The `getTranslatedLabel()` function retrieves translations with automatic fallback to English
- The DetailSidebar component uses the `useLanguage()` hook to get the current language
- All text rendering uses the translation system instead of hardcoded strings

## Components and Interfaces

### Modified Components

**DetailSidebar.tsx**
- Update `renderItineraryDetails()` function to use `getTranslatedLabel()` for all hardcoded text
- Import `getTranslatedLabel` from `../lib/i18n`
- Use the existing `language` variable from `useLanguage()` hook

**i18n.ts**
- Add new translation keys to `INTERFACE_TRANSLATIONS` dictionary
- Maintain consistency with existing translation patterns
- Provide translations for all 9 supported languages

### Translation Keys to Add

The following keys will be added to INTERFACE_TRANSLATIONS:
- `track_pack`: "Track Pack" (fallback text)
- `itinerary_app_promotion`: Mobile app promotion text
- `app_store`: "App Store"
- `play_store`: "Play Store" 
- `length_unknown`: "Length unknown"
- `steps`: "steps" (for step count)

## Data Models

No new data models are required. The existing translation system uses:
```typescript
INTERFACE_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>>
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Mobile app promotion text translation
*For any* supported language, when rendering an itinerary detail panel, the mobile app promotion text should appear in the correct language translation
**Validates: Requirements 1.1**

Property 2: Track pack fallback text translation
*For any* supported language and itinerary data without trackPackName, the fallback text should display "Track Pack" in the correct language translation
**Validates: Requirements 1.2**

Property 3: Length unknown fallback text translation
*For any* supported language and itinerary data without length information, the fallback text should display "Length unknown" in the correct language translation
**Validates: Requirements 1.3**

Property 4: Steps label translation
*For any* supported language and itinerary data with step count, the steps label should appear in the correct language translation
**Validates: Requirements 1.4**

Property 5: App store button labels translation
*For any* supported language, the App Store and Play Store button labels should appear in the correct language translations
**Validates: Requirements 1.5**

Property 6: Translation fallback behavior
*For any* translation key that is missing in a specific language, the system should fallback to the English translation
**Validates: Requirements 2.3**

Property 7: Complete language coverage
*For any* new translation key added for itinerary details, translations should exist for all 9 supported languages (English, German, Spanish, French, Italian, Japanese, Dutch, Russian, Chinese)
**Validates: Requirements 2.4**

## Error Handling

The translation system includes built-in error handling:
- Missing translations automatically fallback to English
- Invalid language codes default to English
- The `getTranslatedLabel()` function returns the key itself if no translation is found
- Component rendering continues gracefully even with missing translations

## Testing Strategy

### Unit Testing
- Test individual translation key retrieval with `getTranslatedLabel()`
- Test component rendering with different language settings
- Test fallback behavior when translations are missing
- Test edge cases like empty or undefined itinerary data

### Property-Based Testing
The testing approach will use React Testing Library for component testing and Jest for unit testing. Property-based tests will:
- Generate random language selections and verify correct translations
- Generate various itinerary data combinations to test fallback scenarios
- Verify translation completeness across all supported languages
- Test the fallback mechanism when translations are missing

Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage of different input combinations. Tests will be tagged with comments referencing the specific correctness property they implement using the format: '**Feature: itinerary-detail-translations, Property {number}: {property_text}**'
