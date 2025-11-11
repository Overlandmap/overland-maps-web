# Root Path "Page Not Found" Fix

## Issue Description

When accessing the root path `/` with `NEXT_PUBLIC_BASE_PATH="/out"` configured, users encountered a "Page Not Found" error.

## Root Cause

The issue was caused by two problems in the navigation logic:

1. **Home URL Navigation**: When closing the sidebar, the app was pushing `/` to the browser history instead of the configured base path
2. **Popstate Handler**: The browser back/forward handler was checking for `path === '/'` but not accounting for the base path

## Solution

### 1. Added Base Path Constants

Added constants at the top of `WorldMapApp.tsx` to centralize base path handling:

```typescript
// Get the base path from environment
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''
const HOME_PATH = BASE_PATH || '/'
```

### 2. Fixed Sidebar Close Handler

Updated `handleSidebarClose` to use the correct home path:

**Before:**
```typescript
window.history.pushState({ type: 'home' }, '', '/')
```

**After:**
```typescript
window.history.pushState({ type: 'home' }, '', HOME_PATH)
```

### 3. Fixed Popstate Handler

Updated the browser navigation handler to properly detect the home path and strip the base path when parsing URLs:

**Before:**
```typescript
if (path === '/') {
  // Back to home
}

const countryMatch = path.match(/^\/country\/([^\/]+)/)
```

**After:**
```typescript
// Check if we're at the home path (with or without base path)
if (path === HOME_PATH || path === '/' || path === BASE_PATH + '/') {
  // Back to home
}

// Remove base path from the pathname for matching
const pathWithoutBase = BASE_PATH ? path.replace(BASE_PATH, '') : path

const countryMatch = pathWithoutBase.match(/^\/country\/([^\/]+)/)
```

## Understanding the Behavior

### With Base Path (`NEXT_PUBLIC_BASE_PATH="/out"`)

- **Application Root**: `/out/`
- **Country Page**: `/out/country/USA`
- **Border Page**: `/out/border/123`
- **Home Navigation**: Navigates to `/out/`

### Without Base Path (`NEXT_PUBLIC_BASE_PATH=""`)

- **Application Root**: `/`
- **Country Page**: `/country/USA`
- **Border Page**: `/border/123`
- **Home Navigation**: Navigates to `/`

## Important Note

This is **not a bug** but expected Next.js behavior when using `basePath`. When a base path is configured:

- The application is only available under that path
- The root `/` is not part of the application
- Users must access the app at the base path (e.g., `/out/`)

## User Guidance

### For Developers

1. **Local Testing**: Access the app at `http://localhost:3000/out/` when base path is `/out`
2. **Development Mode**: Use `npm run dev` which doesn't require the base path
3. **Production Build**: Remember to access at the correct base path

### For Deployment

1. **GitHub Pages**: Users access at `https://username.github.io/repository-name/`
2. **Subdirectory**: Users access at `https://example.com/subdirectory/`
3. **Root Domain**: Set `NEXT_PUBLIC_BASE_PATH=""` and users access at `https://example.com/`

### Optional Root Redirect

For better UX, you can add a redirect from `/` to `/out/`:

1. Use the provided `redirect-to-out.html` file
2. Place it as `index.html` at your server root (outside the `out` directory)
3. This will automatically redirect users from `/` to `/out/`

## Files Modified

1. **src/components/WorldMapApp.tsx**
   - Added `BASE_PATH` and `HOME_PATH` constants
   - Updated `handleSidebarClose` to use `HOME_PATH`
   - Updated `handlePopState` to properly handle base path

## Files Created

1. **docs/ACCESSING-THE-APP.md** - Comprehensive guide on accessing the application
2. **redirect-to-out.html** - Optional redirect page for root path
3. **CONFIGURATION.md** - Updated with access instructions

## Testing

### Test Case 1: Sidebar Close Navigation
✅ Closing sidebar now navigates to `/out/` instead of `/`

### Test Case 2: Browser Back Button
✅ Browser back button correctly detects home path with base path

### Test Case 3: URL Parsing
✅ URLs are correctly parsed by stripping base path before matching

### Test Case 4: Build
✅ Application builds successfully with no errors

## Verification

```bash
# Build the application
npm run build

# Serve the output
npx serve out

# Access at the correct path
open http://localhost:3000/out/
```

## Conclusion

The navigation logic now correctly handles the base path in all scenarios:
- ✅ Sidebar close navigates to correct home path
- ✅ Browser back/forward buttons work correctly
- ✅ URL parsing accounts for base path
- ✅ All navigation uses the configured base path

The "Page Not Found" at root `/` is expected behavior when using a base path. Users should access the application at the configured base path (e.g., `/out/`).
