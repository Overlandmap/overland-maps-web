# Requirements Document

## Introduction

This feature adds multi-language support for the "crossing between..." text that appears in border post detail views. Currently, this text is hardcoded in English and needs to be translated to match the user's selected language preference.

## Glossary

- **Border Post Detail View**: The sidebar that displays detailed information about a specific border post, including the crossing text
- **Crossing Text**: The descriptive text that shows which countries a border post connects (e.g., "Crossing between Russia and Kazakhstan")
- **Translation System**: The existing i18n infrastructure that provides multi-language support throughout the application
- **Language Context**: The user's currently selected language preference from the LanguageContext

## Requirements

### Requirement 1

**User Story:** As a user viewing border post details in a non-English language, I want to see the crossing text translated into my selected language, so that the interface is consistent and understandable.

#### Acceptance Criteria

1. WHEN a user selects a border post and views its details THEN the system SHALL display the crossing text in the user's selected language
2. WHEN the crossing text is generated from country codes THEN the system SHALL use translated country names in the crossing text
3. WHEN a user changes their language preference THEN the system SHALL update the crossing text to reflect the new language
4. WHEN translation data is not available for the selected language THEN the system SHALL fall back to English as the default
5. WHEN the crossing text template is displayed THEN the system SHALL maintain proper grammar and formatting for each supported language

### Requirement 2

**User Story:** As a developer maintaining the translation system, I want the crossing text to use the existing i18n infrastructure, so that translations are consistent and maintainable.

#### Acceptance Criteria

1. WHEN implementing crossing text translations THEN the system SHALL use the existing INTERFACE_TRANSLATIONS dictionary structure
2. WHEN adding new translation keys THEN the system SHALL provide translations for all supported languages (en, de, es, fr, it, ja, nl, ru, zh)
3. WHEN the crossing text is generated THEN the system SHALL use the getTranslatedLabel function for consistency
4. WHEN country names are included THEN the system SHALL use the existing getTranslatedCountryName function
5. WHEN translation keys are defined THEN the system SHALL follow the existing naming conventions in the i18n system