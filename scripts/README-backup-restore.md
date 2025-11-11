# Firestore Backup and Restore Scripts

These scripts allow you to backup and restore Firestore collections to/from JSON files, making it easy to migrate data between Firebase accounts or create backups.

## Prerequisites

- Node.js installed
- Firebase Admin SDK credentials configured in `.env`
- `ts-node` installed (or use `npx ts-node`)

## Backup Script

### Usage

```bash
npx ts-node scripts/backup-firestore.ts
```

### What it does

1. Connects to your Firestore database using the credentials in `.env`
2. Backs up three collections: `country`, `border`, and `border_post`
3. Saves each collection to a JSON file in the `backups/` directory
4. Files are named with timestamps: `{collection}-backup-{date}.json`

### Output

```
backups/
├── country-backup-2025-11-11.json
├── border-backup-2025-11-11.json
└── border_post-backup-2025-11-11.json
```

### Backup File Format

Each backup file contains:

```json
{
  "collection": "country",
  "timestamp": "2025-11-11T10:00:00.000Z",
  "count": 242,
  "documents": [
    {
      "id": "document-id",
      "data": {
        "field1": "value1",
        "field2": "value2"
      }
    }
  ]
}
```

## Restore Script

### Usage

```bash
# Restore from default backup directory (backups/)
npx ts-node scripts/restore-firestore.ts

# Restore from custom directory
npx ts-node scripts/restore-firestore.ts path/to/backups

# Overwrite existing documents
npx ts-node scripts/restore-firestore.ts --overwrite
```

### What it does

1. Finds the most recent backup files for each collection
2. Restores documents to your Firestore database
3. By default, skips documents that already exist
4. With `--overwrite` flag, updates existing documents

### Options

- **Default mode**: Skips existing documents (safe)
- **`--overwrite` mode**: Overwrites existing documents with backup data

### Restore Process

1. Reads backup files from the specified directory
2. Processes documents in batches of 500
3. Shows progress during restore
4. Provides summary of restored, skipped, and failed documents

## Migrating to a Different Firebase Account

### Step 1: Backup from Source Account

1. Configure `.env` with source account credentials:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
   ```

2. Run backup:
   ```bash
   npx ts-node scripts/backup-firestore.ts
   ```

3. Backup files are saved to `backups/` directory

### Step 2: Restore to Target Account

1. Update `.env` with target account credentials:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
   ```

2. Run restore:
   ```bash
   npx ts-node scripts/restore-firestore.ts
   ```

3. Data is restored to the new account

## Example Output

### Backup

```
🔄 Starting Firestore backup...
============================================================

📦 Backing up collection: country
   Found 242 documents
   ✅ Backup saved to: backups/country-backup-2025-11-11.json
   📊 Size: 0.31 MB

📦 Backing up collection: border
   Found 336 documents
   ✅ Backup saved to: backups/border-backup-2025-11-11.json
   📊 Size: 0.82 MB

📦 Backing up collection: border_post
   Found 124 documents
   ✅ Backup saved to: backups/border_post-backup-2025-11-11.json
   📊 Size: 0.06 MB

============================================================
✅ Backup Complete!
============================================================

Summary:
  country           242 documents
  border            336 documents
  border_post       124 documents
  TOTAL             702 documents
```

### Restore

```
🔄 Starting Firestore restore...
============================================================
📁 Backup directory: backups

⚠️  WARNING: This will restore data to your Firestore database.
   Existing documents will be skipped by default.

📦 Restoring from: country-backup-2025-11-11.json
   Collection: country
   Documents: 242
   Backup date: 2025-11-11T10:00:00.000Z
   Progress: 242/242 documents
   ✅ Restored: 242 documents

📦 Restoring from: border-backup-2025-11-11.json
   Collection: border
   Documents: 336
   Backup date: 2025-11-11T10:00:00.000Z
   Progress: 336/336 documents
   ✅ Restored: 336 documents

📦 Restoring from: border_post-backup-2025-11-11.json
   Collection: border_post
   Documents: 124
   Backup date: 2025-11-11T10:00:00.000Z
   Progress: 124/124 documents
   ✅ Restored: 124 documents

============================================================
✅ Restore Complete!
============================================================

Summary:

  country:
    Restored: 242
    Skipped:  0
    Errors:   0

  border:
    Restored: 336
    Skipped:  0
    Errors:   0

  border_post:
    Restored: 124
    Skipped:  0
    Errors:   0

  TOTAL:
    Restored: 702
    Skipped:  0
    Errors:   0
```

## Safety Features

1. **Backup files are timestamped** - Multiple backups can coexist
2. **Default restore mode is safe** - Existing documents are not overwritten
3. **Batch processing** - Large collections are handled efficiently
4. **Error handling** - Failed documents are logged and counted
5. **Progress indicators** - You can monitor the restore process

## Troubleshooting

### "No backup files found"

- Check that you've run the backup script first
- Verify the backup directory path is correct
- Ensure backup files exist in the `backups/` directory

### "Permission denied" errors

- Verify your Firebase service account has read/write permissions
- Check that the credentials in `.env` are correct
- Ensure the service account has Firestore access

### "Document already exists" warnings

- This is normal in default mode - existing documents are skipped
- Use `--overwrite` flag if you want to update existing documents

## Notes

- Backup files are excluded from git (added to `.gitignore`)
- Store backup files securely - they contain your database data
- Test restore on a development account before production
- Large collections may take several minutes to backup/restore
