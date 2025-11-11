# Requirements Document

## Introduction

This feature restores missing resources, configuration files, and scripts from the original overland-country project that were not copied when the project was moved to the overlanding-maps directory. The goal is to ensure the new project has all necessary files for building, deploying, and maintaining the application.

## Glossary

- **Application**: The overlanding-maps Next.js web application
- **Source Project**: The original ../overland-country directory containing the complete project
- **Target Project**: The current overlanding-maps directory that needs missing files restored
- **Build Scripts**: TypeScript and JavaScript files in the scripts directory used for data processing and deployment
- **Configuration Files**: Files like .eslintrc.json, postcss.config.js, firebase.json, and firestore.indexes.json
- **PMTiles Files**: Pre-generated map tile files (*.pmtiles) used for map rendering

## Requirements

### Requirement 1

**User Story:** As a developer, I want all essential configuration files restored, so that I can properly build and lint the application

#### Acceptance Criteria

1. WHEN the Application is built, THE Application SHALL use the .eslintrc.json configuration file from the Source Project
2. WHEN the Application processes CSS, THE Application SHALL use the postcss.config.js configuration file from the Source Project
3. WHEN Firebase deployment is initiated, THE Application SHALL use the firebase.json and firestore.indexes.json configuration files from the Source Project

### Requirement 2

**User Story:** As a developer, I want the scripts directory restored with all build and maintenance scripts, so that I can process data and manage the application

#### Acceptance Criteria

1. THE Target Project SHALL contain a scripts directory with all TypeScript and JavaScript files from the Source Project scripts directory
2. THE scripts directory SHALL include the build-data.ts script for data processing
3. THE scripts directory SHALL include the copy-flags.js script for flag asset management
4. THE scripts directory SHALL include all Firebase-related scripts (deploy-firestore-rules.ts, test-firebase-connection.ts, etc.)
5. THE scripts directory SHALL include the regenerate-static-files.ts script for static file generation
6. THE scripts directory SHALL include the tsconfig.json configuration for script compilation

### Requirement 3

**User Story:** As a developer, I want the PMTiles files restored, so that the map can render properly with pre-generated tiles

#### Acceptance Criteria

1. THE Target Project SHALL contain all *.pmtiles files from the Source Project root directory
2. THE Application SHALL be able to access b.pmtiles for border data
3. THE Application SHALL be able to access bp.pmtiles for border post data
4. THE Application SHALL be able to access c.pmtiles for country data
5. THE Application SHALL be able to access country-borders.pmtiles for country border visualization

### Requirement 4

**User Story:** As a developer, I want the package.json updated with missing dependencies and scripts, so that I can run all necessary build and maintenance commands

#### Acceptance Criteria

1. WHEN comparing package.json files, THE Application SHALL identify missing dependencies from the Source Project
2. WHEN comparing package.json files, THE Application SHALL identify missing scripts from the Source Project
3. THE Target Project package.json SHALL include all necessary dependencies for running build scripts
4. THE Target Project package.json SHALL include script commands for data building and Firebase operations

### Requirement 5

**User Story:** As a developer, I want missing API routes restored, so that the application has full backend functionality

#### Acceptance Criteria

1. THE Target Project SHALL contain the regenerate-static-data API route from the Source Project
2. THE Target Project SHALL contain the update-border API route from the Source Project
3. THE Target Project SHALL contain the update-country API route from the Source Project
4. WHERE API routes differ between projects, THE Application SHALL preserve the Target Project version while documenting differences
