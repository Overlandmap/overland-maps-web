# Requirements Document

## Introduction

This specification addresses the inconsistency in border post detail display between accessing border posts via map clicks versus direct URL loading. Currently, the border post detail pane shows different content depending on the access method, with the URL-loaded version correctly displaying translated comments while the map-clicked version does not.

## Glossary

- **Border Post Detail Pane**: The detailed view in the DetailSidebar component that displays information about a selected border post
- **Comment Translations**: Database fields that contain translation maps indexed by language codes (e.g., `comment_translations`)
- **Map Click Access**: Accessing border post details by clicking on a border post marker on the map
- **URL Direct Access**: Accessing border post details by loading a URL like `/border_post/<ID>`
- **DetailSidebar Component**: The React component responsible for rendering all feature detail views
- **Translation Fallback**: The process of trying current language, then English, then original field value

## Requirements

### Requirement 1

**User Story:** As a user, I want to see consistent border post information regardless of how I access the border post details, so that I have a reliable and predictable experience.

#### Acceptance Criteria

1. WHEN a user clicks on a border post on the map THEN the system SHALL display the same content as when loading the border post via direct URL
2. WHEN a border post has comment_translations field AND the user's selected language exists in the translation map THEN the system SHALL display the translated comment instead of the original comment
3. WHEN a border post has comment_translations field BUT the user's selected language is not available THEN the system SHALL fallback to English, then to the original comment field
4. WHEN neither comment_translations nor original comment fields exist THEN the system SHALL not display any comment section
5. WHEN the border post detail pane is displayed THEN the system SHALL include the zoom to location button with proper translations

### Requirement 2

**User Story:** As a multilingual user, I want to see border post comments in my preferred language when available, so that I can understand the information in my native language.

#### Acceptance Criteria

1. WHEN a border post contains comment_translations for the current language THEN the system SHALL display the translated comment text
2. WHEN a border post contains comment_translations but not for the current language THEN the system SHALL display the English translation if available
3. WHEN no translation is available in comment_translations THEN the system SHALL display the original comment field value
4. WHEN the language is changed THEN the system SHALL update the displayed comment to match the new language selection
5. WHEN comment_translations is malformed or invalid THEN the system SHALL gracefully fallback to the original comment field

### Requirement 3

**User Story:** As a developer, I want the border post rendering logic to be consistent with other feature types, so that the codebase is maintainable and follows established patterns.

#### Acceptance Criteria

1. WHEN rendering border post details THEN the system SHALL use the same translation pattern as zone details
2. WHEN merging data sources THEN the system SHALL prioritize the most complete data source for translation fields
3. WHEN handling missing or invalid data THEN the system SHALL gracefully degrade without breaking the interface
4. WHEN processing comment_translations THEN the system SHALL validate the field type and structure before accessing translations
5. WHEN displaying translated content THEN the system SHALL maintain consistent styling and layout with other translated fields