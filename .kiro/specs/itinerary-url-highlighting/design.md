# Itinerary URL Highlighting Design

## Overview

This design implements itinerary highlighting functionality to complete the feature selection system. When users visit `/itinerary/<id>` URLs, the system will visually highlight the selected itinerary on the map using MapLibre GL JS paint properties, following the same patterns established for other feature types.

## Architecture

The implementation follows the existing highlighting architecture with added color scheme management:

```
URL Route (/itinerary/<id>)
    ↓
WorldMapApp (handleItineraryClick + setColorScheme)
    ↓
ColorSchemeContext (colorScheme = 'itineraries')
    ↓
SimpleMapContainer (layer visibility + highlightItinerary)
    ↓
MapLibre GL JS (layer updates + paint property updates)
```

## Components and Interfaces

### SimpleMapContainer Enhancements

**New Functions:**
- `highlightItinerary(itineraryId: string)`: Highlights the specified itinerary
- Enhanced `clearAllHighlights()`: Includes itinerary highlight clearing
- Enhanced `onMapReady()`: Includes itinerary highlighting in interactions object

**Modified Functions:**
- `handleMapClick()`: Already handles itinerary clicks, no changes needed
- `clearAllHighlights()`: Add itinerary highlight clearing logic

### WorldMapApp Integration

**Modified Functions:**
- `handleItineraryClick()`: Enhanced to set color scheme to 'itineraries' before highlighting
- Initial selection useEffect: Enhanced to set color scheme when `initialItinerary` is provided

**Required Integration:**
- Map interactions object must include `highlightItinerary` function
- Color scheme must be set to 'itineraries' before calling highlight
- Highlight should be called after color scheme change is applied

## Data Models

### Itinerary Highlighting State

```typescript
interface ItineraryHighlightState {
  selectedItineraryId: string | null
  isHighlighted: boolean
}
```

### Map Interactions Enhancement

```typescript
interface MapInteractions {
  // Existing functions...
  highlightBorder: (borderId: string) => void
  highlightCountry: (countryId: string) => void
  highlightBorderPost: (borderPostId: string) => void
  highlightZone: (zoneId: string) => void
  
  // New function
  highlightItinerary: (itineraryId: string) => void
  
  clearSelection: () => void
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Itinerary Highlight Exclusivity
*For any* itinerary selection, only the selected itinerary should be highlighted while all other highlights are cleared
**Validates: Requirements 1.5, 2.2**

### Property 2: Highlight Visual Consistency
*For any* highlighted itinerary, the visual styling should follow the same pattern as other feature highlights (distinct color, increased opacity/width)
**Validates: Requirements 1.2, 2.1**

### Property 3: Highlight State Synchronization
*For any* URL navigation to `/itinerary/<id>`, the map highlight state should match the selected itinerary ID
**Validates: Requirements 1.1, 2.4**

### Property 4: Highlight Cleanup on Clear
*For any* selection clearing action (empty area click, sidebar close), all itinerary highlights should be removed
**Validates: Requirements 1.4, 2.3**

### Property 5: Color Scheme Auto-Selection
*For any* itinerary URL navigation, the color scheme should automatically be set to 'itineraries' mode
**Validates: Requirements 3.1**

### Property 6: Layer Visibility Consistency
*For any* color scheme change to 'itineraries', the itinerary layer should be visible and overlanding layers should be hidden
**Validates: Requirements 3.2, 3.3**

## Error Handling

### Map Layer Availability
- Check if itinerary layer exists before applying highlights
- Log warnings if layer is not available
- Gracefully degrade without breaking functionality

### Invalid Itinerary IDs
- Validate itinerary ID exists in map data
- Log errors for missing itineraries
- Clear highlights if invalid ID is provided

### MapLibre GL JS Errors
- Wrap paint property updates in try-catch blocks
- Log specific MapLibre errors
- Maintain application stability on map errors

## Testing Strategy

### Unit Tests
- Test `highlightItinerary` function with valid/invalid IDs
- Test highlight clearing in `clearAllHighlights`
- Test map interactions object includes new function
- Test error handling for missing layers/invalid IDs

### Property-Based Tests
- Generate random itinerary IDs and verify highlight exclusivity
- Test highlight state consistency across navigation events
- Verify visual styling consistency with other feature types
- Test cleanup behavior with various clearing scenarios

### Integration Tests
- Test full URL → highlight flow with real map instance
- Test interaction between itinerary highlighting and layer visibility
- Test browser navigation and highlight state persistence
- Test sidebar open/close with highlight state changes

## Implementation Notes

### MapLibre GL JS Paint Properties
Use the same approach as other highlights:
- Increase line width for selected itinerary
- Change line color to highlight color (white or bright color)
- Increase line opacity for better visibility

### Performance Considerations
- Reuse existing highlight clearing patterns
- Minimize paint property updates
- Use conditional expressions in paint properties when possible

### Backward Compatibility
- No breaking changes to existing APIs
- Additive changes only to map interactions
- Maintain existing behavior for all other features