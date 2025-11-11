# Remove Translations Field Script

This script removes the `translations` field from all entities in the `country` collection in Firestore.

## Usage

### Dry Run (Recommended First)
```bash
npm run remove-translations:dry-run
```
This will scan and show what would be removed without making any changes.

### Actual Removal
```bash
npm run remove-translations
```
This will actually remove the translations fields from Firestore.

### Manual Execution
```bash
npx ts-node --project scripts/tsconfig.json scripts/remove-translations-field.ts [options]
```

## Options

- `--dry-run`: Preview changes without modifying Firestore
- `--verbose` or `-v`: Show detailed output for each country processed
- `--batch-size N`: Process N countries per batch (default: 100)

## Examples

```bash
# Preview what will be removed
npm run remove-translations:dry-run

# Remove with verbose output
npx ts-node --project scripts/tsconfig.json scripts/remove-translations-field.ts --verbose

# Remove with custom batch size
npx ts-node --project scripts/tsconfig.json scripts/remove-translations-field.ts --batch-size 50
```

## What it does

1. **Scans** all documents in the `country` collection
2. **Identifies** countries that have `parameters.translations` field
3. **Removes** the `parameters.translations` field using Firestore's `FieldValue.delete()`
4. **Processes** in batches to avoid rate limiting
5. **Verifies** removal by checking if any translations fields remain

## Safety Features

- **Dry run mode** to preview changes
- **Batch processing** to handle large datasets
- **Error handling** with detailed logging
- **Verification** step to confirm successful removal
- **Rate limiting** with delays between batches

## Prerequisites

- Firebase Admin SDK credentials in `.env` file
- `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable set
- Proper Firestore permissions for the service account