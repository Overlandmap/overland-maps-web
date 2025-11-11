# Configuration Guide

## Quick Start

### For Subdirectory Deployment (e.g., GitHub Pages)

1. Edit `.env`:
   ```bash
   NEXT_PUBLIC_BASE_PATH="/out"
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy the `out` directory

### For Root Domain Deployment

1. Edit `.env`:
   ```bash
   NEXT_PUBLIC_BASE_PATH=""
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy the `out` directory

## Environment Variables

### Required Variables

```bash
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY='...'
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."

# Deployment Type
NEXT_PUBLIC_DEPLOYMENT_TYPE="dynamic"

# Base Path (NEW)
NEXT_PUBLIC_BASE_PATH="/out"
```

### Base Path Options

| Scenario | Value | Example URL |
|----------|-------|-------------|
| GitHub Pages | `/repository-name` | `https://user.github.io/repo/country/USA` |
| Subdirectory | `/subdirectory` | `https://example.com/subdirectory/country/USA` |
| Root Domain | `""` (empty) | `https://example.com/country/USA` |

## Testing Your Configuration

```bash
# 1. Check environment variable
echo $NEXT_PUBLIC_BASE_PATH

# 2. Build the application
npm run build

# 3. Serve locally
npx serve out

# 4. Test in browser
# With base path: http://localhost:3000/out/
# Without base path: http://localhost:3000/
```

## Common Issues

### Assets not loading
- Ensure `NEXT_PUBLIC_BASE_PATH` is set before building
- Rebuild after changing the environment variable
- Check browser console for 404 errors

### Navigation not working
- Verify the base path matches your deployment URL
- Clear browser cache
- Check that all links use the `generateEntityUrl()` function

### Wrong URLs generated
- Confirm environment variable is prefixed with `NEXT_PUBLIC_`
- Rebuild the application
- Verify `.env` file is in the project root

## Accessing the Application

### With Base Path (`/out`)

When `NEXT_PUBLIC_BASE_PATH="/out"`, access the application at:
```
http://localhost:3000/out/
```

**Important**: The root path `/` will show "Page Not Found" because the application is configured for subdirectory deployment.

### Without Base Path (Root)

When `NEXT_PUBLIC_BASE_PATH=""`, access the application at:
```
http://localhost:3000/
```

### Adding a Root Redirect (Optional)

If you want to redirect from `/` to `/out/`, you can:

1. Copy `redirect-to-out.html` to your server root as `index.html`
2. This will automatically redirect users from `/` to `/out/`

## More Information

- [docs/ACCESSING-THE-APP.md](docs/ACCESSING-THE-APP.md) - Detailed access instructions
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide
