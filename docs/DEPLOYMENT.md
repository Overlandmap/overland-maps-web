# Deployment Configuration

This document explains how to configure the application for different deployment scenarios.

## Base Path Configuration

The application supports deployment to both root domains and subdirectories through the `NEXT_PUBLIC_BASE_PATH` environment variable.

### Environment Variable

Add this to your `.env` file:

```bash
# Base Path Configuration
# Set the base path for subdirectory deployment (e.g., '/out' for GitHub Pages)
# Leave empty for root deployment
NEXT_PUBLIC_BASE_PATH="/out"
```

### Deployment Scenarios

#### 1. Subdirectory Deployment (e.g., GitHub Pages)

For deployment to a subdirectory like `https://yourdomain.com/out/`:

```bash
# .env
NEXT_PUBLIC_BASE_PATH="/out"
```

Then build:
```bash
npm run build
```

The application will generate URLs like:
- `/out/country/USA`
- `/out/border/123`
- `/out/border_post/456`

#### 2. Root Domain Deployment

For deployment to the root of a domain like `https://yourdomain.com/`:

```bash
# .env
NEXT_PUBLIC_BASE_PATH=""
```

Then build:
```bash
npm run build
```

The application will generate URLs like:
- `/country/USA`
- `/border/123`
- `/border_post/456`

### How It Works

1. **Environment Variable**: The `NEXT_PUBLIC_BASE_PATH` is read from `.env` at build time
2. **Next.js Configuration**: `next.config.js` uses this value for `basePath` and `assetPrefix`
3. **URL Generation**: The `src/lib/url-utils.ts` utility uses this value to generate all navigation URLs
4. **Static Export**: All generated HTML and assets include the correct path prefix

### Configuration Files

The base path is configured in three places:

1. **`.env`** - Environment variable definition
   ```bash
   NEXT_PUBLIC_BASE_PATH="/out"
   ```

2. **`next.config.js`** - Next.js configuration
   ```javascript
   const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
   
   const nextConfig = {
     basePath: basePath,
     assetPrefix: basePath,
     // ...
   }
   ```

3. **`src/lib/url-utils.ts`** - URL generation utility
   ```typescript
   function getBasePath(): string {
     return process.env.NEXT_PUBLIC_BASE_PATH || '';
   }
   ```

### Testing Configuration

To test your configuration:

```bash
# Run the test script
node test-env-config.js

# Build the application
npm run build

# Serve the output directory
npx serve out
# or
cd out && python3 -m http.server 8000
```

Then navigate to:
- With base path: `http://localhost:8000/out/`
- Without base path: `http://localhost:8000/`

### GitHub Pages Deployment

For GitHub Pages deployment to `https://username.github.io/repository-name/`:

1. Set the base path to match your repository name:
   ```bash
   NEXT_PUBLIC_BASE_PATH="/repository-name"
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy the `out` directory to GitHub Pages

### Vercel/Netlify Deployment

For deployment to Vercel or Netlify at the root domain:

1. Set an empty base path:
   ```bash
   NEXT_PUBLIC_BASE_PATH=""
   ```

2. Configure the environment variable in your deployment platform's settings

3. Build and deploy

### Troubleshooting

#### URLs not working after deployment

- Verify `NEXT_PUBLIC_BASE_PATH` matches your deployment path
- Check that the environment variable is set at build time
- Ensure you rebuild after changing the environment variable

#### Assets (CSS, JS) not loading

- The `basePath` and `assetPrefix` in `next.config.js` must match
- Verify the environment variable is prefixed with `NEXT_PUBLIC_`
- Check browser console for 404 errors on asset paths

#### Navigation not working

- Ensure `src/lib/url-utils.ts` is using `process.env.NEXT_PUBLIC_BASE_PATH`
- Verify all navigation uses the `generateEntityUrl()` function
- Check that browser history API calls include the base path

### Best Practices

1. **Use `.env.example`**: Document your configuration in `.env.example`
2. **Test locally**: Always test with the production build before deploying
3. **Environment-specific configs**: Use different `.env` files for different environments
4. **Version control**: Never commit `.env` files with sensitive data
5. **Build-time configuration**: Remember that `NEXT_PUBLIC_*` variables are embedded at build time

### Example Configurations

#### Development (Local)
```bash
NEXT_PUBLIC_BASE_PATH=""
```

#### Staging (Subdirectory)
```bash
NEXT_PUBLIC_BASE_PATH="/staging"
```

#### Production (Root)
```bash
NEXT_PUBLIC_BASE_PATH=""
```

#### Production (GitHub Pages)
```bash
NEXT_PUBLIC_BASE_PATH="/overlanding-maps"
```
