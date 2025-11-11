# Static Export Limitations

## Overview

This application is configured with `output: 'export'` in `next.config.js`, which generates a fully static site. This has some limitations compared to a dynamic Next.js server.

## What Works ✅

- Static pages (all country, border, and border post pages)
- Static data files (JSON, GeoJSON)
- Client-side navigation
- Static assets (images, flags, CSS, JS)
- Pre-rendered content

## What Doesn't Work ❌

### API Routes

API routes in the `/api` directory **do not work** with static export:

- `/api/border-posts` (POST)
- `/api/borders` (GET)
- `/api/countries` (GET)
- `/api/data-freshness` (GET)

These routes are designed for dynamic servers and will return `501 Unsupported method` errors when served by static file servers.

### Why You See 501 Errors

When using a static file server like:
- `python -m http.server`
- `npx serve`
- GitHub Pages
- Any static hosting

These servers only support GET requests for files. They cannot handle:
- POST requests
- Dynamic API routes
- Server-side rendering
- Server-side data fetching

## How the App Handles This

The application is designed to work with static export by:

1. **Pre-generating all data** during build time
2. **Using static JSON/GeoJSON files** instead of API calls
3. **Pre-loading border post data** during static generation
4. **Falling back gracefully** when API calls fail

### Example: Border Post Loading

```typescript
// During static generation, border post data is pre-loaded
if (initialBorderPostData && initialBorderPostData.name) {
  // Use pre-loaded data ✅
  setSelectedFeature({ data: initialBorderPostData })
} else {
  // Try API as fallback (will fail in static export) ❌
  const response = await fetch('/api/border-posts', { method: 'POST' })
  // Gracefully handle failure
}
```

## Expected Errors in Console

When running the static export, you may see these errors (they are expected and handled):

```
POST /api/border-posts HTTP/1.1" 501 - Unsupported method
```

These errors occur when:
- The app tries to use API routes as a fallback
- The static server doesn't support POST requests
- The app gracefully handles the error and continues

## Serving the Static Export

### Development

For development with hot reload:
```bash
npm run dev
```
This runs a full Next.js server with API routes working.

### Production Static Build

For production static export:
```bash
npm run build
npx serve out
```

Access at: `http://localhost:3000/out/`

### Deployment Options

#### GitHub Pages (Static)
- ✅ Works perfectly
- ❌ API routes don't work (expected)
- Uses pre-generated static data

#### Vercel/Netlify (Dynamic)
- ✅ Full Next.js server
- ✅ API routes work
- ✅ Server-side rendering works
- Change `output: 'export'` to enable dynamic features

#### Static Hosting (S3, Cloudflare Pages, etc.)
- ✅ Works with static export
- ❌ API routes don't work (expected)
- Uses pre-generated static data

## Converting to Dynamic Deployment

If you need API routes to work, remove the static export:

1. **Edit `next.config.js`:**
   ```javascript
   const nextConfig = {
     // Remove or comment out:
     // output: 'export',
     
     // Keep other settings
     basePath: basePath,
     assetPrefix: basePath,
     // ...
   }
   ```

2. **Deploy to a Node.js server:**
   - Vercel
   - Netlify
   - Your own Node.js server
   - Docker container

3. **API routes will work:**
   - POST requests supported
   - Dynamic data fetching
   - Server-side rendering

## Best Practices

### For Static Export (Current Setup)

1. ✅ Pre-generate all data during build
2. ✅ Use static JSON/GeoJSON files
3. ✅ Handle API failures gracefully
4. ✅ Test with static file server
5. ✅ Expect 501 errors for API routes (they're handled)

### For Dynamic Deployment

1. ✅ Remove `output: 'export'`
2. ✅ Deploy to Node.js hosting
3. ✅ API routes will work
4. ✅ Can fetch data dynamically
5. ✅ Server-side rendering available

## Troubleshooting

### "501 Unsupported method" errors

**Expected behavior** with static export. The app handles these gracefully.

**Solution:** None needed - this is normal for static export.

### Data not loading

**Check:**
1. Are data files in `/out/data/` directory?
2. Are paths using base path correctly?
3. Is the static server running?

**Solution:** Rebuild with `npm run build`

### API routes needed

**Solution:** Remove `output: 'export'` and deploy to dynamic hosting.

## Summary

| Feature | Static Export | Dynamic Server |
|---------|--------------|----------------|
| Static pages | ✅ | ✅ |
| Static data files | ✅ | ✅ |
| API routes | ❌ | ✅ |
| POST requests | ❌ | ✅ |
| Server-side rendering | ❌ | ✅ |
| GitHub Pages | ✅ | ❌ |
| Vercel/Netlify | ✅ | ✅ |

The current setup (static export) is optimized for GitHub Pages and static hosting. The 501 errors are expected and handled gracefully by the application.
