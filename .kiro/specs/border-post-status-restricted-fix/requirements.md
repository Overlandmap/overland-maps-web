# Border Post Status Label Fix Requirements

## Introduction

This specification addresses the need to update the border post status mapping to correctly label `is_open=3` as "Restricted" instead of the current incorrect mapping. This affects both the border detail view (where border posts are listed) and the individual border post detail view.

## Glossary

- **Border Post**: A physical checkpoint at a border crossing between countries
- **Border Detail View**: The sidebar that shows information about a selected border, including a list of associated border posts
- **Border Post Detail View**: The sidebar that shows detailed information about a specific border post
- **Status Swatch**: A colored indicator showing the operational status of a border post
- **is_open**: A numeric field indicating the operational status of a border post (0=Closed, 1=Bilateral, 2=Open, 3=Restricted)

## Requirements

### Requirement 1

**User Story:** As a traveler viewing border information, I want to see the correct status label for border posts with `is_open=3`, so that I understand they are "Restricted" rather than incorrectly labeled.

#### Acceptance Criteria

1. WHEN a border post has `is_open=3` THEN the system SHALL display the label "Restricted" in the border detail view
2. WHEN a border post has `is_open=3` THEN the system SHALL display the label "Restricted" in the border post detail view  
3. WHEN a border post has `is_open=3` THEN the system SHALL use appropriate color coding for the "Restricted" status
4. WHEN displaying border post status labels THEN the system SHALL translate the "Restricted" label to all supported languages
5. WHEN viewing the map legend for border posts THEN the system SHALL show "Restricted" as the label for the yellow color indicator

### Requirement 2

**User Story:** As a traveler using the application in different languages, I want the "Restricted" status to be properly translated, so that I can understand border post restrictions in my preferred language.

#### Acceptance Criteria

1. WHEN the language is set to English THEN the system SHALL display "Restricted" for `is_open=3`
2. WHEN the language is set to German THEN the system SHALL display "Eingeschränkt" for `is_open=3`
3. WHEN the language is set to Spanish THEN the system SHALL display "Restringido" for `is_open=3`
4. WHEN the language is set to French THEN the system SHALL display "Restreint" for `is_open=3`
5. WHEN the language is set to Italian THEN the system SHALL display "Limitato" for `is_open=3`
6. WHEN the language is set to Japanese THEN the system SHALL display "制限" for `is_open=3`
7. WHEN the language is set to Dutch THEN the system SHALL display "Beperkt" for `is_open=3`
8. WHEN the language is set to Russian THEN the system SHALL display "Ограничено" for `is_open=3`
9. WHEN the language is set to Chinese THEN the system SHALL display "受限" for `is_open=3`

### Requirement 3

**User Story:** As a developer maintaining the application, I want the border post status mapping to be consistent across all components, so that the same status values produce the same labels and colors throughout the application.

#### Acceptance Criteria

1. WHEN `is_open=3` is processed by the `getBorderPostStatus` function THEN it SHALL return "Restricted" label and appropriate color
2. WHEN the map renders border posts with `is_open=3` THEN they SHALL use the same color as defined in the status function
3. WHEN the legend displays border post statuses THEN the color for "Restricted" SHALL match the map visualization
4. WHEN border posts are displayed in border detail lists THEN the status swatch SHALL use consistent colors and labels
5. WHEN border posts are displayed in individual detail views THEN the status SHALL use consistent colors and labels