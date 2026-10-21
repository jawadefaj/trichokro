#!/usr/bin/env bash
# One-time setup of the Trambulance map server on an Oracle Cloud Always Free
# Ampere (ARM) VM running Ubuntu 24.04. Run from this folder:
#
#   DOMAIN=trambulance-map.duckdns.org EMAIL=you@gmail.com bash setup.sh
#
# Takes about 30–60 minutes, plus a few hours of address-search import that
# continues in the background afterwards.
set -euo pipefail

: "${DOMAIN:?Set DOMAIN, for example DOMAIN=trambulance-map.duckdns.org}"
: "${EMAIL:?Set EMAIL (used for the free HTTPS certificate)}"

HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"
PBF_URL="https://download.geofabrik.de/asia/bangladesh-latest.osm.pbf"
OSRM_IMAGE="ghcr.io/project-osrm/osrm-backend:v26.10.0-debian"
PMTILES_VERSION="1.31.2"
PMTILES_SHA256_ARM64="f8bd47e7ea866863489cad588fbaf2f31f42e5821f7a03f009b3769f05801cb1"

say() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }

if [ "$(uname -m)" != "aarch64" ]; then
  echo "This script expects an ARM (Ampere A1) server. Found: $(uname -m)" >&2
  exit 1
fi

say "1/8 Opening ports 80 and 443 in the server firewall"
# Oracle's Ubuntu image blocks everything except SSH. Rules are inserted
# before Docker is installed so the saved rule set stays clean.
for rule in "tcp 80" "tcp 443" "udp 443"; do
  set -- $rule
  if ! sudo iptables -C INPUT -p "$1" --dport "$2" -j ACCEPT 2>/dev/null; then
    sudo iptables -I INPUT 1 -p "$1" --dport "$2" -j ACCEPT
  fi
done
if command -v netfilter-persistent >/dev/null 2>&1; then
  sudo netfilter-persistent save
fi

say "2/8 Installing Docker"
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2 curl ca-certificates openssl
sudo systemctl enable --now docker
DOCKER="sudo docker"

say "3/8 Adding 4 GB swap (helps the one-time import on 12 GB RAM)"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

say "4/8 Writing settings (.env)"
if [ ! -f .env ]; then
  cat > .env <<ENV
DOMAIN=$DOMAIN
EMAIL=$EMAIL
ACCESS_KEY=$(openssl rand -hex 16)
NOMINATIM_PASSWORD=$(openssl rand -hex 16)
ENV
  chmod 600 .env
fi
ACCESS_KEY="$(grep '^ACCESS_KEY=' .env | cut -d= -f2)"
mkdir -p data/pbf data/osrm data/tiles bin

say "5/8 Downloading Bangladesh map data from Geofabrik"
curl -fL --retry 3 -o data/pbf/bangladesh-latest.osm.pbf.part "$PBF_URL"
mv data/pbf/bangladesh-latest.osm.pbf.part data/pbf/bangladesh-latest.osm.pbf

say "6/8 Building the road network for routing (OSRM)"
cp data/pbf/bangladesh-latest.osm.pbf data/osrm/bangladesh.osm.pbf
$DOCKER run --rm -v "$HERE/data/osrm:/data" "$OSRM_IMAGE" osrm-extract -p /opt/car.lua /data/bangladesh.osm.pbf
$DOCKER run --rm -v "$HERE/data/osrm:/data" "$OSRM_IMAGE" osrm-partition /data/bangladesh.osrm
$DOCKER run --rm -v "$HERE/data/osrm:/data" "$OSRM_IMAGE" osrm-customize /data/bangladesh.osrm
rm -f data/osrm/bangladesh.osm.pbf

say "7/8 Cutting the Bangladesh map out of the Protomaps world map"
if [ ! -x bin/pmtiles ]; then
  TGZ="go-pmtiles_${PMTILES_VERSION}_Linux_arm64.tar.gz"
  curl -fL --retry 3 -o "bin/$TGZ" "https://github.com/protomaps/go-pmtiles/releases/download/v${PMTILES_VERSION}/$TGZ"
  echo "$PMTILES_SHA256_ARM64  bin/$TGZ" | sha256sum -c -
  tar -xzf "bin/$TGZ" -C bin pmtiles
  rm -f "bin/$TGZ"
fi
bash "$HERE/update-tiles.sh"

say "8/8 Starting the services"
$DOCKER compose up -d
(crontab -l 2>/dev/null | grep -v trambulance-map-update; \
 echo "0 21 * * 6 cd $HERE && bash update.sh >> $HERE/update.log 2>&1 # trambulance-map-update") | crontab -

cat <<DONE

Done. HTTPS starts working within a minute or two.
Address search keeps importing in the background for a few hours.
Watch it with:   sudo docker compose logs -f nominatim
Check health:    curl https://$DOMAIN/health

Put these in app/eas.json (under build → base → env), then build the APK again:

  "EXPO_PUBLIC_OSRM_URL": "https://$DOMAIN/osrm",
  "EXPO_PUBLIC_NOMINATIM_URL": "https://$DOMAIN/nominatim",
  "EXPO_PUBLIC_PMTILES_URL": "https://$DOMAIN/tiles/bangladesh.pmtiles",
  "EXPO_PUBLIC_MAP_KEY": "$ACCESS_KEY"

DONE
