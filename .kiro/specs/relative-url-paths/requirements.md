# Requirements Document

## Introduction

This feature addresses the issue where country, border, and border_post URLs are hardcoded as absolute paths (e.g., `/country/USA`) instead of being relative to the application's basePath. The application is configured with `basePath: '/out'` in next.config.js, but the URL generation in WorldMapApp.tsx does not respect this configuration, causing navigation issues when the app is deployed to a subdirectory.

## Glossary

- **Application**: The Next.js-based world map application
- **basePath**: The Next.js configuration property that defines the subdirectory path where the application is deployed
- **URL Generator**: The code responsible for creating navigation URLs in the Application
- **WorldMapApp Component**: The React component that handles map interactions and URL updates
- **History API**: The browser's window.history API used for URL manipulation

## Requirements

### Requirement 1

**User Story:** As a developer, I want the application to generate relative URLs that respect the configured basePath, so that the application works correctly when deployed to a subdirectory.

#### Acceptance Criteria

1. WHEN THE Application generates a country URL, THE URL Generator SHALL construct the path relative to the configured basePath
2. WHEN THE Application generates a border URL, THE URL Generator SHALL construct the path relative to the configured basePath
3. WHEN THE Application generates a border_post URL, THE URL Generator SHALL construct the path relative to the configured basePath
4. THE URL Generator SHALL retrieve the basePath value from the Next.js configuration at runtime
5. WHERE the basePath is '/out', WHEN THE Application generates a country URL for 'USA', THE URL Generator SHALL produce '/out/country/USA' instead of '/country/USA'

### Requirement 2

**User Story:** As a user, I want navigation between countries, borders, and border posts to work seamlessly, so that I can explore the map without encountering broken links.

#### Acceptance Criteria

1. WHEN a user clicks on a country, THE Application SHALL update the browser URL to include the basePath prefix
2. WHEN a user clicks on a border, THE Application SHALL update the browser URL to include the basePath prefix
3. WHEN a user clicks on a border post, THE Application SHALL update the browser URL to include the basePath prefix
4. WHEN a user uses browser back/forward buttons, THE Application SHALL correctly parse URLs that include the basePath
5. THE Application SHALL maintain all existing navigation functionality after implementing relative URLs

### Requirement 3

**User Story:** As a developer, I want a centralized utility function for URL generation, so that URL construction logic is consistent and maintainable across the application.

#### Acceptance Criteria

1. THE Application SHALL provide a utility function that accepts an entity type and identifier as parameters
2. THE utility function SHALL return a complete URL path including the basePath
3. THE WorldMapApp Component SHALL use the utility function for all URL generation operations
4. THE utility function SHALL handle cases where basePath is undefined or empty
5. THE utility function SHALL be reusable for any future URL generation needs in the Application
