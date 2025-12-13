# Itinerary URL Highlighting Implementation Plan

## Implementation Tasks

- [x] 1. Implement itinerary highlighting function in SimpleMapContainer
  - Add `highlightItinerary(itineraryId: string)` function following existing highlight patterns
  - Use MapLibre GL JS paint properties to style highlighted itinerary (increased width, distinct color)
  - Store selected itinerary ID in ref for state management
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.3_

- [x] 2. Enhance clearAllHighlights function to include itinerary clearing
  - Add itinerary highlight clearing logic to existing `clearAllHighlights` function
  - Reset itinerary paint properties to default state
  - Clear selected itinerary ID ref
  - _Requirements: 1.4, 2.2, 2.3_

- [x] 3. Add itinerary highlighting to map interactions object
  - Include `highlightItinerary` function in the interactions object passed to `onMapReady`
  - Ensure function is available for WorldMapApp to call
  - Follow same pattern as other highlight functions
  - _Requirements: 3.1, 3.2_

- [x] 4. Add color scheme switching to itinerary selection flow
  - Modify WorldMapApp's `handleItineraryClick` to set color scheme to 'itineraries' before highlighting
  - Update initial selection useEffect to set color scheme when `initialItinerary` is provided
  - Use `useColorScheme` hook to access `setColorScheme` function
  - Ensure color scheme change happens before highlight is applied
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Integrate highlighting with existing itinerary selection flow
  - Modify WorldMapApp's `handleItineraryClick` to call `highlightItinerary` when available
  - Ensure highlighting works for both URL-driven and click-driven selections
  - Maintain existing functionality while adding visual feedback
  - Coordinate with color scheme changes to ensure proper layer visibility
  - _Requirements: 1.1, 1.5, 2.4, 3.5_

- [x] 6. Write unit tests for itinerary highlighting
  - Test `highlightItinerary` function with valid and invalid itinerary IDs
  - Test highlight clearing in enhanced `clearAllHighlights` function
  - Test map interactions object includes new highlighting function
  - Test error handling for missing layers or invalid IDs
  - _Requirements: 3.4, 3.5_

- [ ]* 7. Write property-based tests for highlighting behavior
  - **Property 1: Itinerary Highlight Exclusivity** - **Validates: Requirements 1.5, 2.2**
  - **Property 2: Highlight Visual Consistency** - **Validates: Requirements 1.2, 2.1**
  - **Property 3: Highlight State Synchronization** - **Validates: Requirements 1.1, 2.4**
  - **Property 4: Highlight Cleanup on Clear** - **Validates: Requirements 1.4, 2.3**
  - **Property 5: Color Scheme Auto-Selection** - **Validates: Requirements 3.1**
  - **Property 6: Layer Visibility Consistency** - **Validates: Requirements 3.2, 3.3**

- [ ]* 8. Write integration tests for full highlighting flow
  - Test complete URL → highlight flow with real map instance
  - Test interaction between itinerary highlighting and layer visibility changes
  - Test browser navigation and highlight state persistence
  - Test sidebar open/close with highlight state changes
  - _Requirements: 2.4, 2.5_

- [x] 9. Add error handling and logging
  - Add try-catch blocks around MapLibre GL JS paint property updates
  - Log appropriate warnings for missing layers or invalid itinerary IDs
  - Ensure graceful degradation when highlighting fails
  - _Requirements: 4.4_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.