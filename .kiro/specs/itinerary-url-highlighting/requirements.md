# Itinerary URL Highlighting Requirements

## Introduction

This specification addresses the missing itinerary highlighting functionality when users visit `/itinerary/<id>` URLs. Currently, the system can load itinerary details in the sidebar but fails to visually highlight the selected itinerary on the map, creating an inconsistent user experience compared to other feature types (countries, borders, zones).

## Glossary

- **Itinerary**: A travel route displayed as a line on the map with associated metadata
- **Highlighting**: Visual emphasis of a selected feature on the map through styling changes
- **SimpleMapContainer**: The main map component that handles feature interactions and highlighting
- **WorldMapApp**: The parent component that manages application state and coordinates between map and sidebar
- **Detail Sidebar**: The panel that displays detailed information about selected features
- **Color Scheme**: The map display mode that determines which layers are visible and how they are styled
- **Itineraries Mode**: A specific color scheme that shows travel routes with terrain and hillshade enabled
- **ColorSchemeContext**: React context that manages the current color scheme state across the application

## Requirements

### Requirement 1

**User Story:** As a user, I want to see the selected itinerary visually highlighted on the map when I visit an itinerary URL, so that I can immediately identify which route is being displayed in the detail panel.

#### Acceptance Criteria

1. WHEN a user visits `/itinerary/<id>` URL THEN the system SHALL highlight the corresponding itinerary line on the map
2. WHEN an itinerary is highlighted THEN the system SHALL use a distinct visual style that differentiates it from non-selected itineraries
3. WHEN an itinerary is highlighted THEN the system SHALL maintain the highlight until another feature is selected or the selection is cleared
4. WHEN the detail sidebar is closed THEN the system SHALL remove the itinerary highlight
5. WHEN switching between different itineraries THEN the system SHALL update the highlight to show only the currently selected itinerary

### Requirement 2

**User Story:** As a user, I want the itinerary highlighting to be consistent with other feature highlighting behaviors, so that the interface feels cohesive and predictable.

#### Acceptance Criteria

1. WHEN an itinerary is highlighted THEN the system SHALL follow the same highlighting patterns used for borders, zones, and countries
2. WHEN multiple features are clicked in sequence THEN the system SHALL clear previous highlights before applying new ones
3. WHEN the map is clicked on empty areas THEN the system SHALL clear all highlights including itinerary highlights
4. WHEN browser navigation occurs THEN the system SHALL maintain highlight state consistency with the current URL
5. WHEN the itinerary layer visibility changes THEN the system SHALL preserve highlight state for when the layer becomes visible again

### Requirement 3

**User Story:** As a user, I want the map to automatically switch to itineraries mode when I visit an itinerary URL, so that I can see the itinerary layer and related features without manual configuration.

#### Acceptance Criteria

1. WHEN a user visits `/itinerary/<id>` URL THEN the system SHALL automatically set the color scheme to 'itineraries'
2. WHEN the color scheme changes to 'itineraries' THEN the system SHALL show the itinerary layer and hide overlanding-specific layers
3. WHEN the color scheme changes to 'itineraries' THEN the system SHALL enable terrain and hillshade for better route visualization
4. WHEN the itineraries tab is selected THEN the system SHALL update the legend to show itinerary-specific information
5. WHEN switching from other modes to itineraries mode THEN the system SHALL preserve the selected itinerary highlight

### Requirement 4

**User Story:** As a developer, I want the itinerary highlighting implementation to integrate seamlessly with the existing map interaction system, so that maintenance and future enhancements are straightforward.

#### Acceptance Criteria

1. WHEN implementing itinerary highlighting THEN the system SHALL use the same callback patterns as other highlight functions
2. WHEN the map interactions are initialized THEN the system SHALL include itinerary highlighting functions in the interactions object
3. WHEN itinerary highlighting is triggered THEN the system SHALL use MapLibre GL JS paint properties for visual changes
4. WHEN errors occur during highlighting THEN the system SHALL log appropriate error messages and gracefully degrade
5. WHEN the component unmounts THEN the system SHALL properly clean up itinerary highlight event listeners and state