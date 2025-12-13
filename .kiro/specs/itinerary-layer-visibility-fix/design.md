# Design Document

## Overview

This design addresses the bug where itinerary layers remain visible when switching away from the itineraries tab. The issue stems from inconsistent layer visibility management in the existing useEffect hooks that handle color scheme changes. The solution involves consolidating layer visibility logic and ensuring proper cleanup when switching away from itineraries mode.

## Architecture

The current architecture has multiple useEffect hooks managing different aspects of layer visibility:
1. One effect for itinerary and hillshade layers
2. Another effect for overlanding layers (country, border, etc.)
3. Separate effects for border posts and zones

The problem is that these effects don't properly coordinate when switching away from itineraries mode, leading to layers remaining visible.

### Current Issues
- Layer visibility changes are scattered across multiple useEffect hooks
- No centralized cleanup when switching away from itineraries mode
- Race conditions between different visibility management effects
- Inconsistent error handling and logging

### Proposed Solution
- Consolidate itinerary layer visibility management into a single, focused effect
- Implement proper cleanup logic when switching away from itineraries mode
- Add verification and recovery mechanisms for failed visibility changes
- Improve coordination between different layer management effects

## Components and Interfaces

### Layer Visibility Manager
The existing `safeSetLayerVisibility` function will be enhanced to provide better error handling and verification.

### Color Scheme Effect Handler
A consolidated useEffect hook will manage itinerary layer visibility based on color scheme changes.

### Verification System
New functions to verify layer visibility changes were applied successfully.

## Data Models

### Layer Visibility State
```typescript
interface LayerVisibilityState {
  layerId: string
  visibility: 'visible' | 'none'
  verified: boolean
  lastUpdated: number
}
```

### Color Scheme Transition
```typescript
interface ColorSchemeTransition {
  from: ColorScheme
  to: ColorScheme
  timestamp: number
  layersToHide: string[]
  layersToShow: string[]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Itinerary layer hiding on tab switch away
*For any* color scheme change from 'itineraries' to any other mode ('overlanding', 'carnet', 'climate'), both itinerary and itinerary-labels layers should be hidden immediately
**Validates: Requirements 1.1, 1.2, 1.3**

Property 2: Itinerary layer showing on tab switch to
*For any* color scheme change to 'itineraries' from any other mode, both itinerary and itinerary-labels layers should be visible immediately
**Validates: Requirements 1.4**

Property 3: Layer visibility synchronization
*For any* color scheme change, both itinerary and itinerary-labels layers should have the same visibility state (both visible or both hidden)
**Validates: Requirements 2.1**

Property 4: Visibility change verification and timing
*For any* layer visibility change operation, the system should verify the change was applied successfully within 100 milliseconds
**Validates: Requirements 2.2, 3.1**

Property 5: Non-itinerary mode persistence
*For any* sequence of color scheme changes between non-itinerary modes (overlanding, carnet, climate), itinerary layers should remain hidden throughout the entire sequence
**Validates: Requirements 2.4**

Property 6: Rapid switching stability
*For any* sequence of rapid color scheme changes, the final layer visibility state should match the final color scheme regardless of intermediate states
**Validates: Requirements 3.2**

Property 7: Layer creation before visibility
*For any* switch to itineraries mode, if layers don't exist, they should be created before being made visible
**Validates: Requirements 3.4**

Property 8: Error recovery without crashes
*For any* layer visibility operation that fails, the system should log the error and continue operating without throwing exceptions
**Validates: Requirements 2.3, 3.5**

## Error Handling

### Layer Not Found Errors
- Log warning when layer doesn't exist
- Attempt to recreate layer if in itineraries mode
- Continue with other operations to maintain stability

### Visibility Change Failures
- Retry visibility change up to 3 times
- Log detailed error information
- Maintain previous state if all retries fail

### Race Condition Prevention
- Use debouncing for rapid color scheme changes
- Implement proper cleanup in useEffect hooks
- Add verification delays to ensure changes are applied

## Testing Strategy

### Unit Tests
- Test individual layer visibility functions
- Test color scheme transition logic
- Test error handling and recovery mechanisms
- Test verification functions

### Property-Based Tests
- Generate random color scheme sequences and verify layer visibility
- Test rapid switching scenarios with random timing
- Verify consistency across different browser environments
- Test error injection and recovery scenarios

The property-based testing will use React Testing Library and Jest with custom generators for color scheme sequences and timing variations. Each test will run a minimum of 100 iterations to catch edge cases and race conditions.

### Integration Tests
- Test complete tab switching workflows
- Test interaction with other layer management systems
- Test performance under rapid switching conditions
- Test visual consistency across different screen sizes