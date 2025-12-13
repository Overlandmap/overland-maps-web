# Requirements Document

## Introduction

This feature adds internationalization support for the itinerary detail panel text in the DetailSidebar component. Currently, several text strings in the itinerary detail view are hardcoded in English and need to be translated to support the application's multi-language functionality.

## Glossary

- **DetailSidebar**: The sidebar component that displays detailed information about selected map features including itineraries
- **Itinerary Detail Panel**: The specific view within DetailSidebar that shows information about a selected itinerary
- **i18n**: Internationalization system used for managing translations across supported languages
- **Translation Key**: A unique identifier used to retrieve translated text for a specific language
- **INTERFACE_TRANSLATIONS**: The translation dictionary in i18n.ts that contains interface text translations

## Requirements

### Requirement 1

**User Story:** As a user viewing an itinerary in a non-English language, I want all text in the itinerary detail panel to be displayed in my selected language, so that I can understand the information without language barriers.

#### Acceptance Criteria

1. WHEN a user views an itinerary detail panel THEN the system SHALL display the mobile app promotion text in the user's selected language
2. WHEN an itinerary has no track pack name THEN the system SHALL display the fallback text "Track Pack" in the user's selected language
3. WHEN an itinerary has no length information THEN the system SHALL display "Length unknown" in the user's selected language
4. WHEN an itinerary displays step count THEN the system SHALL show the word "steps" in the user's selected language
5. WHEN app store buttons are displayed THEN the system SHALL show "App Store" and "Play Store" labels in the user's selected language

### Requirement 2

**User Story:** As a developer maintaining the application, I want itinerary text translations to be managed through the existing i18n system, so that translation management remains consistent across the application.

#### Acceptance Criteria

1. WHEN new translation keys are added THEN the system SHALL store them in the INTERFACE_TRANSLATIONS dictionary in i18n.ts
2. WHEN translation keys are accessed THEN the system SHALL use the existing getTranslatedLabel function
3. WHEN a translation is missing for a language THEN the system SHALL fallback to the English translation
4. WHEN all supported languages are considered THEN the system SHALL provide translations for English, German, Spanish, French, Italian, Japanese, Dutch, Russian, and Chinese
5. WHEN the translation system is used THEN the system SHALL maintain consistency with existing translation patterns in the codebase