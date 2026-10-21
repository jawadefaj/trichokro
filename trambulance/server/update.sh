#!/usr/bin/env bash
# Weekly refresh (run by cron on Saturday 21:00 UTC = Sunday 3 AM in Dhaka):
# new road data for routing and a new map file. Address search updates itself.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"
OSRM_IMAGE="ghcr.io/project-osrm/osrm-backend:v26.10.0-debian"
echo "=== $(date -u) update started"

curl -fL --retry 3 -o data/pbf/bangladesh-latest.osm.pbf.part https://download.geofabrik.de/asia/bangladesh-latest.osm.pbf
mv data/pbf/bangladesh-latest.osm.pbf.part data/pbf/bangladesh-latest.osm.pbf

rm -rf data/osrm-new && mkdir -p data/osrm-new
cp data/pbf/bangladesh-latest.osm.pbf data/osrm-new/bangladesh.osm.pbf
sudo docker run --rm -v "$HERE/data/osrm-new:/data" "$OSRM_IMAGE" osrm-extract -p /opt/car.lua /data/bangladesh.osm.pbf
sudo docker run --rm -v "$HERE/data/osrm-new:/data" "$OSRM_IMAGE" osrm-partition /data/bangladesh.osrm
sudo docker run --rm -v "$HERE/data/osrm-new:/data" "$OSRM_IMAGE" osrm-customize /data/bangladesh.osrm
rm -f data/osrm-new/bangladesh.osm.pbf

# Swap in the new routing data; the app uses the public router for the few seconds of restart
rm -rf data/osrm-old && mv data/osrm data/osrm-old && mv data/osrm-new data/osrm
sudo docker compose restart osrm
rm -rf data/osrm-old

bash "$HERE/update-tiles.sh"
echo "=== $(date -u) update finished"
