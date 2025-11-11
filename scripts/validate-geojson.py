#!/usr/bin/env python3
"""
GeoJSON Validator Script
Validates GeoJSON files for proper structure and geometry
"""

import json
import sys
from pathlib import Path

def validate_geojson(file_path):
    """
    Validate a GeoJSON file
    
    Args:
        file_path: Path to the GeoJSON file
        
    Returns:
        tuple: (is_valid, errors)
    """
    errors = []
    
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if it's a valid JSON
        print(f"✓ Valid JSON structure")
        
        # Check for required GeoJSON properties
        if 'type' not in data:
            errors.append("Missing 'type' property")
        else:
            print(f"✓ Has 'type' property: {data['type']}")
            
            if data['type'] not in ['FeatureCollection', 'Feature', 'GeometryCollection', 
                                   'Point', 'LineString', 'Polygon', 'MultiPoint', 
                                   'MultiLineString', 'MultiPolygon']:
                errors.append(f"Invalid type: {data['type']}")
        
        # If it's a FeatureCollection, validate features
        if data.get('type') == 'FeatureCollection':
            if 'features' not in data:
                errors.append("FeatureCollection missing 'features' array")
            else:
                features = data['features']
                print(f"✓ Has 'features' array with {len(features)} features")
                
                # Validate each feature
                for i, feature in enumerate(features):
                    if 'type' not in feature:
                        errors.append(f"Feature {i} missing 'type' property")
                    elif feature['type'] != 'Feature':
                        errors.append(f"Feature {i} has invalid type: {feature['type']}")
                    
                    if 'geometry' not in feature:
                        errors.append(f"Feature {i} missing 'geometry' property")
                    else:
                        geometry = feature['geometry']
                        if geometry is None:
                            print(f"  ⚠ Feature {i} has null geometry")
                        elif 'type' not in geometry:
                            errors.append(f"Feature {i} geometry missing 'type' property")
                        elif 'coordinates' not in geometry:
                            errors.append(f"Feature {i} geometry missing 'coordinates' property")
                        else:
                            # Check if coordinates is valid
                            if not isinstance(geometry['coordinates'], list):
                                errors.append(f"Feature {i} geometry coordinates is not an array")
                    
                    if 'properties' not in feature:
                        errors.append(f"Feature {i} missing 'properties' property")
                
                if not errors:
                    print(f"✓ All {len(features)} features are valid")
        
        # If it's a Feature, validate it
        elif data.get('type') == 'Feature':
            if 'geometry' not in data:
                errors.append("Feature missing 'geometry' property")
            if 'properties' not in data:
                errors.append("Feature missing 'properties' property")
        
        return len(errors) == 0, errors
        
    except json.JSONDecodeError as e:
        errors.append(f"Invalid JSON: {str(e)}")
        return False, errors
    except Exception as e:
        errors.append(f"Error reading file: {str(e)}")
        return False, errors

def main():
    """Main function to validate GeoJSON files"""
    
    # Files to validate
    files_to_validate = [
        'public/data/borders.geojson',
        'public/data/borders-optimized.geojson',
        'public/data/countries-50m.geojson'
    ]
    
    print("=" * 60)
    print("GeoJSON Validator")
    print("=" * 60)
    
    all_valid = True
    
    for file_path in files_to_validate:
        path = Path(file_path)
        
        print(f"\n📄 Validating: {file_path}")
        print("-" * 60)
        
        if not path.exists():
            print(f"❌ File not found: {file_path}")
            all_valid = False
            continue
        
        # Get file size
        file_size = path.stat().st_size
        print(f"File size: {file_size:,} bytes ({file_size / 1024 / 1024:.2f} MB)")
        
        # Validate the file
        is_valid, errors = validate_geojson(file_path)
        
        if is_valid:
            print(f"\n✅ {file_path} is VALID")
        else:
            print(f"\n❌ {file_path} is INVALID")
            print("\nErrors found:")
            for error in errors:
                print(f"  • {error}")
            all_valid = False
    
    print("\n" + "=" * 60)
    if all_valid:
        print("✅ All GeoJSON files are valid!")
        return 0
    else:
        print("❌ Some GeoJSON files have errors")
        return 1

if __name__ == '__main__':
    sys.exit(main())
