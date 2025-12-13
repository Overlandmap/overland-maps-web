# Implementation Plan

- [x] 1. Analyze current layer visibility management code
  - Review existing useEffect hooks that manage itinerary layer visibility
  - Identify race conditions and coordination issues between effects
  - Document current behavior and failure points
  - _Requirements: 1.1, 1.2, 1.3, 2.1_

- [x] 2. Create enhanced layer visibility verification functions
  - [x] 2.1 Implement layer visibility verification utility
    - Create function to verify layer visibility was applied successfully
    - Add timeout handling for verification (100ms max)
    - Include error logging for failed verifications
    - _Requirements: 2.2, 3.1_

  - [ ]* 2.2 Write property test for visibility verification
    - **Property 4: Visibility change verification and timing**
    - **Validates: Requirements 2.2, 3.1**

  - [x] 2.3 Implement enhanced safeSetLayerVisibility function
    - Add verification step after setting visibility
    - Include retry logic for failed operations (up to 3 attempts)
    - Add detailed error logging and recovery mechanisms
    - _Requirements: 2.2, 2.3_

  - [ ]* 2.4 Write property test for error recovery
    - **Property 8: Error recovery without crashes**
    - **Validates: Requirements 2.3, 3.5**

- [-] 3. Consolidate itinerary layer visibility management
  - [x] 3.1 Create centralized itinerary layer visibility effect
    - Replace scattered visibility logic with single consolidated useEffect
    - Ensure proper cleanup when switching away from itineraries mode
    - Add debouncing for rapid color scheme changes
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1_

  - [ ]* 3.2 Write property test for layer hiding on tab switch
    - **Property 1: Itinerary layer hiding on tab switch away**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 3.3 Write property test for layer showing on tab switch
    - **Property 2: Itinerary layer showing on tab switch to**
    - **Validates: Requirements 1.4**

  - [ ]* 3.4 Write property test for layer synchronization
    - **Property 3: Layer visibility synchronization**
    - **Validates: Requirements 2.1**

- [x] 4. Implement proper cleanup and coordination
  - [x] 4.1 Add cleanup logic for switching away from itineraries
    - Ensure both itinerary and itinerary-labels layers are hidden
    - Remove terrain and hide hillshade when leaving itineraries mode
    - Add verification that cleanup was successful
    - _Requirements: 1.1, 1.2, 1.3, 2.4_

  - [ ]* 4.2 Write property test for non-itinerary mode persistence
    - **Property 5: Non-itinerary mode persistence**
    - **Validates: Requirements 2.4**

  - [x] 4.3 Implement layer creation verification for itineraries mode
    - Check layer existence before making visible
    - Create missing layers if switching to itineraries mode
    - Ensure proper layer ordering and configuration
    - _Requirements: 3.4_

  - [ ]* 4.4 Write property test for layer creation before visibility
    - **Property 7: Layer creation before visibility**
    - **Validates: Requirements 3.4**

- [x] 5. Add rapid switching stability
  - [x] 5.1 Implement debounced color scheme change handling
    - Add debouncing to prevent race conditions during rapid switching
    - Ensure final state matches final color scheme selection
    - Add timeout cleanup for pending operations
    - _Requirements: 3.2_

  - [ ]* 5.2 Write property test for rapid switching stability
    - **Property 6: Rapid switching stability**
    - **Validates: Requirements 3.2**

  - [x] 5.3 Add performance monitoring for layer visibility changes
    - Track timing of visibility change operations
    - Log warnings for operations taking longer than 100ms
    - Add metrics for debugging performance issues
    - _Requirements: 3.1_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integration and testing
  - [x] 7.1 Update existing tests for new visibility management
    - Modify existing SimpleMapContainer tests to work with new logic
    - Update integration tests to verify proper layer coordination
    - Add test cases for error conditions and recovery
    - _Requirements: 2.3, 3.5_

  - [ ]* 7.2 Write integration tests for complete tab switching workflows
    - Test complete user workflows from itineraries to other tabs
    - Verify visual consistency and performance
    - Test interaction with other layer management systems
    - _Requirements: 1.5, 3.1, 3.2_

  - [x] 7.3 Add error injection testing
    - Create test utilities to simulate layer operation failures
    - Verify error handling and recovery mechanisms work correctly
    - Test system stability under various error conditions
    - _Requirements: 2.3, 3.5_

- [x] 8. Final verification and cleanup
  - [x] 8.1 Verify all requirements are met
    - Test all tab switching combinations manually
    - Verify timing requirements are met (100ms max)
    - Check error handling and logging works correctly
    - _Requirements: All_

  - [x] 8.2 Clean up old unused code
    - Remove redundant layer visibility management code
    - Clean up console logging and debug statements
    - Update code comments and documentation
    - _Requirements: Maintenance_

- [x] 9. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.