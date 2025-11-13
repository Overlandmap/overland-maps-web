# Overlanding Maps

A simplified, read-only version of the overlanding country and border information system. This application displays interactive maps with overlanding difficulty ratings and border status information.

## Development Environment Setup

### Prerequisites

Before you begin, ensure you have the following installed on your system:

#### Node.js and npm
This project requires Node.js 18 or higher.

**Check if you have Node.js installed:**
```bash
node --version
npm --version
```

**Install Node.js:**
- **macOS**: 
  ```bash
  # Using Homebrew
  brew install node
  
  # Or download from https://nodejs.org/
  ```
- **Linux**:
  ```bash
  # Using nvm (recommended)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 18
  nvm use 18
  ```
- **Windows**: Download from [nodejs.org](https://nodejs.org/)

#### Git
```bash
# macOS
brew install git

# Linux
sudo apt-get install git  # Debian/Ubuntu
sudo yum install git      # CentOS/RHEL
```

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd overlanding-maps
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   This will install all required packages including:
   - Next.js 14 (React framework)
   - React 18
   - TypeScript
   - MapLibre GL JS (mapping library)
   - Tailwind CSS (styling)
   - Firebase SDK
   - And other dependencies listed in `package.json`

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Firebase configuration:
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
   NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"your-api-key","authDomain":"your-project.firebaseapp.com",...}
   BUILD_TIME=2024-01-01T00:00:00.000Z
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The application will start at [http://localhost:3000](http://localhost:3000)

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run build:data` - Build data files from Firebase
- `npm run build:data:skip-validation` - Build data without validation
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Project Structure

```
overlanding-maps/
├── src/
│   ├── app/                 # Next.js app directory (App Router)
│   ├── components/          # React components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
│   ├── data/                # GeoJSON data files
│   └── flags/               # Country flag images
├── scripts/                 # Build and utility scripts
├── docs/                    # Documentation
├── .env.example             # Environment variables template
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

### Technology Stack

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Mapping**: MapLibre GL JS 4
- **Base Map**: Custom style from `public/styles/basemap.json`
- **Database**: Firebase Firestore (read-only)
- **Map Format**: PMTiles, GeoJSON
- **Build Tools**: PostCSS, Autoprefixer

### Map Configuration

The map uses custom MapLibre styles with multi-language support:

**Base Map Styles:**
- `public/styles/basemap.json` - English (default, uses `{name}`)
- `public/styles/basemap-fr.json` - French (uses `{name_fr}`)
- `public/styles/basemap-de.json` - German (uses `{name_de}`)
- `public/styles/basemap-es.json` - Spanish (uses `{name_es}`)
- `public/styles/basemap-pt.json` - Portuguese (uses `{name_pt}`)
- `public/styles/basemap-it.json` - Italian (uses `{name_it}`)
- `public/styles/basemap-nl.json` - Dutch (uses `{name_nl}`)
- `public/styles/basemap-ru.json` - Russian (uses `{name_ru}`)

The map automatically reloads with the appropriate language style when the user changes the language. For languages without a specific translation file (e.g., Chinese), the default `basemap.json` is used as a fallback. Each style file includes:
- Base map layers from PMTiles vector tiles
- Custom styling for roads, water, landuse, etc.
- Sprite and glyph configurations
- Language-specific name fields

The country borders, overlanding data, and border posts are loaded from a separate PMTiles source (`country-borders.pmtiles`) and layered on top of the base map.

**To add a new language:**
```bash
cat public/styles/basemap.json | sed 's/{name}/{name_LANG}/g' > public/styles/basemap-LANG.json
```
Replace `LANG` with your language code (e.g., `it` for Italian).

### Common Installation Warnings

When running `npm install`, you may see deprecation warnings. These are from transitive dependencies (dependencies of your dependencies) and are safe to ignore:

```
npm warn deprecated eslint@8.57.1: This version is no longer supported
npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
```

These warnings will be resolved when Next.js and eslint-config-next update their dependencies. The application will work perfectly fine with these warnings present.

### Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

**Node version issues:**
```bash
# Check your Node version
node --version

# Should be 18.x or higher
# Use nvm to switch versions if needed
nvm use 18
```

**Module not found errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Features

- Interactive map with country overlanding difficulty ratings
- Border crossing status and information
- Border post locations and details
- Multi-language support
- Read-only interface for viewing data

## Documentation

For more detailed information, see the [docs](./docs) directory:
- [Full Documentation](./docs/README.md)
- [Changes Log](./docs/CHANGES.md)
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

## Contributing

Contributions are welcome! Please ensure your code follows the project's ESLint configuration and TypeScript standards.

## License

[Your License Here]
