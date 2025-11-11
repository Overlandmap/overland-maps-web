# Release V2.7 - Legend Enhancements and Border Post Improvements

**Release Date:** November 10, 2025

## Overview
Version 2.7 introduces comprehensive legend improvements, border post visibility controls, and enhanced status mapping for border posts. This release focuses on improving the user experience with better visual organization and more accurate status representations.

## New Features

### 1. Enhanced Legend Organization
- **Renamed Legend Titles:**
  - "Overlanding status" → "Overlanding" (not translated)
  - "Carnet requirements" → "Carnet de passage en Douane (CpD)" (not translated)
  - "Border status" → "Borders" (translated in all languages)

- **New Border Posts Legend:**
  - Added dedicated "Border Posts" legend section with circular color indicators
  - Displays 4 status types: Open (green), Bilateral (blue), Restrictions apply (yellow), Closed (red)
  - Only visible when "Overlanding" color scheme is selected

- **Removed "Unknown" Status:**
  - Removed "Unknown" status from Overlanding legend for cleaner presentation

### 2. Border Posts Visibility Toggle
- **New Toggle Switch:**
  - Added toggle switch before "Border Posts" legend title
  - Enabled by default
  - Controls visibility of border_post layer on the map
  - Allows users to declutter the map when needed

### 3. Border Post Status Improvements
- **Updated Color Scheme:**
  - Changed Bilateral status from orange to blue (#3b82f6)
  - Maintains consistency: Open (green), Bilateral (blue), Restrictions (yellow), Closed (red)

- **Temporary Closed Status:**
  - Added support for is_open=4 as "Temporary Closed"
  - Displays as red on map (same as Closed)
  - Shows distinct "Temporary Closed" label in detail view
  - Fully translated in all 8 supported languages

### 4. Translation Enhancements
- **New Translations Added:**
  - `borders` - "Borders" (capitalized, translated)
  - `border_posts` - "Border Posts" (translated)
  - `bilateral` - "Bilateral" (translated)
  - `restrictions_apply` - "Restrictions apply" (translated)
  - `temporary_closed` - "Temporary Closed" (translated)

- **Supported Languages:**
  - English, German, Spanish, French, Italian, Japanese, Russian, Chinese

### 5. Visual Improvements
- **Consistent Spacing:**
  - Added proper margin between legend groups
  - Uniform spacing between Overlanding/Carnet, Borders, and Border Posts sections

- **Visual Distinction:**
  - Borders: Rectangular color patches
  - Border Posts: Circular color patches
  - Clear visual differentiation between map elements

## Technical Changes

### Files Modified
1. **overlanding-maps/src/components/SimpleMapContainer.tsx**
   - Updated legend structure and titles
   - Added border posts visibility toggle
   - Added state management for showBorderPosts
   - Updated border_post layer color mapping
   - Added conditional rendering for Borders and Border Posts legends

2. **overlanding-maps/src/lib/i18n.ts**
   - Added 5 new translation keys
   - Updated all 8 language translations

3. **overlanding-maps/src/components/DetailSidebar.tsx**
   - Updated getBorderPostStatus function to use translations
   - Added case 4 for Temporary Closed status
   - Changed Bilateral color from orange to blue

### Color Mapping

#### Border Posts (is_open values):
- `-1` or unknown: Grey (#9ca3af)
- `0`: Closed - Red (#ef4444)
- `1`: Bilateral - Blue (#3b82f6) ⚠️ Changed from orange
- `2`: Open - Green (#22c55e)
- `3`: Restrictions apply - Yellow (#eab308)
- `4`: Temporary Closed - Red (#ef4444) ⚠️ New

#### Borders (is_open values):
- `0`: Closed - Red (#ef4444)
- `1`: Dangerous - Yellow (#eab308)
- `2`: Open - Green (#15803d)

## User Experience Improvements

1. **Clearer Legend Organization:**
   - Legends are now grouped logically
   - Only relevant legends shown based on selected color scheme
   - Better visual hierarchy with consistent spacing

2. **Map Decluttering:**
   - Users can toggle border posts visibility
   - Reduces visual noise when focusing on countries or borders

3. **More Accurate Status Information:**
   - Distinction between "Closed" and "Temporary Closed"
   - Better reflects real-world border post conditions

4. **Improved Internationalization:**
   - All new features fully translated
   - Consistent terminology across all languages

## Migration Notes

### For Users
- Border posts are visible by default - use the toggle to hide them if needed
- Bilateral border posts now appear blue instead of orange
- "Temporary Closed" is a new status distinct from "Closed"

### For Developers
- New translation keys available: `borders`, `border_posts`, `bilateral`, `restrictions_apply`, `temporary_closed`
- Border post status function now uses i18n translations
- Border posts visibility controlled by `showBorderPosts` state

## Known Issues
None

## Future Enhancements
- Consider adding similar visibility toggles for borders layer
- Potential for saving user preferences (toggle states) in localStorage
- Additional border post status types as needed

---

**Version:** 2.7  
**Previous Version:** 2.6  
**Next Version:** TBD
