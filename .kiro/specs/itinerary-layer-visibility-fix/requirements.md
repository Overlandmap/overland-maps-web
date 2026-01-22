# Requirements Document

## Introduction

This feature addresses a critical bug where itinerary layers (both the line layer and labels layer) remain visible when switching from the 'itineraries' tab to other tabs ('overlanding', 'carnet', 'climate'). The layers should be properly hidden when not in itineraries mode to maintain visual clarity and prevent information overload.

## Glossary

- **Itinerary Layer**: The map layer that displays travel route lines with blue color (#3b82f6)
- **Itinerary Labels Layer**: The map layer that displays route identifiers (like "G6") along the itinerary lines
- **Color Scheme**: The current map display mode (overlanding, carnet, climate, itineraries)
- **Layer Visibility**: The MapLibre GL property that controls whether a layer is shown ('visible') or hidden ('none')
- **Tab Switching**: The user action of changing between different map modes via the UI tabs

## Requirements

### Requirement 1

**User Story:** As a user, I want itinerary layers to be hidden when I switch away from the itineraries tab, so that I can view other map data without visual interference from travel routes.

#### Acceptance Criteria

1. WHEN a user switches from 'itineraries' to 'overlanding' tab THEN the system SHALL hide both itinerary and itinerary-labels layers
2. WHEN a user switches from 'itineraries' to 'carnet' tab THEN the system SHALL hide both itinerary and itinerary-labels layers  
3. WHEN a user switches from 'itineraries' to 'climate' tab THEN the system SHALL hide both itinerary and itinerary-labels layers
4. WHEN a user switches back to 'itineraries' tab THEN the system SHALL show both itinerary and itinerary-labels layers
5. WHEN layer visibility changes occur THEN the system SHALL apply changes immediately without requiring page refresh

### Requirement 2

**User Story:** As a developer, I want reliable layer visibility management, so that layer state is consistent and predictable across all tab switches.

#### Acceptance Criteria

1. WHEN the color scheme changes THEN the system SHALL synchronize visibility for both itinerary layers consistently
2. WHEN layer visibility is set THEN the system SHALL verify the change was applied successfully
3. WHEN a layer visibility operation fails THEN the system SHALL log the error and attempt recovery
4. WHEN switching between non-itinerary modes THEN the system SHALL maintain itinerary layers in hidden state
5. WHEN the map is reloaded or style changes THEN the system SHALL preserve correct layer visibility based on current color scheme

### Requirement 3

**User Story:** As a user, I want smooth visual transitions when switching tabs, so that the interface feels responsive and professional.

#### Acceptance Criteria

1. WHEN tab switching occurs THEN the system SHALL complete layer visibility changes within 100 milliseconds
2. WHEN multiple rapid tab switches occur THEN the system SHALL handle them gracefully without visual glitches
3. WHEN layer visibility changes THEN the system SHALL not cause map flickering or rendering artifacts
4. WHEN switching to itineraries mode THEN the system SHALL ensure layers are created before making them visible
5. WHEN error conditions occur THEN the system SHALL maintain visual stability and provide user feedback