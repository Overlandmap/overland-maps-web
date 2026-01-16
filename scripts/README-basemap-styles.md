# Basemap Style Generation

This directory contains scripts to generate language-specific basemap style files.

## Overview

The basemap styles are used by MapLibre GL to render map labels in different languages. We maintain a reference file (`basemap-fr.json`) and generate language-specific versions by replacing the language code in the `name:XX` fields.

## Scripts

### TypeScript Version

**File:** `generate-basemap-styles.ts`

**Usage:**
```bash
npm run generate:basemap-styles
```

**Features:**
- Type-safe implementation
- Detailed error handling
- Summary statistics

### Bash Version

**File:** `generate-basemap-styles.sh`

**Usage:**
```bash
./scripts/generate-basemap-styles.sh
```

**Features:**
- Fast execution
- No dependencies beyond bash and sed
- Colored output

## Supported Languages

The scripts generate basemap styles for the following languages:

- `de` - German (Deutsch)
- `en` - English
- `es` - Spanish (Español)
- `it` - Italian (Italiano)
- `ja` - Japanese (日本語)
- `nl` - Dutch (Nederlands)
- `pt` - Portuguese (Português)
- `ru` - Russian (Русский)

The reference file is `basemap-fr.json` (French).

## How It Works

1. Reads the reference file `public/styles/basemap-fr.json`
2. Replaces all occurrences of `"name:fr"` with `"name:XX"` for each target language
3. Writes the result to `public/styles/basemap-XX.json`

## Example

The reference file contains:
```json
{
  "text-field": ["coalesce", ["get", "name:fr"], ["get", "name:en"], ["get", "name"]]
}
```

After generation for German (`de`):
```json
{
  "text-field": ["coalesce", ["get", "name:de"], ["get", "name:en"], ["get", "name"]]
}
```

## When to Run

Run this script whenever you:
- Update the reference `basemap-fr.json` file
- Add new layers or labels to the basemap
- Need to regenerate all language variants

## Output

The scripts generate the following files in `public/styles/`:
- `basemap-de.json`
- `basemap-en.json`
- `basemap-es.json`
- `basemap-it.json`
- `basemap-ja.json`
- `basemap-nl.json`
- `basemap-pt.json`
- `basemap-ru.json`

## Notes

- The reference file (`basemap-fr.json`) should be manually maintained
- All generated files are overwritten when the script runs
- The script preserves all JSON formatting and structure
- Only the language code in `name:XX` fields is modified
