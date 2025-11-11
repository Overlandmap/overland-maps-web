# How to Serve the Static Export

## The Problem

With `NEXT_PUBLIC_BASE_PATH="/out"`, the application is configured to run at the `/out/` path. This means:
- All assets are referenced as `/out/_next/...`
- All links go to `/out/country/...`, etc.
- The app expects to be accessed at `/out/`

## Solution 1: Serve from Parent Directory (Recommended)

If you want to keep `NEXT_PUBLIC_BASE_PATH="/out"`:

```bash
# Serve from the parent directory of 'out'
npx serve .

# Access at: http://localhost:3000/out/
```

This way:
- The `out` directory is served at `/out/`
- Assets load from `/out/_next/...` ✅
- Everything works as expected ✅

## Solution 2: Change Base Path to Root

If you want to access at the root `/`:

1. **Edit `.env`:**
   ```bash
   NEXT_PUBLIC_BASE_PATH=""
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Serve the out directory:**
   ```bash
   npx serve out
   ```

4. **Access at:**
   ```
   http://localhost:3000/
   ```

## Common Mistakes

### ❌ Wrong: Serving `out` directory with base path `/out`

```bash
npx serve out
# Access at: http://localhost:3000/
```

**Problem:** The app expects to be at `/out/` but you're accessing `/`. The JavaScript files try to load from `/out/_next/...` but the server is looking for `out/out/_next/...` which doesn't exist.

### ✅ Correct: Serve parent directory

```bash
npx serve .
# Access at: http://localhost:3000/out/
```

**Works:** The app is at `/out/` and files load from `/out/_next/...` correctly.

### ✅ Correct: Change base path to empty

```bash
# In .env: NEXT_PUBLIC_BASE_PATH=""
npm run build
npx serve out
# Access at: http://localhost:3000/
```

**Works:** The app is at `/` and files load from `/_next/...` correctly.

## Quick Test

To verify your setup is working:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Load the page
4. Check if JavaScript files are loading:
   - Look for `/_next/static/chunks/...` requests
   - They should return `200 OK`, not `404`

If you see 404 errors for JavaScript files, you're serving from the wrong directory or accessing the wrong URL.

## For Different Servers

### Python HTTP Server

```bash
# Serve from parent directory
cd /path/to/project
python3 -m http.server 8000

# Access at: http://localhost:8000/out/
```

### Node serve

```bash
# Serve from parent directory
npx serve . -p 3000

# Access at: http://localhost:3000/out/
```

### Nginx

```nginx
server {
    listen 80;
    root /path/to/project;
    
    location /out/ {
        try_files $uri $uri/ /out/index.html;
    }
}
```

## Current Configuration

Your current setup:
- `NEXT_PUBLIC_BASE_PATH="/out"`
- Build output in `out/` directory
- **You must access at:** `http://localhost:PORT/out/`
- **You must serve from:** parent directory (not the `out` directory itself)

## Troubleshooting

### Page shows "Loading Overlanding Maps..." forever

**Cause:** JavaScript files aren't loading

**Check:**
1. Open DevTools → Network tab
2. Look for 404 errors on `/_next/static/` files
3. If you see 404s, you're serving from wrong directory

**Fix:** Serve from parent directory and access at `/out/`

### "Page Not Found" at root

**Expected behavior** with base path `/out/`

**Fix:** Access at `/out/` instead of `/`

### Want to deploy to root domain

**Fix:** Set `NEXT_PUBLIC_BASE_PATH=""` and rebuild
