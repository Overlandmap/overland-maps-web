# Code Cleanup Summary

## Dead Code Removed

### Files Deleted
1. **src/components/MapContainer.tsx** - Unused map component
2. **src/lib/mapManager.ts** - Singleton manager only used by deleted MapContainer

## Why These Were Dead Code

### MapContainer.tsx
- Used MapManager singleton pattern with GeoJSON data sources
- Was NOT imported or used anywhere in the application
- The app uses **SimpleMapContainer.tsx** instead

### mapManager.ts
- Only dependency was MapContainer.tsx
- Implemented singleton pattern to prevent WebGL context leaks
- No longer needed since MapContainer was removed

## Active Component

**SimpleMapContainer.tsx** is the active map component used in the application:
- Located at: `src/components/SimpleMapContainer.tsx`
- Used by: `src/components/WorldMapApp.tsx`
- Features:
  - PMTiles support for vector tiles
  - Color scheme switching (overlanding/carnet)
  - Border posts toggle
  - Protomaps base layer (updated)
  - Country, border, and border post interactions

## Changes Made

1. ✅ Deleted MapContainer.tsx (unused)
2. ✅ Deleted mapManager.ts (unused)
3. ✅ Updated SimpleMapContainer.tsx to use Protomaps base layer
   - Changed from: OpenStreetMap raster tiles
   - Changed to: Protomaps PMTiles vector tiles (`pmtiles://https://example.com/example.pmtiles`)

## Build Status

✅ Build successful with no errors
⚠️ Only pre-existing linting warnings remain (unrelated to cleanup)
