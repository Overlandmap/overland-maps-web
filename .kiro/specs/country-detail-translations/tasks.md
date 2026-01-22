# Implementation Plan

- [x] 1. Implement translation utility functions in i18n library
  - Add `getTranslatedField` utility function for generic translation lookup with fallback chain
  - Add `getTranslatedComment` function for general comment translations
  - Add `getTranslatedVisaComment` function for visa comment translations  
  - Add `getTranslatedInsuranceComment` function for insurance comment translations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_

- [ ]* 1.1 Write property test for translation field lookup priority
  - **Property 1: Translation field lookup priority**
  - **Validates: Requirements 1.1, 1.2, 1.3**

- [ ]* 1.2 Write property test for translation fallback behavior
  - **Property 2: Translation fallback to original field**
  - **Validates: Requirements 1.4, 2.2**

- [ ]* 1.3 Write property test for missing field handling
  - **Property 3: Missing field handling**
  - **Validates: Requirements 1.5, 2.3**

- [ ]* 1.4 Write property test for lookup order consistency
  - **Property 4: Translation lookup order consistency**
  - **Validates: Requirements 2.1**

- [ ]* 1.5 Write property test for error handling robustness
  - **Property 5: Graceful error handling**
  - **Validates: Requirements 2.4, 2.5**

- [ ]* 1.6 Write property test for language code validation
  - **Property 6: Language code validation**
  - **Validates: Requirements 3.2**

- [ ]* 1.7 Write property test for data structure flexibility
  - **Property 7: Data structure flexibility**
  - **Validates: Requirements 3.3**

- [ ]* 1.8 Write property test for backward compatibility
  - **Property 8: Backward compatibility**
  - **Validates: Requirements 3.4**

- [ ]* 1.9 Write unit tests for translation utility functions
  - Create unit tests for `getTranslatedField` with specific examples
  - Write unit tests for comment translation functions
  - Test edge cases like empty translation maps and null values
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3_

- [x] 2. Update DetailSidebar component to use translation functions
  - Replace direct `countryData.parameters?.visa_comment` access with `getTranslatedVisaComment`
  - Add support for general comments using `getTranslatedComment` if comment field exists
  - Add support for insurance comments using `getTranslatedInsuranceComment` if insurance_comment field exists
  - Ensure all translation functions receive the current language from useLanguage hook
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 2.1 Write integration tests for DetailSidebar translation integration
  - Test that DetailSidebar correctly displays translated content when available
  - Test fallback behavior in the component
  - Test that language changes update displayed content
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Update type definitions if needed
  - Add optional translation field types to CountryData interface if not already flexible enough
  - Ensure type safety for new translation functions
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 4.1 Write unit tests for type compatibility
  - Test that new functions work with existing CountryData interface
  - Test type safety with TypeScript compilation
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 5. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - ✅ All 167 tests are now passing