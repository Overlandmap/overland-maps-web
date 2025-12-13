# Design Document

## Overview

This design implements a zoom button in the itinerary detail panel that allows users to zoom the map to fit the selected itinerary's geographic bounds. The solution extends the existing DetailSidebar component by adding a zoom button and integrates with the existing map interaction system to provide smooth zoom functionality with appropriate padding.

## Architecture

The zoom functionality follows the existing map interaction architecture:
- The DetailSidebar component receives map interaction functions via props from WorldMapApp
- A new `onItineraryZoom` callback prop is added to DetailSidebar to handle zoom requests
- The WorldMapApp component implements the zoom logic using the existing map interactions
- The zoom functionality uses MapLibre GL JS's `fitBounds` method for smooth animation
- Geometry bounds calculation handles both LineString and Point geometries

## Components and Interfaces

### Modified Components

**DetailSidebar.tsx**
- Add `onItineraryZoom` prop to component interface
- Add zoom button to `renderItineraryDetails()` function
- Implement geometry bounds calculation utility function
- Use existing translation system for button text
- Handle edge cases where geometry data is missing

**WorldMapApp.tsx**
- Add `handleItineraryZoom` callback function
- Pass the callback to DetailSidebar via `onItineraryZoom` prop
- Integrate with existing `mapInteractions.zoomToLocation` or implement new `fitBounds` functionality

**SimpleMapContainer.tsx** (if needed)
- Add `fitBounds` function to map interactions if not already available
- Ensure proper bounds calculation and padding for itinerary geometries

### New Interfaces

```typescript
interface ItineraryZoomProps {
  onItineraryZoom?: (bounds: [[number, number], [number, number]]) => void
}

interface GeometryBounds {
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number
}
```

## Data Models

The zoom functionality works with existing itinerary data models:
```typescript
interface ItineraryFeature {
  geometry: {
    type: 'LineString' | 'Point' | 'MultiLineString'
    coordinates: number[][] | number[][][]
  }
  properties: {
    itineraryId: string
    name: string
    // ... other properties
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Zoom button visibility
*For any* itinerary detail panel rendering, a zoom button should be visible and properly styled when itinerary geometry data is available
**Validates: Requirements 1.1**

Property 2: Zoom functionality execution
*For any* itinerary with valid geometry data, clicking the zoom button should trigger the map zoom function with calculated bounds
**Validates: Requirements 1.2**

Property 3: Zoom padding inclusion
*For any* zoom operation, the bounds calculation should include appropriate padding for better route visibility
**Validates: Requirements 1.3**

Property 4: Disabled state for missing geometry
*For any* itinerary without geometry data, the zoom button should be disabled and show appropriate feedback
**Validates: Requirements 1.4**

Property 5: State preservation during zoom
*For any* zoom operation, the itinerary selection and detail panel state should remain unchanged after zoom completion
**Validates: Requirements 1.5**

Property 6: Geometry type handling
*For any* itinerary geometry type (LineString, Point, MultiLineString), the bounds calculation should work correctly
**Validates: Requirements 2.2**

Property 7: Error handling resilience
*For any* zoom operation failure, the user interface should remain functional and provide appropriate error feedback
**Validates: Requirements 2.3**

Property 8: Single itinerary zoom scope
*For any* selected itinerary in a context with multiple itineraries, only the selected itinerary's bounds should be used for zooming
**Validates: Requirements 2.4**

## Error Handling

The zoom functionality includes comprehensive error handling:
- Missing geometry data: Button is disabled with tooltip explanation
- Invalid geometry format: Graceful fallback with error logging
- Map interaction failures: User-friendly error messages without UI breakage
- Bounds calculation errors: Fallback to center point zoom
- Network or rendering errors: Maintain component stability

## Testing Strategy

### Unit Testing
- Test zoom button rendering with different itinerary data states
- Test bounds calculation for various geometry types
- Test error handling for invalid or missing data
- Test integration with existing translation system
- Test component state management during zoom operations

### Property-Based Testing
The testing approach will use React Testing Library for component testing and Jest for unit testing. Property-based tests will use fast-check to:
- Generate random itinerary geometries and verify bounds calculation
- Generate various data states to test button visibility and disabled states
- Test zoom functionality with different map interaction scenarios
- Verify error handling with invalid geometry data
- Test state preservation across zoom operations

Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage. Tests will be tagged with comments referencing the specific correctness property using the format: '**Feature: itinerary-zoom-button, Property {number}: {property_text}**'

### Integration Testing
- Test end-to-end zoom workflow from button click to map update
- Test interaction with existing map controls and features
- Test zoom functionality across different viewport sizes
- Test accessibility compliance for keyboard navigation

## Implementation Details

### Bounds Calculation Algorithm
```typescript
function calculateItineraryBounds(geometry: any): [[number, number], [number, number]] | null {
  if (!geometry || !geometry.coordinates) return null
  
  let minLng = Infinity, maxLng = -Infinity
  let minLat = Infinity, maxLat = -Infinity
  
  const processCoordinate = (coord: number[]) => {
    const [lng, lat] = coord
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  }
  
  // Handle different geometry types
  if (geometry.type === 'Point') {
    processCoordinate(geometry.coordinates)
  } else if (geometry.type === 'LineString') {
    geometry.coordinates.forEach(processCoordinate)
  } else if (geometry.type === 'MultiLineString') {
    geometry.coordinates.forEach((line: number[][]) => 
      line.forEach(processCoordinate)
    )
  }
  
  // Add padding (10% of the bounds)
  const lngPadding = (maxLng - minLng) * 0.1
  const latPadding = (maxLat - minLat) * 0.1
  
  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding]
  ]
}
```

### Translation Keys
The zoom button will use existing translation infrastructure:
- `zoom_to_location`: Already exists in all supported languages
- Button will follow existing styling patterns from border post zoom button

### Accessibility Considerations
- Button includes proper ARIA labels and keyboard navigation
- Disabled state provides clear feedback via tooltip
- Focus management maintains usability standards
- Screen reader compatibility with descriptive button text