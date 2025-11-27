# Dutch Translation Scripts

This directory contains scripts to add Dutch (nl) translations for country names and capitals to the Firestore database.

## Available Scripts

### 1. From JSON File Script (`add-dutch-from-json.ts`) ⭐ RECOMMENDED

Uses existing Dutch translations from `public/data/countries.json` file.

**Pros:**
- Fast and reliable
- Uses existing translations
- No API dependencies
- No manual work if translations already exist in JSON

**Cons:**
- Only works if Dutch translations are already in the JSON file

**Usage:**

```bash
# Dry run (see what would be changed without making changes)
npx ts-node scripts/add-dutch-from-json.ts --dry-run

# Apply translations
npx ts-node scripts/add-dutch-from-json.ts
```

### 2. Automated Translation Script (`add-dutch-translations.ts`)

Uses LibreTranslate API to automatically translate country and capital names from English to Dutch.

**Pros:**
- Fully automated
- No manual work required

**Cons:**
- Requires internet connection
- May have rate limiting
- Translations may not always be accurate or use official names
- Slower due to API calls

**Usage:**

```bash
# Dry run (see what would be changed without making changes)
npx ts-node scripts/add-dutch-translations.ts --dry-run

# Apply translations
npx ts-node scripts/add-dutch-translations.ts
```

### 3. Manual Translation Script (`add-dutch-translations-manual.ts`)

Uses a manual mapping file for translations. More reliable and respects official country names.

**Pros:**
- More accurate translations
- Uses official country names
- Faster execution
- No API dependencies

**Cons:**
- Requires manual translation work

**Usage:**

```bash
# Step 1: Generate the translation mapping file
npx ts-node scripts/add-dutch-translations-manual.ts --generate

# Step 2: Edit scripts/dutch-translations.json
# Fill in the 'dutchName' and 'dutchCapital' fields

# Step 3: Test with dry run
npx ts-node scripts/add-dutch-translations-manual.ts --apply --dry-run

# Step 4: Apply the translations
npx ts-node scripts/add-dutch-translations-manual.ts --apply
```

## Translation File Format

The `dutch-translations.json` file has the following structure:

```json
[
  {
    "id": "AFG",
    "englishName": "Afghanistan",
    "dutchName": "Afghanistan",
    "englishCapital": "Kabul",
    "dutchCapital": "Kabul"
  },
  {
    "id": "ALB",
    "englishName": "Albania",
    "dutchName": "Albanië",
    "englishCapital": "Tirana",
    "dutchCapital": "Tirana"
  }
]
```

## Common Dutch Country Name Translations

Here are some common patterns for Dutch country names:

- Countries ending in "-ia" often become "-ië" in Dutch (Albania → Albanië)
- Countries ending in "-y" often become "-ië" in Dutch (Germany → Duitsland is an exception)
- Many country names are similar or identical to English
- Some countries have completely different names (e.g., Germany → Duitsland, Greece → Griekenland)

## Tips for Manual Translation

1. Use official Dutch government sources for country names
2. Check the Dutch Wikipedia for official translations
3. Capital cities often keep their original names
4. When in doubt, use the English name (many are internationally recognized)

## Verification

After running the scripts, you can verify the translations by:

1. Checking the Firestore console
2. Running the backup script: `npx ts-node scripts/backup-firestore.ts`
3. Checking the generated backup file for the `nl` fields in `translations` and `capital_translations`

## Rollback

If you need to rollback the changes:

1. Use a backup created before running the translation script
2. Run: `npx ts-node scripts/restore-firestore.ts`
3. Select the backup file from before the translation

## Environment Variables

Make sure your `.env` file contains:

```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

## Notes

- Both scripts will skip countries that already have Dutch translations
- The scripts update the `translations.nl` and `capital_translations.nl` fields
- The scripts handle both data structures (with and without `parameters` wrapper)
- Rate limiting is built into the automated script (1 second delay between translations)
