# Accessing the Application

## Important: Base Path Configuration

This application is configured with a base path of `/out` for subdirectory deployment. This affects how you access the application.

## How to Access the Application

### With Base Path (`NEXT_PUBLIC_BASE_PATH="/out"`)

When the base path is set to `/out`, you must access the application at:

```
http://localhost:3000/out/
```

**NOT** at the root:
```
http://localhost:3000/  ❌ This will show "Page Not Found"
```

### Without Base Path (`NEXT_PUBLIC_BASE_PATH=""`)

When the base path is empty (root deployment), access the application at:

```
http://localhost:3000/
```

## Testing Locally

### Option 1: Serve with the base path

```bash
# Build the application
npm run build

# Serve the out directory
npx serve out

# Access at: http://localhost:3000/out/
```

### Option 2: Change to root deployment for local testing

1. Edit `.env`:
   ```bash
   NEXT_PUBLIC_BASE_PATH=""
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

3. Serve:
   ```bash
   npx serve out
   ```

4. Access at: `http://localhost:3000/`

## Why This Happens

When Next.js is configured with a `basePath`, it:

1. Generates all pages under that path (e.g., `/out/country/USA`)
2. Configures all asset paths with that prefix (e.g., `/out/_next/static/...`)
3. Expects all navigation to include that prefix

The root path `/` is not part of the application when a base path is configured.

## Production Deployment

### GitHub Pages

For GitHub Pages deployment to `https://username.github.io/repository-name/`:

1. Set base path to match repository:
   ```bash
   NEXT_PUBLIC_BASE_PATH="/repository-name"
   ```

2. Users access at: `https://username.github.io/repository-name/`

### Subdirectory on Server

For deployment to `https://example.com/maps/`:

1. Set base path:
   ```bash
   NEXT_PUBLIC_BASE_PATH="/maps"
   ```

2. Users access at: `https://example.com/maps/`

### Root Domain

For deployment to `https://example.com/`:

1. Set empty base path:
   ```bash
   NEXT_PUBLIC_BASE_PATH=""
   ```

2. Users access at: `https://example.com/`

## Adding a Root Redirect (Optional)

If you want to redirect from `/` to `/out/`, you can add a simple HTML redirect page at the root of your server:

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=/out/">
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to <a href="/out/">Overlanding Maps</a>...</p>
</body>
</html>
```

Save this as `index.html` in your server root (outside the `out` directory).

## Quick Reference

| Configuration | Access URL | Use Case |
|--------------|------------|----------|
| `NEXT_PUBLIC_BASE_PATH="/out"` | `http://localhost:3000/out/` | GitHub Pages, subdirectory |
| `NEXT_PUBLIC_BASE_PATH=""` | `http://localhost:3000/` | Root domain |
| `NEXT_PUBLIC_BASE_PATH="/maps"` | `http://localhost:3000/maps/` | Custom subdirectory |

## Troubleshooting

### "Page Not Found" at root

✅ **Solution**: Access the application at the configured base path (e.g., `/out/`)

### Assets not loading

✅ **Solution**: Ensure you're accessing the correct base path URL

### Navigation not working

✅ **Solution**: Verify `NEXT_PUBLIC_BASE_PATH` matches your deployment path and rebuild

## Development Workflow

For the best development experience:

1. **Local Development**: Use `npm run dev` (no base path needed)
2. **Production Testing**: 
   - Keep base path as `/out` for GitHub Pages
   - Access at `http://localhost:3000/out/`
3. **Deployment**: Deploy `out` directory to your hosting service
