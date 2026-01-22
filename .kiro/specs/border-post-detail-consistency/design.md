# Design Document

## Overview

This design addresses the inconsistency in border post detail display by implementing proper comment translation handling in the `renderBorderPostDetails` function. The solution follows the established pattern used in `renderZoneDetails` to ensure consistent behavior across all access methods (map click vs URL loading).

## Architecture

The fix will be implemented entirely within the `DetailSidebar` component's `renderBorderPostDetails` function. The solution involves:

1. **Data Merging Strategy**: Implement the same data merging pattern used in `renderZoneDetails` to prioritize complete data sources
2. **Translation Logic**: Add comment translation handling with proper fallback logic
3. **Validation Layer**: Add type checking for translation fields to prevent runtime errors

## Components and Interfaces

### DetailSidebar.tsx

#### renderBorderPostDetails function
- **Data merging logic**: Merge borderPostData and feature properties, prioritizing the most complete source for translation fields
- **Translation handling**: Implement comment_translations processing with language fallback
- **Validation helpers**: Use existing validation functions for safe data access

#### Translation Processing
- **Primary language lookup**: Check comment_translations[currentLanguage]
- **English fallback**: Check comment_translations['en'] if primary not available
- **Original field fallback**: Use original comment field if no translations available
- **Graceful degradation**: Handle malformed or missing translation data

## Data Models

### Border Post Data Structure
```typescript
interface BorderPostData {
  id: string
  name: string
  location?: string | FirebaseGeoPoint
  coordinates?: [number, number]
  countries?: string
  is_open?: number
  comment?: string
  comment_translations?: Record<string, string>
  // Other existing fields...
}
```

### Translation Field Structure
```typescript
interface CommentTranslations {
  [languageCode: string]: string
  en?: string  // English fallback
  fr?: string  // French
  de?: string  // German
  // Other supported languages...
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all properties identified in the prework, several redundancies were identified:
- Properties 1.2 and 2.1 are identical (both test basic translation display)
- Properties 1.3, 2.2, and 2.3 can be combined into a comprehensive fallback property
- Properties 2.5, 3.3, and 3.4 all test error handling and can be consolidated

The following properties provide unique validation value:

**Property 1: Access method consistency**
*For any* border post with comment_translations, accessing via map click and URL loading should produce identical rendered content
**Validates: Requirements 1.1**

**Property 2: Translation display correctness**
*For any* border post with comment_translations and any supported language, the displayed comment should be the translation for that language, or follow proper fallback logic
**Validates: Requirements 1.2, 2.1**

**Property 3: Translation fallback chain**
*For any* border post with comment_translations, when the current language is not available, the system should display English translation if available, otherwise the original comment
**Validates: Requirements 1.3, 2.2, 2.3**

**Property 4: Language reactivity**
*For any* border post with comment_translations, changing the language should update the displayed comment to match the new language selection
**Validates: Requirements 2.4**

**Property 5: Error handling robustness**
*For any* border post with malformed or invalid comment_translations, the system should gracefully fallback without breaking the interface
**Validates: Requirements 2.5, 3.3, 3.4**

**Property 6: Data source prioritization**
*For any* border post accessed through different data sources, the system should prioritize the most complete data source for translation fields
**Validates: Requirements 3.2**

## Error Handling

### Translation Field Validation
- **Type checking**: Verify comment_translations is an object before accessing properties
- **Structure validation**: Ensure translation values are strings
- **Graceful fallback**: Default to original comment field on any validation failure

### Data Source Conflicts
- **Prioritization logic**: Prefer borderPostData over feature.properties for translation fields
- **Null safety**: Handle cases where either data source is null or undefined
- **Field preservation**: Ensure important fields from both sources are preserved

### Runtime Safety
- **Defensive programming**: Add null checks for all data access
- **Error boundaries**: Prevent translation errors from breaking the entire component
- **Logging**: Add appropriate console warnings for debugging malformed data

## Testing Strategy

### Unit Testing
Unit tests will verify specific examples and edge cases:
- Border posts with complete translation data
- Border posts with missing translations for current language
- Border posts with malformed translation data
- Border posts with no comment data at all

### Property-Based Testing
Property-based tests will verify universal properties using fast-check library with minimum 100 iterations:
- **Access method consistency**: Generate border posts and verify identical rendering across access methods
- **Translation correctness**: Generate various translation configurations and verify correct display
- **Fallback behavior**: Test fallback logic with missing or invalid translations
- **Language reactivity**: Test language changes with various border post configurations
- **Error handling**: Test robustness with malformed data inputs
- **Data prioritization**: Test data merging with conflicting sources

Each property-based test will be tagged with: **Feature: border-post-detail-consistency, Property {number}: {property_text}**

### Integration Testing
- Test the complete flow from data loading to rendering
- Verify consistency between map click and URL loading paths
- Test language switching with real border post data