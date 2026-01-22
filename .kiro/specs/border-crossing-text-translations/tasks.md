# Implementation Plan

- [x] 1. Add translation keys to i18n system
  - Add 'crossing_between' translation key to INTERFACE_TRANSLATIONS dictionary for all supported languages
  - Ensure proper grammatical structure for each language (German, Spanish, French, Italian, Japanese, Dutch, Russian, Chinese)
  - _Requirements: 1.1, 1.5, 2.2_

- [ ]* 1.1 Write property test for complete language coverage
  - **Property 6: Complete language coverage**
  - **Validates: Requirements 2.2**

- [x] 2. Create translation utility function
  - Implement function to process crossing text template with country name placeholders
  - Handle string interpolation for {country1} and {country2} placeholders
  - Integrate with existing getTranslatedLabel and getTranslatedCountryName functions
  - _Requirements: 1.2, 1.4, 2.3, 2.4_

- [ ]* 2.1 Write property test for translated country names
  - **Property 2: Translated country names in crossing text**
  - **Validates: Requirements 1.2**

- [ ]* 2.2 Write property test for fallback behavior
  - **Property 4: Fallback to English default**
  - **Validates: Requirements 1.4**

- [x] 3. Modify generateCrossingText function
  - Update function signature to accept language parameter
  - Replace hardcoded English text with translated template
  - Implement proper error handling for missing translations
  - _Requirements: 1.1, 1.3, 1.4_

- [ ]* 3.1 Write property test for language-specific generation
  - **Property 1: Language-specific crossing text generation**
  - **Validates: Requirements 1.1**

- [ ]* 3.2 Write property test for proper formatting
  - **Property 5: Proper formatting for all languages**
  - **Validates: Requirements 1.5**

- [x] 4. Update DetailSidebar component integration
  - Pass language parameter from LanguageContext to generateCrossingText function
  - Ensure crossing text updates when language preference changes
  - Test integration with existing border post detail rendering
  - _Requirements: 1.1, 1.3_

- [ ]* 4.1 Write property test for language change reactivity
  - **Property 3: Language change reactivity**
  - **Validates: Requirements 1.3**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 6. Write unit tests for edge cases
  - Test invalid country codes handling
  - Test missing country data scenarios
  - Test malformed countries field input
  - _Requirements: 1.2, 1.4_

- [ ]* 7. Write integration tests
  - Test crossing text display in border post detail view
  - Test language switching in UI updates crossing text
  - Test interaction with existing translation system
  - _Requirements: 1.1, 1.3_