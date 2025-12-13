# Implementation Plan

- [x] 1. Add itinerary zoom functionality to map interactions
  - Add `fitBounds` function to SimpleMapContainer.tsx map interactions
  - Implement bounds calculation utility for itinerary geometries
  - Handle different geometry types (Point, LineString, MultiLineString)
  - Include appropriate padding in bounds calculation
  - _Requirements: 1.2, 1.3, 2.2_

- [x] 1.1 Write property test for geometry bounds calculation
  - **Property 6: Geometry type handling**
  - **Validates: Requirements 2.2**

- [x] 1.2 Write property test for zoom padding inclusion
  - **Property 3: Zoom padding inclusion**
  - **Validates: Requirements 1.3**

- [x] 2. Add onItineraryZoom prop to DetailSidebar component
  - Update DetailSidebar component interface to include onItineraryZoom callback
  - Add prop type definition for itinerary zoom callback
  - Pass geometry bounds to callback when zoom is requested
  - _Requirements: 1.2, 2.1_

- [x] 3. Implement zoom button in itinerary detail panel
  - Add zoom button to renderItineraryDetails function in DetailSidebar.tsx
  - Use existing zoom_to_location translation key for button text
  - Style button consistently with existing border post zoom button
  - Position button prominently in the itinerary detail layout
  - _Requirements: 1.1, 2.5_

- [ ]* 3.1 Write property test for zoom button visibility
  - **Property 1: Zoom button visibility**
  - **Validates: Requirements 1.1**

- [x] 4. Implement zoom button state management
  - Disable zoom button when itinerary has no geometry data
  - Show appropriate tooltip/feedback for disabled state
  - Handle edge cases with invalid or missing geometry
  - _Requirements: 1.4, 2.3_

- [ ]* 4.1 Write property test for disabled state handling
  - **Property 4: Disabled state for missing geometry**
  - **Validates: Requirements 1.4**

- [ ]* 4.2 Write property test for error handling resilience
  - **Property 7: Error handling resilience**
  - **Validates: Requirements 2.3**

- [x] 5. Connect zoom functionality in WorldMapApp
  - Add handleItineraryZoom callback function to WorldMapApp.tsx
  - Pass onItineraryZoom prop to DetailSidebar component
  - Integrate with existing mapInteractions to call fitBounds
  - Handle zoom operation errors gracefully
  - _Requirements: 1.2, 1.5, 2.1, 2.3_

- [ ]* 5.1 Write property test for zoom functionality execution
  - **Property 2: Zoom functionality execution**
  - **Validates: Requirements 1.2**

- [ ]* 5.2 Write property test for state preservation during zoom
  - **Property 5: State preservation during zoom**
  - **Validates: Requirements 1.5**

- [ ]* 5.3 Write property test for single itinerary zoom scope
  - **Property 8: Single itinerary zoom scope**
  - **Validates: Requirements 2.4**

- [ ]* 5.4 Write unit tests for WorldMapApp zoom integration
  - Test handleItineraryZoom callback implementation
  - Test error handling in zoom operations
  - Test integration with existing map interactions
  - _Requirements: 1.2, 1.5, 2.1, 2.3_

- [x] 6. Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.