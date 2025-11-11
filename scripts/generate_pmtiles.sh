#!/bin/sh
#npm run dev&
#sleep 1
#curl -X POST http://localhost:3000/api/regenerate-static-data/
#kill %1
echo "This can take a couple minutes..."
npm run build:data:skip-validation
echo "OK, static data fetched from firestore. Generating pmtiles..."
npm run merge-countries-geojson
rm -f b.pmtiles bp.pmtiles c.pmtiles country-borders.pmtiles
tippecanoe -z4 -o b.pmtiles -l border -x geomstring -x geomtype public/data/borders.geojson 
tippecanoe -z4 -o bp.pmtiles -l border_post -x location -x countries public/data/border-posts.geojson
tippecanoe -z4 -o c.pmtiles -l country public/data/countries-merged.geojson
tile-join -o country-borders.pmtiles b.pmtiles c.pmtiles bp.pmtiles
cp public/data/borders.json overlanding-maps/public/data
cp public/data/countries.json overlanding-maps/public/data
echo "Done; Copy command:"
echo "scp country-borders.pmtiles ubuntu@overlanding.io:/var/www/overlanding.io/html/"

