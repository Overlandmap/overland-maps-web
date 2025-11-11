# Design Document

## Overview

This design outlines the systematic restoration of missing files from the original overland-country project to the overlanding-maps project. The restoration will be organized into five main categories: configuration files, build scripts, PMTiles data files, package.json updates, and API routes. The approach prioritizes copying files directly from the source project while preserving any customizations already made in the target project.

## Architecture

### File Restoration Strategy

The restoration follows a copy-based approach where files are copied from `../overland-country` to the current project directory. The process is organized into distinct phases:

1. **Configuration Phase**: Copy root-level configuration files
2. **Scripts Phase**: Copy the entire scripts directory with all utilities
3. **Data Phase**: Copy PMTiles files for map rendering
4. **Dependencies Phase**: Update package.json with missing dependencies and scripts
5. **API Routes Phase**: Copy missing API route implementations

### Directory Structure

```
overlanding-maps/
├── .eslintrc.json (restored)
├── postcss.config.js (restored)
├── firebase.json (restored)
├── firestore.indexes.json (restored)
├── *.pmtiles (restored - 4 files)
├── scripts/ (restored directory)
│   ├── build-data.ts
│   ├── copy-flags.js
│   ├── deploy-firestore-rules.ts
│   ├── fix-border-posts-keys.ts
│   ├── merge-countries-geojson.ts
│   ├── normalize-carnet-field.ts
│   ├── regenerate-static-files.ts
│   ├── remove-capital-translations-field.ts
│   ├── remove-translations-field.ts
│   ├── copy-translations-between-collections.ts
│   ├── test-data-fetcher.ts
│   ├── test-firebase-connection.ts
│   ├── test-translations.ts
│   ├── verify-build.ts
│   ├── generate_pmtiles.sh
│   ├── validate-geojson.py
│   ├── tsconfig.json
│   └── README-remove-translations.md
├── src/app/api/
│   ├── regenerate-static-data/ (restored)
│   ├── update-border/ (restored)
│   └── update-country/ (restored)
└── package.json (updated)
```

## Components and Interfaces

### Configuration Files

**Files to Restore:**
- `.eslintrc.json`: ESLint configuration for Next.js
- `postcss.config.js`: PostCSS configuration for Tailwind CSS processing
- `firebase.json`: Firebase project configuration
- `firestore.indexes.json`: Firestore database index definitions

**Implementation:**
- Direct file copy from source to target
- No modifications needed as these are standard configuration files

### Build Scripts Directory

**Purpose:** Contains utility scripts for data processing, Firebase operations, and build verification

**Key Scripts:**
- `build-data.ts`: Main data processing script that generates static JSON files
- `regenerate-static-files.ts`: Regenerates static data files from Firestore
- `copy-flags.js`: Copies flag SVG files to the public directory
- `merge-countries-geojson.ts`: Merges country GeoJSON data
- `deploy-firestore-rules.ts`: Deploys Firestore security rules
- `test-firebase-connection.ts`: Tests Firebase connectivity
- `verify-build.ts`: Verifies build output integrity
- `generate_pmtiles.sh`: Shell script for generating PMTiles files
- `validate-geojson.py`: Python script for GeoJSON validation

**Dependencies:**
- Scripts require `ts-node` for TypeScript execution
- Firebase Admin SDK for Firestore operations
- Node.js file system APIs

**Implementation:**
- Copy entire scripts directory recursively
- Preserve file permissions (especially for .sh and .py files)
- Include scripts/tsconfig.json for TypeScript compilation settings

### PMTiles Data Files

**Files to Restore:**
- `b.pmtiles` (186KB): Border data tiles
- `bp.pmtiles` (20KB): Border post data tiles
- `c.pmtiles` (561KB): Country data tiles
- `country-borders.pmtiles` (722KB): Country border visualization tiles

**Purpose:** Pre-generated map tile files used by MapLibre GL for efficient map rendering

**Implementation:**
- Copy binary files from source root to target root
- Verify file sizes match source files
- These files are referenced by the map rendering components

### Package.json Updates

**Analysis Required:**
Compare source and target package.json to identify:
- Missing dependencies (especially firebase-admin, geojson-related packages)
- Missing devDependencies (ts-node, @types packages)
- Missing scripts (build:data, deploy:rules, test:firebase, etc.)

**Implementation Strategy:**
- Read both package.json files
- Identify missing entries
- Add missing dependencies while preserving existing ones
- Add missing scripts while preserving existing ones
- Maintain version compatibility

### API Routes

**Routes to Restore:**

1. **regenerate-static-data**: API endpoint to trigger static file regeneration
   - Location: `src/app/api/regenerate-static-data/route.ts`
   - Purpose: Allows manual triggering of static data regeneration from Firestore

2. **update-border**: API endpoint for updating border information
   - Location: `src/app/api/update-border/route.ts`
   - Purpose: Handles border data updates

3. **update-country**: API endpoint for updating country information
   - Location: `src/app/api/update-country/route.ts`
   - Purpose: Handles country data updates

**Implementation:**
- Copy route.ts files from source to target
- Preserve Next.js 14 App Router structure
- Ensure proper TypeScript types are maintained

## Data Models

### File Copy Operations

```typescript
interface FileCopyOperation {
  sourcePath: string;      // Path in ../overland-country
  targetPath: string;      // Path in current directory
  type: 'file' | 'directory';
  preservePermissions: boolean;
}
```

### Package.json Merge

```typescript
interface PackageJsonMerge {
  existingDependencies: Record<string, string>;
  newDependencies: Record<string, string>;
  existingScripts: Record<string, string>;
  newScripts: Record<string, string>;
}
```

## Error Handling

### File Copy Errors

- **Missing Source File**: Log warning and continue with other files
- **Permission Denied**: Report error and suggest manual copy
- **Disk Space**: Check available space before copying large PMTiles files

### Package.json Merge Conflicts

- **Version Conflicts**: Prefer source project versions (more recent)
- **Script Name Conflicts**: Preserve target project scripts, add source scripts with suffix if needed

### Validation

- Verify file sizes match after copying PMTiles files
- Verify JSON files are valid after copying
- Check that scripts directory contains expected files

## Testing Strategy

### Verification Steps

1. **Configuration Files**: Verify each config file exists and is valid JSON/JS
2. **Scripts Directory**: Verify all expected scripts are present
3. **PMTiles Files**: Verify file sizes match source files
4. **Package.json**: Verify valid JSON and all dependencies are resolvable
5. **API Routes**: Verify route files exist and have proper structure

### Manual Testing

After restoration, the developer should:
1. Run `npm install` to install any new dependencies
2. Run `npm run lint` to verify ESLint configuration
3. Run `npm run build` to verify build process
4. Test that scripts can be executed with `ts-node`
5. Verify map renders correctly with PMTiles files

## Implementation Notes

### File Permissions

The `generate_pmtiles.sh` and `validate-geojson.py` scripts need executable permissions. Use `chmod +x` after copying.

### Binary Files

PMTiles files are binary and should be copied using binary-safe methods (not text processing).

### Firestore Rules

The `firebase.json` references `firestore.rules` which may also need to be copied if it exists in the source project.

### Git Considerations

Some files may be in `.gitignore` (like PMTiles files). Consider whether these should be committed or regenerated.
