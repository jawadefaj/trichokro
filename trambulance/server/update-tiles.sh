#!/usr/bin/env bash
# Extracts a fresh Bangladesh map (bangladesh.pmtiles) from the latest Protomaps daily build.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"
BBOX="88.0,20.5,92.75,26.7"
# Daily builds are kept for about a week, so look back up to 7 days
SRC=""
for i in 0 1 2 3 4 5 6 7; do
  D="$(date -u -d "-$i day" +%Y%m%d)"
  if bin/pmtiles show "https://build.protomaps.com/$D.pmtiles" >/dev/null 2>&1; then
    SRC="https://build.protomaps.com/$D.pmtiles"
    break
  fi
done
if [ -z "$SRC" ]; then
  echo "No Protomaps daily build found in the last 7 days. Keeping the current map." >&2
  exit 0
fi
echo "Extracting from $SRC"
bin/pmtiles extract "$SRC" data/tiles/bangladesh.pmtiles.part --bbox="$BBOX" --download-threads=4
mv data/tiles/bangladesh.pmtiles.part data/tiles/bangladesh.pmtiles
ls -lh data/tiles/bangladesh.pmtiles
