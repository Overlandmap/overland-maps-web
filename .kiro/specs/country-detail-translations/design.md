# Design Document

## Overview

This design implements translation support for country detail fields in the DetailSidebar component. The solution extends the existing i18n system to handle Firestore translation fields, providing a seamless way to display translated content for comments, visa information, and insurance information based on the user's selected language.

## Architecture

The translation system follows a layered approach:

1. **Translation Utility Layer**: New utility functions in `i18n.ts` that handle the translation lookup logic
2. **Component Integration Layer**: Updates to `DetailSidebar.tsx` to use translation utilities instead of direct field access
3. **Data Access Layer**: Maintains compatibility with existing Firestore data structure

The design leverages the existing language context and follows established patterns in the codebase for consistency.

## Components and Interfaces

### Translation Utility Functions

```typescript
// New functions to be added to src/lib/i18n.ts

/**
 * Get translated field value with fallback chain
 */
function getTranslatedField(
  data: any,
  fieldName: string,
  translationFieldName: string,
  language: SupportedLanguage
): string | null

/**
 * Get translated comment from country data
 */
function getTranslatedComment(
  countryData: CountryData,
  language: SupportedLanguage
): string | null

/**
 * Get translated visa comment from country data
 */
function getTranslatedVisaComment(
  countryData: CountryData,
  language: SupportedLanguage
): string | null

/**
 * Get translated insurance comment from country data
 */
function getTranslatedInsuranceComment(
  countryData: CountryData,
  language: SupportedLanguage
): string | null
```

### Component Updates

The `DetailSidebar.tsx` component will be updated to use the new translation functions in the `renderCountryDetails` function, specifically in the sections that display:

- General comments (if they exist)
- Visa comments (currently displayed)
- Insurance comments (if they exist)

## Data Models

### Firestore Translation Fields

The system expects Firestore documents to contain optional translation fields with the following structure:

```typescript
interface CountryDataWithTranslations extends CountryData {
  parameters: {
    // Existing fields
    visa_comment?: string
    comment?: string
    insurance_comment?: string
    
    // New translation fields
    comment_translations?: Record<string, string>
    visa_comment_translations?: Record<string, string>
    insurance_comment_translations?: Record<string, string>
    
    // Other existing parameters...
  }
}
```

### Translation Map Structure

Translation maps follow this format:
```typescript
{
  "en": "English text",
  "fr": "Texte français", 
  "de": "Deutscher Text",
  "es": "Texto español",
  // ... other supported languages
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Translation field lookup priority
*For any* country data with translation fields and any supported language, when that language exists in the translation map, the translated value should be returned instead of the original field value
**Validates: Requirements 1.1, 1.2, 1.3**

Property 2: Translation fallback to original field
*For any* country data with translation fields and any supported language, when that language does not exist in the translation map, the original field value should be returned
**Validates: Requirements 1.4, 2.2**

Property 3: Missing field handling
*For any* country data without translation fields or original fields, the translation function should return null or undefined appropriately
**Validates: Requirements 1.5, 2.3**

Property 4: Translation lookup order consistency
*For any* country data with both translation and original fields, the translation field should always be checked first before falling back to the original field
**Validates: Requirements 2.1**

Property 5: Graceful error handling
*For any* malformed or invalid translation data, the system should handle null, undefined, and non-object values without throwing errors
**Validates: Requirements 2.4, 2.5**

Property 6: Language code validation
*For any* translation map, only valid supported language codes should be used as keys for translation lookup
**Validates: Requirements 3.2**

Property 7: Data structure flexibility
*For any* country data, the translation functions should work whether fields are located in country.parameters or directly on the country object
**Validates: Requirements 3.3**

Property 8: Backward compatibility
*For any* existing country data without translation fields, the system should continue to work exactly as before without breaking functionality
**Validates: Requirements 3.4**

## Error Handling

The translation system implements comprehensive error handling:

1. **Null/Undefined Safety**: All translation lookups use optional chaining and null checks
2. **Type Safety**: Translation maps are validated to be objects before property access
3. **Graceful Degradation**: Invalid or missing translation data falls back to original fields
4. **Silent Failures**: Translation errors don't break the UI, they simply fall back to available content

## Testing Strategy

### Unit Testing Approach

Unit tests will cover:
- Specific examples of translation lookup with known data
- Edge cases like empty translation maps
- Error conditions with malformed data
- Integration with existing i18n functions

### Property-Based Testing Approach

Property-based tests will use **fast-check** (JavaScript property testing library) and run a minimum of 100 iterations per test. Each property-based test will be tagged with comments referencing the design document properties.

Property tests will verify:
- Translation lookup behavior across all possible country data combinations
- Fallback chain consistency with randomly generated data
- Error handling robustness with malformed inputs
- Language code validation with valid and invalid codes
- Data structure flexibility with various field locations

**Property Test Configuration**:
- Library: fast-check
- Minimum iterations: 100 per test
- Test tagging format: `**Feature: country-detail-translations, Property {number}: {property_text}**`

Each correctness property will be implemented by a single property-based test that generates random test data and verifies the universal behavior holds across all inputs.