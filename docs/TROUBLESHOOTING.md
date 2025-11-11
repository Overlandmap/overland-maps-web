# Troubleshooting Guide

## Common Issues and Solutions

### WebGL Context Error: "Too many active WebGL contexts"

**Problem**: You see the error "There are too many active WebGL contexts on this page, the oldest context will be lost" in the browser console.

**Cause**: This happens when multiple MapLibre GL JS instances are created without properly cleaning up previous ones, typically during development with hot reloading.

**Solutions**:

1. **Refresh the page**: The simplest solution is to refresh the browser page to clear all WebGL contexts.

2. **Singleton Map Manager** (implemented):
   - The application now uses a singleton MapManager to ensure only one map instance exists
   - WebGL contexts are properly managed and reused across component re-renders
   - Map instances are shared between component mounts/unmounts

3. **Browser limits**: Most browsers limit WebGL contexts to 16-32 active contexts. The singleton approach prevents hitting these limits.

**Prevention**:
- The MapManager singleton includes these safeguards:
  - Single map instance across the entire application
  - Proper map reuse when components re-mount
  - Centralized WebGL context management
  - Protocol registration happens only once

### Map Not Loading

**Problem**: The map appears blank or shows a loading spinner indefinitely.

**Possible Causes & Solutions**:

1. **PMTiles URL not accessible**:
   - Check if `https://www.overlanding.io/country-border.pmtiles` is accessible
   - Verify network connectivity
   - Check browser console for network errors

2. **Firebase configuration missing**:
   - Ensure `.env` file exists with proper Firebase configuration
   - Check that `FIREBASE_SERVICE_ACCOUNT_KEY` and `NEXT_PUBLIC_FIREBASE_CONFIG` are set

3. **Browser compatibility**:
   - Ensure browser supports WebGL
   - Try in a different browser (Chrome, Firefox, Safari)

### Performance Issues

**Problem**: Map is slow to load or interact with.

**Solutions**:

1. **Check network speed**: PMTiles requires good internet connectivity
2. **Browser performance**: Close other tabs using WebGL/GPU resources
3. **Device limitations**: Older devices may struggle with WebGL rendering

### Development Hot Reloading Issues

**Problem**: Map breaks after code changes during development.

**Solutions**:

1. **Refresh the page**: Hot reloading can sometimes cause state issues
2. **Restart dev server**: `npm run dev` to restart the development server
3. **Clear browser cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## Browser Console Debugging

Enable browser developer tools and check the console for these helpful logs:

- `🗺️ Initializing map with MapManager...` - Map initialization started via singleton
- `♻️ Reusing existing map instance` - Map instance being reused (good!)
- `🔄 Moving map to new container` - Map being moved to different container
- `✅ PMTiles protocol registered` - PMTiles protocol loaded successfully
- `✅ Map loaded via MapManager` - Map and layers loaded successfully
- `🧹 Component unmounting, clearing local reference` - Component cleanup

## Environment Variables

Ensure your `.env` file contains:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"..."}
BUILD_TIME=2024-01-01T00:00:00.000Z
```

## Browser Requirements

- **WebGL Support**: Required for MapLibre GL JS
- **Modern Browser**: Chrome 65+, Firefox 78+, Safari 12+, Edge 79+
- **JavaScript Enabled**: Required for React and map functionality

## Getting Help

If issues persist:

1. Check browser console for error messages
2. Verify all environment variables are set correctly
3. Test with a fresh browser session (incognito/private mode)
4. Ensure the PMTiles URL is accessible from your network

## Development Tips

- Use `npm run build` to test production builds
- Monitor browser console for WebGL context warnings
- Refresh page if map becomes unresponsive during development
- Use browser dev tools Network tab to check PMTiles loading