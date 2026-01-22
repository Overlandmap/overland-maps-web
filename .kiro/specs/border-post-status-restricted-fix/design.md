# Border Post Status Label Fix Design

## Overview

This design addresses the incorrect labeling of border posts with `is_open=3` status. Currently, these border posts are labeled as "Restrictions apply" in the legend but the actual status function doesn't handle case 3, causing them to fall through to the default "Unknown" label. The fix involves updating the status mapping function and ensuring consistency across all UI components.

## Architecture

The border post status system consists of several interconnected components:

1. **Status Mapping Function** (`getBorderPostStatus` in DetailSidebar.tsx)
2. **Map Visualization** (border_post layer in SimpleMapContainer.tsx)  
3. **Legend Display** (border post legend in SimpleMapContainer.tsx)
4. **Translation System** (i18n.ts for multilingual support)

## Components and Interfaces

### Status Mapping Function

**Location:** `src/components/DetailSidebar.tsx`

**Current Implementation:**
```typescript
const getBorderPostStatus = (isOpen: number) => {
  switch (isOpen) {
    case 0: return { label: getTranslatedLabel('closed', language), color: 'bg-red-100 text-red-800' }
    case 1: return { label: getTranslatedLabel('bilateral', language), color: 'bg-orange-100 text-orange-800' }
    case 2: return { label: getTranslatedLabel('open', language), color: 'bg-green-100 text-green-800' }
    default: return { label: getTranslatedLabel('unknown', language), color: 'bg-gray-100 text-gray-800' }
  }
}
```

**Required Changes:**
- Add case 3 to return "Restricted" label with appropriate color
- Update color scheme to match map visualization

### Map Visualization

**Location:** `src/components/SimpleMapContainer.tsx`

**Current Implementation:**
```typescript
'circle-color': [
  'case',
  ['==', ['get', 'is_open'], 1], '#3b82f6',  // Bilateral - blue
  ['==', ['get', 'is_open'], 2], '#22c55e',  // Open - green  
  ['==', ['get', 'is_open'], 3], '#eab308',  // Currently yellow
  '#ef4444'  // Closed (0) or default - red
]
```

**Analysis:** The map already correctly colors `is_open=3` as yellow (#eab308), but the status function doesn't recognize this case.

### Legend Display

**Location:** `src/components/SimpleMapContainer.tsx`

**Current Implementation:**
```typescript
<div className="flex items-center space-x-2">
  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
  <span className="text-gray-700">{getTranslatedLabel('restrictions_apply', language)}</span>
</div>
```

**Analysis:** The legend correctly shows yellow color with "restrictions_apply" label, but this should be "restricted" for consistency.

## Data Models

### Border Post Status Values

```typescript
interface BorderPostStatus {
  0: 'Closed'      // Red (#ef4444)
  1: 'Bilateral'   // Blue (#3b82f6) 
  2: 'Open'        // Green (#22c55e)
  3: 'Restricted'  // Yellow (#eab308)
}
```

### Status Function Return Type

```typescript
interface StatusResult {
  label: string    // Translated label
  color: string    // Tailwind CSS classes for styling
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Status Mapping Consistency
*For any* border post with `is_open=3`, the `getBorderPostStatus` function should return a result with label "Restricted" (translated) and appropriate color classes
**Validates: Requirements 1.1, 1.2, 3.1**

### Property 2: Color Consistency  
*For any* border post with `is_open=3`, the map visualization color should match the color scheme used in the status function and legend
**Validates: Requirements 3.2, 3.3**

### Property 3: Translation Completeness
*For any* supported language, the "restricted" translation key should exist and return a non-empty translated string
**Validates: Requirements 2.1-2.9**

### Property 4: UI Component Consistency
*For any* border post with `is_open=3` displayed in border detail lists or individual views, the status swatch should use consistent colors and labels
**Validates: Requirements 3.4, 3.5**

## Error Handling

### Missing Translation Keys
- If "restricted" translation key is missing for a language, fall back to English
- Log warning for missing translations during development

### Invalid Status Values
- Continue to handle unknown status values with default "Unknown" label
- Maintain backward compatibility for any unexpected status values

### Color Consistency Issues
- Ensure all color references use the same hex values
- Use CSS custom properties if needed for maintainability

## Testing Strategy

### Unit Testing
- Test `getBorderPostStatus` function with all status values (0, 1, 2, 3, invalid)
- Test translation key existence for all supported languages
- Test color class generation for consistent styling

### Property-Based Testing
- **Property 1 Test**: Generate random border post data with `is_open=3` and verify status function returns "Restricted" label
- **Property 2 Test**: Verify map layer color expression matches status function color scheme
- **Property 3 Test**: For each supported language, verify "restricted" translation exists and is non-empty
- **Property 4 Test**: Generate random border post lists and verify consistent status display

### Integration Testing
- Test border detail view displays correct status swatches
- Test border post detail view shows correct status
- Test legend displays correct label and color
- Test language switching updates all status labels correctly

## Implementation Plan

### Phase 1: Core Status Function Update
1. Add case 3 to `getBorderPostStatus` function
2. Add "restricted" translation key to all languages in i18n.ts
3. Update function documentation

### Phase 2: UI Consistency
1. Update legend to use "restricted" instead of "restrictions_apply"  
2. Verify color consistency across all components
3. Update any hardcoded references

### Phase 3: Testing and Validation
1. Add unit tests for updated status function
2. Add property-based tests for consistency
3. Manual testing across all supported languages
4. Visual regression testing for UI components