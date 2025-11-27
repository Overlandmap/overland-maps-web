#!/usr/bin/env python3
"""
Convert JSON array to GeoJSON format
Usage: python3 json_to_geojson.py <input.json> <output.geojson>
       python3 json_to_geojson.py ~/Downloads/ru-borders.json ru-borders.geojson
"""

import json
import sys
import os

def json_to_geojson(input_path, output_path):
    """
    Convert a JSON array of points to GeoJSON FeatureCollection.
    
    Expected input format:
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
    """
    
    # Expand home directory if needed
    input_path = os.path.expanduser(input_path)
    
    if not os.path.exists(input_path):
        print(f"Error: Input file not found: {input_path}")
        sys.exit(1)
    
    print(f"Reading {input_path}...")
    
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        print("Error: Input JSON must be an array")
        sys.exit(1)
    
    print(f"Found {len(data)} points")
    
    # Create GeoJSON structure
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }
    
    skipped = 0
    
    for item in data:
        # Extract coordinates
        try:
            lat = float(item.get('latitude', 0))
            lon = float(item.get('longitude', 0))
        except (ValueError, TypeError):
            print(f"Warning: Skipping item with invalid coordinates: {item.get('name', 'Unknown')}")
            skipped += 1
            continue
        
        # Create properties (all fields except lat/lon)
        properties = {}
        for key, value in item.items():
            if key not in ['latitude', 'longitude']:
                properties[key] = value
        
        # Create GeoJSON feature
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]  # GeoJSON uses [longitude, latitude]
            },
            "properties": properties
        }
        
        geojson["features"].append(feature)
    
    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Success!")
    print(f"   Output: {output_path}")
    print(f"   Features: {len(geojson['features'])}")
    if skipped > 0:
        print(f"   Skipped: {skipped}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 json_to_geojson.py <input.json> [output.geojson]")
        print("Example: python3 json_to_geojson.py ~/Downloads/ru-borders.json ru-borders.geojson")
        sys.exit(1)
    
    input_path = sys.argv[1]
    
    # Default output path
    if len(sys.argv) >= 3:
        output_path = sys.argv[2]
    else:
        # Generate output filename from input
        base = os.path.splitext(os.path.basename(input_path))[0]
        output_path = f"{base}.geojson"
    
    json_to_geojson(input_path, output_path)

if __name__ == "__main__":
    main()
