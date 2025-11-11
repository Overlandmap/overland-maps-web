# Implementation Plan

- [x] 1. Create URL utility module
  - Create `src/lib/url-utils.ts` file with `getBasePath()` and `generateEntityUrl()` functions
  - Implement basePath detection logic that checks window.location.pathname for '/out' prefix
  - Handle edge cases: empty basePath, undefined values, and ensure no double slashes
  - Export the `generateEntityUrl` function for use in components
  - _Requirements: 1.4, 3.1, 3.2, 3.4_

- [x] 2. Update WorldMapApp component to use URL utility
  - Import `generateEntityUrl` from `src/lib/url-utils`
  - Replace hardcoded `/country/${iso3}` with `generateEntityUrl('country', iso3)` in `handleCountryClick`
  - Replace hardcoded `/border/${borderId}` with `generateEntityUrl('border', borderId)` in `handleBorderClick`
  - Replace hardcoded `/border_post/${borderPostId}` with `generateEntityUrl('border_post', borderPostId)` in `handleBorderPostClick`
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.3_

- [x] 3. Verify navigation functionality
  - Build the application with `npm run build`
  - Test country navigation by clicking on different countries
  - Test border navigation by clicking on borders
  - Test border post navigation by clicking on border posts
  - Verify browser back/forward buttons work correctly with the new URLs
  - Verify URLs include the `/out` prefix in the production build
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 1.5_
