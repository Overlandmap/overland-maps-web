#!/bin/bash
# Generate basemap style files for all supported languages
# This script reads basemap-fr.json and creates language-specific versions

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
STYLES_DIR="public/styles"
REFERENCE_FILE="$STYLES_DIR/basemap-fr.json"
LANGUAGES=("de" "en" "es" "it" "ja" "nl" "pt" "ru")

echo "Generating basemap style files..."
echo ""

# Check if reference file exists
if [ ! -f "$REFERENCE_FILE" ]; then
    echo -e "${RED}Error: Reference file not found: $REFERENCE_FILE${NC}"
    exit 1
fi

# Generate styles for all languages
SUCCESS_COUNT=0
ERROR_COUNT=0

for lang in "${LANGUAGES[@]}"; do
    OUTPUT_FILE="$STYLES_DIR/basemap-$lang.json"
    
    # Replace "name:fr" with "name:XX" using sed
    if sed "s/\"name:fr\"/\"name:$lang\"/g" "$REFERENCE_FILE" > "$OUTPUT_FILE"; then
        echo -e "${GREEN}✓${NC} Generated basemap-$lang.json"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}✗${NC} Error generating basemap-$lang.json"
        ((ERROR_COUNT++))
    fi
done

# Summary
echo ""
echo "=================================================="
echo "Summary:"
echo "  ✓ Successfully generated: $SUCCESS_COUNT files"
if [ $ERROR_COUNT -gt 0 ]; then
    echo "  ✗ Failed: $ERROR_COUNT files"
fi
echo "=================================================="
echo ""

if [ $ERROR_COUNT -gt 0 ]; then
    exit 1
fi
