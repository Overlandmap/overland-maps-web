# Layer Visibility Management Analysis

## Overview

This analysis documents the current layer visibility management code in `SimpleMapContainer.tsx`, identifying race conditions, coordination issues, and failure points that cause itinerary layers to remain visible when switching away from the itineraries tab.

## Current Architecture

The layer visibility management is currently handled by multiple `useEffect` hooks that operate independently:

### 1. Color Scheme Change Effect (Lines 800-950)
- **Purpose**: Handles color scheme transitions and style reloading
- **Dependencies**: `[colorScheme, isLoaded, language, updateMapColors]`
- **Key Issues**:
  - Uses 100ms debouncing which can cause race conditions
  - Complex logic mixing style reloading with layer visibility
  - Inconsistent handling of itinerary layer cleanup when switching away

### 2. Itinerary Mode Effect (Lines 1510-1640)
- **Purpose**: Manages itinerary and itinerary-labels layer visibility, hillshade, and terrain
- **Dependencies**: `[colorScheme, isLoaded, safeSetLayerVisibility]`
- **Key Issues**:
  - Only handles showing itinerary layers, not proper cleanup when switching away
  - Complex layer recreation logic that can fail
  - No coordination with other effects

### 3. Overlanding Layers Effect (Lines 1642-1690)
- **Purpose**: Manages visibility of country, border, and border-highlight layers
- **Dependencies**: `[colorScheme, isLoaded]`
- **Key Issues**:
  - Uses 50ms timeout which can create race conditions with other effects
  - Doesn't properly coordinate with itinerary layer cleanup

### 4. Zones Layer Effect (Lines 1490-1510)
- **Purpose**: Controls zones and zone-highlight layer visibility
- **Dependencies**: `[colorScheme, isLoaded]`
- **Behavior**: Only visible in 'overlanding' mode

### 5. Border Posts Effect (Lines 1750-1770)
- **Purpose**: Controls border post visibility based on toggle and color scheme
- **Dependencies**: `[showBorderPosts, colorScheme, isLoaded]`
- **Behavior**: Hidden in 'carnet', 'climate', and 'itineraries' modes

## Identified Issues

### Race Conditions

1. **Timing Conflicts**: Multiple effects with different timeouts (50ms, 100ms) can execute in unpredictable order
2. **Debouncing Issues**: The color scheme change effect uses debouncing which can delay cleanup operations
3. **Layer Recreation**: Effects may try to recreate layers while other effects are managing their visibility

### Coordination Problems

1. **No Central State**: Each effect manages its own subset of layers without awareness of others
2. **Inconsistent Cleanup**: When switching away from itineraries mode:
   - Itinerary mode effect doesn't always hide layers properly
   - Overlanding layers effect may not execute if timing is off
   - No verification that cleanup was successful

3. **Style Reload Conflicts**: When switching from climate mode, the style reload can interfere with layer visibility management

### Specific Failure Points

#### Issue 1: Itinerary Layers Remain Visible
**Root Cause**: The itinerary mode effect (lines 1510-1640) focuses on showing layers when `colorScheme === 'itineraries'` but doesn't reliably hide them when switching away.

**Code Analysis**:
```typescript
const isItinerariesMode = colorScheme === 'itineraries'
const itinerariesVisibility = isItinerariesMode ? 'visible' : 'none'

// This should hide layers when switching away, but can fail due to:
// 1. Layer not existing (in climate mode)
// 2. Race conditions with other effects
// 3. Style reload interrupting the operation
const itinerarySuccess = safeSetLayerVisibility('itinerary', itinerariesVisibility, 'itineraries mode toggle')
const labelsSuccess = safeSetLayerVisibility('itinerary-labels', itinerariesVisibility, 'itineraries mode toggle')
```

#### Issue 2: Overlanding Layers Effect Timing
**Root Cause**: The overlanding layers effect uses a 50ms timeout which can execute before or after the itinerary cleanup, leading to inconsistent state.

**Code Analysis**:
```typescript
// This timeout can create race conditions
const timeoutId = setTimeout(() => {
  if (!map.current) return
  
  const alwaysVisibleLayers = ['country', 'border', 'border-highlight']
  alwaysVisibleLayers.forEach(layerId => {
    const visibility = isItinerariesMode ? 'none' : 'visible'
    // This may execute before itinerary layers are hidden
  })
}, 50)
```

#### Issue 3: Style Reload Interference
**Root Cause**: When switching from climate mode, the style reload can interrupt layer visibility operations or reset layer states.

**Code Analysis**:
```typescript
// Style reload can reset all layer visibility states
map.current.setStyle(styleUrl)

// The styledata event handler recreates layers but may not preserve
// the correct visibility state for the current color scheme
map.current.once('styledata', handleStyleLoad)
```

## Current Behavior Documentation

### Working Scenarios
1. **Overlanding ↔ Carnet**: Works correctly, only country layer colors change
2. **Climate Mode**: Works correctly, uses separate style file
3. **Initial Load**: Works correctly, layers are created with proper initial visibility

### Failing Scenarios
1. **Itineraries → Overlanding**: Itinerary layers often remain visible
2. **Itineraries → Carnet**: Itinerary layers often remain visible  
3. **Itineraries → Climate**: Itinerary layers may remain visible until style reload
4. **Rapid Switching**: Multiple rapid switches can leave layers in inconsistent states

## Performance Issues

1. **Multiple Timeouts**: Different effects use different timeout values, creating unnecessary delays
2. **Layer Recreation**: Unnecessary layer recreation when layers already exist
3. **Redundant Operations**: Multiple effects may try to set the same layer visibility
4. **No Batching**: Layer visibility changes are not batched, causing multiple redraws

## Error Handling Gaps

1. **Silent Failures**: `safeSetLayerVisibility` may fail silently without proper recovery
2. **Missing Layer Handling**: Effects don't always check if layers exist before operating on them
3. **No Rollback**: If an operation fails, there's no mechanism to rollback to a known good state
4. **Insufficient Logging**: Limited visibility into why operations fail

## Recommendations for Fix

Based on this analysis, the solution should:

1. **Consolidate Effects**: Create a single effect that manages all layer visibility based on color scheme
2. **Add Verification**: Implement verification that visibility changes were applied successfully
3. **Improve Coordination**: Ensure proper sequencing of operations when switching modes
4. **Add Cleanup Logic**: Implement explicit cleanup when switching away from itineraries mode
5. **Remove Timeouts**: Eliminate arbitrary timeouts that create race conditions
6. **Add Error Recovery**: Implement retry logic and error recovery mechanisms

This analysis validates the requirements identified in the specification and provides the foundation for implementing the consolidated layer visibility management solution.