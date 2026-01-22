# Requirements Document

## Introduction

This feature adds support for displaying translated content in country detail panes using Firestore translation fields. Currently, country detail information like comments, visa comments, and insurance comments are displayed only in their original language. This enhancement will enable the application to display these fields in the user's selected language when translations are available in Firestore.

## Glossary

- **Country Detail Pane**: The detailed view in the DetailSidebar component that displays information about a selected country
- **Firestore Translation Fields**: Database fields that contain translation maps indexed by language codes (e.g., `comment_translations`, `visa_comment_translations`, `insurance_comment_translations`)
- **Translation Map**: A JavaScript object where keys are language codes and values are translated text strings
- **Selected Language**: The currently active language chosen by the user through the language context
- **Fallback Chain**: The priority order for displaying content when translations are not available

## Requirements

### Requirement 1

**User Story:** As a user viewing country details in a non-English language, I want to see translated comments, visa information, and insurance information in my selected language, so that I can understand the content without language barriers.

#### Acceptance Criteria

1. WHEN a country has comment_translations field AND the user's selected language exists in the translation map THEN the system SHALL display the translated comment instead of the original comment
2. WHEN a country has visa_comment_translations field AND the user's selected language exists in the translation map THEN the system SHALL display the translated visa comment instead of the original visa_comment
3. WHEN a country has insurance_comment_translations field AND the user's selected language exists in the translation map THEN the system SHALL display the translated insurance comment instead of the original insurance_comment
4. WHEN translation fields exist BUT the user's selected language is not available THEN the system SHALL fallback to the original field value
5. WHEN neither translation fields nor original fields exist THEN the system SHALL ignore the field as it currently does

### Requirement 2

**User Story:** As a developer maintaining the translation system, I want the translation lookup to follow a consistent fallback pattern, so that users always see the most appropriate content available.

#### Acceptance Criteria

1. WHEN looking up translated content THEN the system SHALL check translation_field[selected_language] first
2. WHEN the selected language translation is null or undefined THEN the system SHALL check the original field value
3. WHEN the original field is also null or undefined THEN the system SHALL ignore the field completely
4. WHEN accessing translation maps THEN the system SHALL handle both null and undefined values gracefully
5. WHEN translation maps are malformed or invalid THEN the system SHALL fallback to original field values without errors

### Requirement 3

**User Story:** As a system administrator managing content, I want the translation system to work with the existing Firestore data structure, so that no database schema changes are required.

#### Acceptance Criteria

1. WHEN translation fields are accessed THEN the system SHALL support the existing Firestore field naming convention with '_translations' suffix
2. WHEN translation maps are read THEN the system SHALL expect language codes as keys matching the supported language codes in the i18n system
3. WHEN country data is processed THEN the system SHALL work with both country.parameters and direct country field locations
4. WHEN Firestore documents are loaded THEN the system SHALL handle missing translation fields without breaking existing functionality
5. WHEN new translation fields are added to Firestore THEN the system SHALL automatically use them without code changes