# Border Posts Display Fix

## Problem
Border posts were not showing in the border detail sidebar because the `border-posts.geojson` file was empty, and the `loadBorderPostGeoJSON` function was trying to load from this empty file.

## Root Cause
The border posts data exists in:
1. Firestore database
2. PMTiles file (for map display)

But NOT in the static GeoJSON file that the DetailSidebar was trying to load.

## Solution

### 1. Created API Endpoint for Border Posts
**File:** `src/app/api/border-posts/route.ts`

New POST endpoint that fetches border posts from Firestore by IDs:
- Accepts an array of border post IDs
- Fetches in batches of 10 (Firestore 'in' query limit)
- Returns border post data with all fields

```typescript
POST /api/border-posts
Body: { ids: string[] }
Response: { borderPosts: any[], count: number }
```

### 2. Added Helper Function in Data Loader
**File:** `src/lib/data-loader.ts`

New `getBorderPostsByIds` function that:
- Calls the new API endpoint
- Handles errors gracefully
- Returns empty array if no IDs provided

```typescript
export async function getBorderPostsByIds(
  borderPostIds: string[]
): Promise<any[]>
```

### 3. Updated DetailSidebar Component
**File:** `src/components/DetailSidebar.tsx`

Modified the border post loading logic to:
- Fetch from Firestore via the new API instead of GeoJSON file
- Extract coordinates from Firestore location field (`_longitude`, `_latitude`)
- Handle the Firestore data structure properly

**Before:**
```typescript
const borderPostGeoJSON = await loadBorderPostGeoJSON(false)
const matchingBorderPosts = borderPostGeoJSON.features
  .filter(feature => borderPostIds.includes(feature.properties?.id))
  .map(feature => ({ ... }))
```

**After:**
```typescript
const { getBorderPostsByIds } = await import('../lib/data-loader')
const borderPostsData = await getBorderPostsByIds(borderPostIds)

const matchingBorderPosts = borderPostsData.map((borderPost: any) => ({
  id: borderPost.id,
  name: borderPost.name || 'Unnamed Border Post',
  is_open: borderPost.is_open ?? -1,
  comment: borderPost.comment,
  geometry: borderPost.geometry,
  coordinates: borderPost.location?._longitude && borderPost.location?._latitude 
    ? [borderPost.location._longitude, borderPost.location._latitude]
    : null
}))
```

## Benefits

✅ Border posts now display correctly in border detail sidebar
✅ Data fetched directly from Firestore (source of truth)
✅ No need to maintain separate GeoJSON file
✅ Consistent with how other data is fetched
✅ Handles batching for large numbers of border posts
✅ Graceful error handling

## Testing

To test:
1. Navigate to a border page (e.g., `/border/-KwAYrhsWfdweTR_nk-v`)
2. Check the "Border Posts" section in the detail sidebar
3. Border posts should be listed with:
   - Name
   - Status (Open/Closed/Restricted/etc.)
   - Comment (if available)
   - "Zoom to location" button

## Files Modified

1. `src/app/api/border-posts/route.ts` - NEW: API endpoint for fetching border posts
2. `src/lib/data-loader.ts` - Added `getBorderPostsByIds` function
3. `src/components/DetailSidebar.tsx` - Updated border post loading logic

## Notes

- The empty `border-posts.geojson` file can remain as is (used as fallback)
- Border posts are still rendered on the map from PMTiles
- This fix only affects the detail sidebar display
- API endpoint uses Firestore batching to handle the 10-item 'in' query limit
