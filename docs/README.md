# Overlanding Maps

A simplified, read-only version of the overlanding country and border information system. This application displays interactive maps with overlanding difficulty ratings and border status information using PMTiles for efficient map data delivery.

## Features

- **Interactive Map**: Powered by MapLibre GL JS with PMTiles for fast loading
- **Country Information**: View overlanding difficulty, visa requirements, and travel information
- **Border Status**: See border crossing status and restrictions
- **Border Posts**: Locate and get information about specific border crossings
- **Multi-language Support**: Available in multiple languages
- **Read-only Interface**: Clean, focused viewing experience without editing capabilities

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Mapping**: MapLibre GL JS with GeoJSON
- **Styling**: Tailwind CSS
- **Data**: Firebase Firestore (read-only)
- **Map Data**: GeoJSON files (countries-merged.geojson, borders.geojson)

## Map Data Sources

The application uses GeoJSON files for map data:

- **Countries Layer**: `/data/countries-merged.geojson` (includes overlanding data)
- **Borders Layer**: `/data/borders.geojson` (includes border status data)
- **Base Map**: OpenStreetMap raster tiles

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd overlanding-maps
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Add your Firebase configuration to `.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_key
   NEXT_PUBLIC_FIREBASE_CONFIG=your_firebase_config
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
overlanding-maps/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   │   ├── MapContainer.tsx # Main map component with PMTiles
│   │   ├── DetailSidebar.tsx# Information sidebar (read-only)
│   │   └── WorldMapApp.tsx  # Main application component
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
└── package.json
```

## Key Differences from Original

This simplified version:

1. **Removes All Editing**: No ability to modify country or border data
2. **Uses PMTiles**: Replaces local GeoJSON files with efficient PMTiles
3. **Simplified UI**: Cleaner interface focused on viewing information
4. **Reduced Dependencies**: Removes admin-related packages and scripts
5. **Read-only Firebase**: Only reads data, no write operations

## Map Layers

The PMTiles file contains two main layers:

### Countries GeoJSON
- **File**: `/data/countries-merged.geojson`
- **Properties**: 
  - `overlanding`: Difficulty rating (1=Easy, 2=Moderate, 3=Difficult)
  - `iso_a2`: Two-letter country code
  - `driving`: Driving side (l=left, r=right)
  - Other country metadata from Natural Earth

### Borders GeoJSON  
- **File**: `/data/borders.geojson`
- **Properties**:
  - `is_open`: Border status (0=Closed, 1=Open, 2=Restricted)
  - `id`: Unique border identifier
  - Other border metadata

## Color Coding

- **Countries** (by overlanding difficulty):
  - 🟢 Green: Easy (1)
  - 🟡 Orange: Moderate (2) 
  - 🔴 Red: Difficult (3)
  - ⚪ Gray: No data

- **Borders** (by status):
  - 🟢 Green: Open (1)
  - 🟡 Orange: Restricted (2)
  - 🔴 Red: Closed (0)
  - ⚪ Gray: Unknown

## Contributing

This is a read-only application focused on displaying overlanding information. For data updates or corrections, please refer to the main overlanding database project.

## License

[Your License Here]