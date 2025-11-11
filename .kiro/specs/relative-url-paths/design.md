# Design Document

## Overview

This design implements relative URL generation for country, border, and border_post routes that respects the Next.js basePath configuration. The solution introduces a centralized URL utility function that constructs paths relative to the configured basePath, ensuring the application works correctly when deployed to subdirectories.

## Architecture

### Current State
- URLs are hardcoded as absolute paths in `WorldMapApp.tsx` (e.g., `/country/${iso3}`)
- The application has `basePath: '/out'` configured in `next.config.js`
- URL generation happens in three callback functions: `handleCountryClick`, `handleBorderClick`, and `handleBorderPostClick`
- The History API is used directly with hardcoded paths

### Proposed State
- A utility function will generate URLs that include the basePath
- The utility function will be imported and used in `WorldMapApp.tsx`
- All URL generation will go through this centralized function
- The basePath will be accessed at runtime to support different deployment configurations

## Components and Interfaces

### 1. URL Utility Module (`src/lib/url-utils.ts`)

A new utility module that provides URL generation functions:

```typescript
/**
 * Get the base path from Next.js configuration
 * In production builds, this is available via process.env
 * For client-side, we can detect it from the current path
 */
function getBasePath(): string {
  // In Next.js, the basePath is available in the router
  // For static exports, we need to detect it from the current location
  if (typeof window !== 'undefined') {
    const path = window.location.pathname
    // Check if path starts with /out (our configured basePath)
    if (path.startsWith('/out')) {
      return '/out'
    }
  }
  return ''
}

/**
 * Generate a URL path for a given entity type and ID
 * @param type - The entity type ('country', 'border', 'border_post')
 * @param id - The entity identifier
 * @returns The complete URL path including basePath
 */
export function generateEntityUrl(
  type: 'country' | 'border' | 'border_post',
  id: string
): string {
  const basePath = getBasePath()
  const routePath = `/${type}/${id}`
  return basePath ? `${basePath}${routePath}` : routePath
}
```

### 2. WorldMapApp Component Updates

The component will be updated to use the utility function:

```typescript
import { generateEntityUrl } from '../lib/url-utils'

// In handleCountryClick:
window.history.pushState(
  { type: 'country', id: iso3 },
  '',
  generateEntityUrl('country', iso3)
)

// In handleBorderClick:
window.history.pushState(
  { type: 'border', id: borderId },
  '',
  generateEntityUrl('border', borderId)
)

// In handleBorderPostClick:
window.history.pushState(
  { type: 'border-post', id: borderPostId },
  '',
  generateEntityUrl('border_post', borderPostId)
)
```

## Data Models

No new data models are required. The existing data structures remain unchanged:
- `CountryData`
- `BorderData`
- Border post data structures

## Error Handling

### Fallback Behavior
- If basePath detection fails, the function returns paths without a prefix (current behavior)
- This ensures backward compatibility and graceful degradation

### Edge Cases
1. **Empty or undefined basePath**: Return the route path without prefix
2. **Trailing slashes**: Ensure no double slashes in generated URLs
3. **Invalid entity types**: TypeScript will enforce valid types at compile time
4. **Missing IDs**: The function will still generate a path, but it may result in a 404 (existing behavior)

## Testing Strategy

### Manual Testing
1. **Local Development**: Verify URLs work without basePath
2. **Production Build**: Verify URLs include `/out` prefix
3. **Navigation Testing**: 
   - Click on countries, borders, and border posts
   - Verify URL updates correctly
   - Test browser back/forward buttons
   - Verify deep linking works (direct URL access)

### Test Scenarios
1. Navigate from home to a country page
2. Navigate from country to border
3. Navigate from border to border post
4. Use browser back button through navigation history
5. Refresh page on a deep link
6. Test with and without basePath configuration

## Implementation Notes

### Why Not Use Next.js Router?
- The application uses `output: 'export'` for static site generation
- Static exports don't have access to the Next.js router on the client side
- The History API is already in use for URL manipulation
- This solution maintains consistency with the existing architecture

### Alternative Approaches Considered

1. **Using Next.js `useRouter` hook**: Not available in static exports
2. **Environment variables**: Would require rebuild for different deployments
3. **Runtime configuration file**: Adds complexity and another file to manage
4. **Path detection from window.location**: Selected approach - simple and works with static exports

### Deployment Considerations
- The solution works for both root deployment (no basePath) and subdirectory deployment
- No changes needed to build or deployment scripts
- The basePath in `next.config.js` remains the source of truth
