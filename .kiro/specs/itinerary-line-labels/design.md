# Design Document

## Overview

The itinerary line labels feature enhances the map's itinerary display mode by providing clear, readable labels along travel route lines. The system leverages MapLibre GL's symbol layer capabilities to render text labels that follow the geometry of itinerary lines, displaying the human-readable itineraryId property for easy route identification.

## Architecture

The feature integrates with the existing SimpleMapContainer component's layer management system. It utilizes the MapLibre GL symbol layer type with line placement to render text labels that follow the curvature of itinerary route geometries. The labels are managed as part of the map's layer hierarchy and respond to color scheme changes and zoom level adjustments.

### Component Integration
- **SimpleMapContainer**: Main container managing the itinerary-labels layer
- **MapLibre GL Map**: Rendering engine handling symbol placement and text rendering
- **PMTiles Data Source**: Provides itinerary geometry and properties including itineraryId

## Components and Interfaces

### Map Layer Configuration
```typescript
interface ItineraryLabelsLayer {
  id: 'itinerary-labels'
  type: 'symbol'
  source: 'country-border'
  'source-layer': 'itinerary'
  layout: SymbolLayout
  paint: SymbolPaint
}

interface SymbolLayout {
  'text-field': ['get', 'itineraryId']
  'text-font': string[]
  'text-size': number
  'text-anchor': string
  'symbol-placement': 'line'
  'text-rotation-alignment': 'map'
  'text-pitch-alignment': 'viewport'
  'visibility': 'visible' | 'none'
}

interface SymbolPaint {
  'text-color': string
  'text-halo-color': string
  'text-halo-width': number
}
```

### Visibility Management
The labels are controlled by the color scheme state, showing only when `colorScheme === 'itineraries'` to maintain visual clarity and prevent information overload in other map modes.

## Data Models

### Itinerary Feature Properties
```typescript
interface ItineraryProperties {
  itineraryId: string        // Human-readable identifier (e.g., "G6", "K5", "L28")
  itineraryDocId: string     // Firestore document ID
  name?: string              // Optional full name
  // ... other properties
}
```

### Label Rendering Data
```typescript
interface LabelRenderingContext {
  geometry: LineString | MultiLineString
  properties: ItineraryProperties
  zoomLevel: number
  mapBearing: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Itinerary mode label visibility
*For any* map state, when the color scheme is set to 'itineraries', all itinerary features should have corresponding visible labels displaying their itineraryId
**Validates: Requirements 1.1**

Property 2: Label line placement
*For any* itinerary line geometry, the label should be positioned along the line path using symbol-placement: 'line' configuration
**Validates: Requirements 1.2**

Property 3: Zoom level label persistence
*For any* zoom level change within the valid range, itinerary labels should remain visible and maintain appropriate sizing
**Validates: Requirements 1.4**

Property 4: Label contrast styling
*For any* itinerary label, the text should have sufficient contrast with white text color and red halo effect for readability
**Validates: Requirements 1.5**

Property 5: Consistent font configuration
*For any* itinerary label, the font family and weight should be consistently applied using the same text-font property
**Validates: Requirements 2.1**

Property 6: Halo effect application
*For any* itinerary label, a contrasting halo effect should be applied with specified color and width properties
**Validates: Requirements 2.2**

Property 7: Text rotation alignment
*For any* itinerary label, the text rotation should align with the map orientation using 'text-rotation-alignment': 'map'
**Validates: Requirements 2.4**

Property 8: Viewport pitch alignment
*For any* viewport change, labels should maintain consistent appearance using 'text-pitch-alignment': 'viewport'
**Validates: Requirements 2.5**

Property 9: Layer hierarchy integration
*For any* map initialization, the itinerary-labels layer should be added to the layer hierarchy without disrupting existing layers
**Validates: Requirements 3.1**

Property 10: Color scheme visibility control
*For any* color scheme change, itinerary labels should be visible only when colorScheme equals 'itineraries' and hidden otherwise
**Validates: Requirements 3.3**

Property 11: Data source dependency
*For any* map initialization, the itinerary-labels layer should only be created when the 'country-border' data source is available
**Validates: Requirements 3.4**

## Error Handling

### Missing Data Source
If the 'country-border' PMTiles source is unavailable, the system should gracefully skip itinerary label layer creation without throwing errors.

### Invalid ItineraryId Properties
If an itinerary feature lacks the itineraryId property, the label should display an empty string rather than causing rendering errors.

### Font Loading Failures
If the specified fonts ('Open Sans Bold', 'Arial Unicode MS Bold') fail to load, MapLibre GL will fall back to system default fonts automatically.

### Layer Creation Conflicts
If the 'itinerary-labels' layer already exists during initialization, the system should skip creation to prevent duplicate layer errors.

## Testing Strategy

### Unit Testing Approach
- Test layer configuration properties match expected values
- Verify visibility state changes correctly with color scheme
- Test error handling for missing data sources
- Validate font and styling property application

### Property-Based Testing Approach
The testing strategy will use **fast-check** as the property-based testing library for JavaScript/TypeScript. Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage of the input space.

Property-based tests will focus on:
- Label visibility across different color scheme states
- Layer configuration consistency across map reloads
- Styling property application across different itinerary features
- Error handling with various invalid input scenarios

Each property-based test will be tagged with comments explicitly referencing the correctness property from this design document using the format: **Feature: itinerary-line-labels, Property {number}: {property_text}**

### Integration Testing
- Test complete itinerary mode activation flow
- Verify label rendering with real PMTiles data
- Test zoom level changes with visible labels
- Validate color scheme switching behavior

### Visual Regression Testing
- Capture screenshots of itinerary labels at different zoom levels
- Compare label positioning and styling consistency
- Verify halo effects and text contrast in various map contexts