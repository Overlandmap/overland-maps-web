# Implementation Plan

- [x] 1. Copy root-level configuration files
  - Copy .eslintrc.json, postcss.config.js, firebase.json, and firestore.indexes.json from ../overland-country to current directory
  - Verify each file is valid JSON/JS after copying
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Copy scripts directory with all build and maintenance scripts
  - Create scripts directory if it doesn't exist
  - Copy all TypeScript files from ../overland-country/scripts/ to scripts/
  - Copy all JavaScript files including copy-flags.js
  - Copy shell script (generate_pmtiles.sh) and Python script (validate-geojson.py)
  - Copy scripts/tsconfig.json for TypeScript compilation
  - Copy README-remove-translations.md documentation
  - Set executable permissions on .sh and .py files
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 3. Copy PMTiles data files for map rendering
  - Copy b.pmtiles from ../overland-country to current directory
  - Copy bp.pmtiles from ../overland-country to current directory
  - Copy c.pmtiles from ../overland-country to current directory
  - Copy country-borders.pmtiles from ../overland-country to current directory
  - Verify file sizes match source files (b.pmtiles ~186KB, bp.pmtiles ~20KB, c.pmtiles ~561KB, country-borders.pmtiles ~722KB)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Update package.json with missing dependencies and scripts
- [ ] 4.1 Analyze and merge dependencies
  - Read ../overland-country/package.json to identify dependencies
  - Compare with current package.json
  - Add missing dependencies (firebase-admin, geojson-related packages, etc.)
  - Add missing devDependencies (additional @types packages if needed)
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4.2 Merge script commands
  - Identify missing scripts from source package.json
  - Add scripts for data building (build:data, regenerate:static, etc.)
  - Add scripts for Firebase operations (deploy:rules, test:firebase, etc.)
  - Preserve existing scripts in target package.json
  - _Requirements: 4.4_

- [ ] 5. Copy missing API routes
- [ ] 5.1 Copy regenerate-static-data API route
  - Create src/app/api/regenerate-static-data directory
  - Copy route.ts from ../overland-country/src/app/api/regenerate-static-data/
  - _Requirements: 5.1_

- [ ] 5.2 Copy update-border API route
  - Create src/app/api/update-border directory
  - Copy route.ts from ../overland-country/src/app/api/update-border/
  - _Requirements: 5.2_

- [ ] 5.3 Copy update-country API route
  - Create src/app/api/update-country directory
  - Copy route.ts from ../overland-country/src/app/api/update-country/
  - _Requirements: 5.3_

- [ ] 6. Check for firestore.rules file and copy if exists
  - Check if ../overland-country/firestore.rules exists
  - If it exists, copy to current directory
  - This file is referenced by firebase.json
  - _Requirements: 1.3_

- [ ]* 7. Verify restoration completeness
  - Run npm install to install new dependencies
  - Verify all configuration files are valid
  - Verify scripts directory contains all expected files
  - Verify PMTiles files are accessible
  - Run npm run lint to test ESLint configuration
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.3, 4.4, 5.1, 5.2, 5.3_
