# Implementation Plan

- [x] 1. Add translation keys to i18n system
  - Add new translation keys to INTERFACE_TRANSLATIONS dictionary in src/lib/i18n.ts
  - Provide translations for all 9 supported languages (en, de, es, fr, it, ja, nl, ru, zh)
  - Include keys: track_pack, itinerary_app_promotion, app_store, play_store, length_unknown, steps
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.4_

- [x] 1.1 Write property test for translation key completeness
  - **Property 7: Complete language coverage**
  - **Validates: Requirements 2.4**

- [x] 1.2 Write property test for translation fallback behavior
  - **Property 6: Translation fallback behavior**
  - **Validates: Requirements 2.3**

- [x] 2. Update DetailSidebar component to use translations
  - Import getTranslatedLabel from ../lib/i18n in DetailSidebar.tsx
  - Replace hardcoded "Track Pack" fallback with getTranslatedLabel('track_pack', language)
  - Replace hardcoded mobile app promotion text with getTranslatedLabel('itinerary_app_promotion', language)
  - Replace hardcoded "App Store" with getTranslatedLabel('app_store', language)
  - Replace hardcoded "Play Store" with getTranslatedLabel('play_store', language)
  - Replace hardcoded "Length unknown" with getTranslatedLabel('length_unknown', language)
  - Replace hardcoded "steps" with getTranslatedLabel('steps', language)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2.1 Write property test for mobile app promotion text translation
  - **Property 1: Mobile app promotion text translation**
  - **Validates: Requirements 1.1**

- [x] 2.2 Write property test for track pack fallback text translation
  - **Property 2: Track pack fallback text translation**
  - **Validates: Requirements 1.2**

- [x] 2.3 Write property test for length unknown fallback text translation
  - **Property 3: Length unknown fallback text translation**
  - **Validates: Requirements 1.3**

- [x] 2.4 Write property test for steps label translation
  - **Property 4: Steps label translation**
  - **Validates: Requirements 1.4**

- [x] 2.5 Write property test for app store button labels translation
  - **Property 5: App store button labels translation**
  - **Validates: Requirements 1.5**

- [x] 2.6 Write unit tests for DetailSidebar itinerary rendering
  - Create unit tests for renderItineraryDetails function with different language settings
  - Test edge cases like missing itinerary data
  - Test proper integration with useLanguage hook
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.