# JSON to GeoJSON Converter

This script converts a JSON array of points with latitude/longitude coordinates into a valid GeoJSON FeatureCollection.

## Usage

```bash
python3 scripts/json_to_geojson.py <input.json> [output.geojson]
```

### Examples

```bash
# Convert with automatic output filename
python3 scripts/json_to_geojson.py ~/Downloads/ru-borders.json

# Convert with custom output filename
python3 scripts/json_to_geojson.py ~/Downloads/ru-borders.json scripts/ru-borders.geojson
```

## Input Format

The script expects a JSON array where each object has at least `latitude` and `longitude` fields:

```json
[
  {
    "name": "Point Name",
    "status": 1,
    "id": 123,
    "latitude": "46.545927",
    "longitude": "48.637239",
    "foreign_checkpoint_en": null
  },
  ...
]
```

## Output Format

The script generates a valid GeoJSON FeatureCollection:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [48.637239, 46.545927]
      },
      "properties": {
        "name": "Point Name",
        "status": 1,
        "id": 123,
        "foreign_checkpoint_en": null
      }
    },
    ...
  ]
}
```

## Features

- ✅ Converts latitude/longitude to GeoJSON Point geometry
- ✅ Preserves all other fields as properties
- ✅ Handles coordinate format conversion (GeoJSON uses [longitude, latitude])
- ✅ Validates coordinates and skips invalid entries
- ✅ Supports home directory expansion (`~/Downloads/...`)
- ✅ Provides detailed progress and error reporting

## Notes

- **Coordinate Order**: GeoJSON uses `[longitude, latitude]` order, which is the opposite of the common `[latitude, longitude]` format
- **Invalid Coordinates**: Points with missing or invalid coordinates are skipped with a warning
- **Properties**: All fields except `latitude` and `longitude` are preserved in the `properties` object
- **Encoding**: The script properly handles UTF-8 encoding for international characters

## Example Workflow

```bash
# 1. Convert JSON to GeoJSON
python3 scripts/json_to_geojson.py ~/Downloads/ru-borders.json scripts/ru-borders.geojson

# 2. Verify the output
head -40 scripts/ru-borders.geojson

# 3. Use with other tools (e.g., transliteration)
python3 scripts/transliterate_geojson.py
```

## Error Handling

The script will:
- Exit with an error if the input file doesn't exist
- Exit with an error if the JSON is not an array
- Skip individual points with invalid coordinates (with a warning)
- Report the number of features processed and skipped
