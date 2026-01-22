# Requirements Document

## Introduction

This feature adds support for displaying translated comment content in border detail panes using comment_translations fields. Currently, border detail information displays comments only in their original language. This enhancement will enable the application to display comment fields in the user's selected language when translations are available in the comment_translations field, and translate the 'comment' label itself.

## Glossary

- **Border Detail Pane**: The detailed view in the DetailSidebar component that displays information about a selected border
- **Comment Translations**: Database fields that contain translation maps indexed by language codes (e.g., `comment_translations`)
- **Translation Map**: A JavaScript object where keys are language codes and values are translated text strings
- **Selected Language**: The currently active language chosen by the user through the language context
- **Comment Label**: The UI label that appears before the comment text (e.g., "Comment:", "Commentaire:", etc.)

## Requirements

### Requirement 1

**User Story:** As a user, I want to see border comments in my selected language, so that I can understand border-specific information in my preferred language.

#### Acceptance Criteria

1. WHEN a border has comment_translations field AND the user's selected language exists in the translation map THEN the system SHALL display the translated comment instead of the original comment
2. WHEN a border has comment_translations field BUT the user's selected language is not available THEN the system SHALL fallback to English, then to the original comment field
3. WHEN neither comment_translations nor original comment fields exist THEN the system SHALL not display any comment section
4. WHEN the language is changed THEN the system SHALL update the displayed comment to match the new language selection
5. WHEN comment_translations is malformed or invalid THEN the system SHALL gracefully fallback to the original comment field

### Requirement 2

**User Story:** As a user, I want to see the comment label translated in my selected language, so that the interface is consistent with my language preference.

#### Acceptance Criteria

1. WHEN displaying a border comment THEN the system SHALL show the comment label translated using the getTranslatedLabel function
2. WHEN the language is changed THEN the system SHALL update the comment label to match the new language selection
3. WHEN a translation for the comment label is not available THEN the system SHALL fallback to English or the default label

### Requirement 3

**User Story:** As a developer, I want the border comment translation implementation to be consistent with existing translation patterns, so that the codebase remains maintainable and follows established conventions.

#### Acceptance Criteria

1. WHEN implementing comment translations THEN the system SHALL use the same translation helper functions used by other components
2. WHEN handling translation fallbacks THEN the system SHALL follow the same fallback chain used by border_post and zone components
3. WHEN validating translation data THEN the system SHALL use the existing validation helper functions
4. WHEN processing comment_translations THEN the system SHALL validate the field type and structure before accessing translations
5. WHEN displaying translated content THEN the system SHALL maintain consistent styling and layout with other translated fields