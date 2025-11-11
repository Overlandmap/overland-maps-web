# Border Posts Empty List Fix

## Issue Description

When viewing a border's detail pane in the static export, the border posts list was empty even though the border had associated border posts.

## Root Cause

The `DetailSidebar` component was using `getBorderPostsByIds()` which relies on the `/api/border-posts` API route. This API route doesn't work with static export (`output: 'export'`), causing the border posts to fail to load.

**Previous code:**
```typescript
// Fetch border posts from Firestore
const { getBorderPostsByIds } = await import('../lib/data-loader')
const borderPostsData = await getBorderPostsByIds(borderPostIds)
```

This would:
1. Try to POST to `/api/border-posts`
2. Get a 501 error (unsupported method)
3. Return empty array
4. Show no border posts in the UI

## Solution

Updated `DetailSidebar.tsx` to load border posts from the static GeoJSON file instead of using the API route.

**New code:**
```typescript
// Load border posts from static GeoJSON file (works with static export)
const borderPostGeoJSON = await loadBorderPostGeoJSON(false)

// Filter to only the border posts for this border
const matchingFeatures = borderPostGeoJSON.features.filter((feature: any) => 
  borderPostIds.includes(feature.properties?.id)
)

const matchingBorderPosts = matchingFeatures.map((feature: any) => ({
  id: feature.properties.id,
  name: feature.properties.name || 'Unnamed Border Post',
  is_open: feature.properties.is_open ?? -1,
  comment: feature.properties.comment,
  countries: feature.properties.countries,
  geometry: feature.geometry,
  coordinates: feature.geometry?.type === 'Point' ? feature.geometry.coordinates : null
}))
```

## How It Works

1. **Load GeoJSON**: Loads the complete border posts GeoJSON file from `/out/data/border-posts.geojson`
2. **Filter by IDs**: Filters the features to only include border posts associated with the current border
3. **Map to format**: Transforms GeoJSON features into the expected border post data structure
4. **Display**: Shows the border posts in the detail pane

## Benefits

### Works with Static Export ✅
- No API calls required
- All data loaded from static files
- Compatible with GitHub Pages and static hosting

### Better Performance ✅
- GeoJSON file is cached by the browser
- No server round-trip needed
- Faster loading for subsequent borders

### Consistent Data ✅
- Uses the same data source as the map
- No synchronization issues between API and static files
- Guaranteed to have all border posts that were generated at build time

## Files Modified

**src/components/DetailSidebar.tsx**
- Changed from `getBorderPostsByIds()` (API call) to `loadBorderPostGeoJSON()` (static file)
- Updated data mapping to work with GeoJSON feature format
- Added better logging for debugging

## Data Flow

### Before (Broken in Static Export)
```
Border Selected
  ↓
Get border_posts field (IDs)
  ↓
Call getBorderPostsByIds(ids)
  ↓
POST /api/border-posts ❌ (501 error)
  ↓
Return empty array
  ↓
Show "No border posts"
```

### After (Works in Static Export)
```
Border Selected
  ↓
Get border_posts field (IDs)
  ↓
Load border-posts.geojson ✅
  ↓
Filter features by IDs
  ↓
Map to border post format
  ↓
Show border posts list ✅
```

## Testing

### Build Verification
✅ Application builds successfully
✅ No TypeScript errors
✅ All 710 static pages generated

### Expected Behavior

When clicking on a border:
1. Border detail pane opens
2. Border posts section shows loading state
3. Border posts load from GeoJSON file
4. Border posts list displays with:
   - Border post name
   - Status (Open/Closed/Restricted)
   - Comment (if available)
   - Zoom button to view on map

### Console Output

```
🔄 Loading 3 border posts for border
✅ Loaded 3 border posts from GeoJSON
```

## Related Changes

This fix is part of a series of changes to make the application work properly with static export:

1. **Data Path Fix** - Updated data file paths to use base path
2. **Root Path Fix** - Fixed home navigation with base path
3. **Border Posts Fix** - This fix - load border posts from static files

## Impact

- ✅ Border posts now display correctly in static export
- ✅ No more 501 errors for border post loading
- ✅ Works with GitHub Pages and static hosting
- ✅ Better performance (cached GeoJSON)
- ✅ Consistent with map data

## Verification Steps

To verify the fix works:

```bash
# Build the application
npm run build

# Serve the static export
npx serve out

# Open in browser
open http://localhost:3000/out/

# Test:
1. Click on a border between two countries
2. Border detail pane should open
3. Scroll down to "Border Posts" section
4. Should see list of border posts (if any exist for that border)
5. Each border post should show name, status, and zoom button
```

## Conclusion

Border posts now load correctly from static GeoJSON files, making the application fully functional with static export. No API routes are needed for border post data.
