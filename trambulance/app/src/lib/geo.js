import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { CONFIG } from '../config';

const UA = { 'User-Agent': 'Trambulance/1.0 (ambulance booking app)', Accept: 'application/json' };
const PUBLIC_HOSTS = /openstreetmap\.org|project-osrm\.org/;

// Tries each server in order (your Oracle map server first, then the public one) and
// returns the first good JSON answer, or null if none respond in time.
async function fetchFirst(urls, path, ok, timeoutMs = 7000) {
  for (const base of urls) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const headers = { ...UA };
      if (CONFIG.mapKey && !PUBLIC_HOSTS.test(base)) headers['X-Trambulance-Key'] = CONFIG.mapKey;
      const res = await fetch(base + path, { headers, signal: ctrl.signal });
      if (res.ok) {
        const j = await res.json();
        if (!ok || ok(j)) return j;
      }
    } catch (e) {
      /* try the next server */
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

export function distanceKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export const fmtKm = (km) => (km == null ? '' : km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location is off for Trambulance. Turn it on in Settings so ambulances can find you.');
  }
  try {
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch (e) {
    const last = await Location.getLastKnownPositionAsync();
    if (last) return { lat: last.coords.latitude, lng: last.coords.longitude };
    throw new Error('Could not get your location. Turn on GPS and try again.');
  }
}

export async function reverseGeocode({ lat, lng }) {
  try {
    const r = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (r && r[0]) {
      const a = r[0];
      const parts = [a.name, a.street, a.district || a.subregion, a.city].filter(Boolean);
      const uniq = parts.filter((p, i) => parts.indexOf(p) === i);
      if (uniq.length) return uniq.join(', ');
    }
  } catch (e) { /* fall through */ }
  const j = await fetchFirst(CONFIG.nominatimUrls, `/reverse?format=json&zoom=17&lat=${lat}&lon=${lng}`, (x) => x && x.display_name);
  if (j) return j.display_name.split(',').slice(0, 3).join(',').trim();
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export async function searchPlaces(q, near) {
  if (!q || q.trim().length < 3) return [];
  const c = near || CONFIG.defaultCenter;
  const box = [c.lng - 0.35, c.lat + 0.35, c.lng + 0.35, c.lat - 0.35].join(',');
  const j = await fetchFirst(CONFIG.nominatimUrls,
    `/search?format=json&limit=8&countrycodes=bd&viewbox=${box}&q=${encodeURIComponent(q)}`, Array.isArray);
  return (j || []).map((p) => ({
    name: p.display_name.split(',')[0],
    address: p.display_name.split(',').slice(0, 4).join(',').trim(),
    lat: parseFloat(p.lat),
    lng: parseFloat(p.lon),
  }));
}

// Driving route via OSRM (your server, then the public one). Falls back to a straight-line estimate when offline.
export async function getRoute(from, to) {
  const straight = distanceKm(from, to) || 0;
  const fallback = {
    distanceKm: straight * 1.3,
    durationMin: Math.max(3, Math.round(((straight * 1.3) / 18) * 60)),
    coords: [[from.lat, from.lng], [to.lat, to.lng]],
    estimated: true,
  };
  const j = await fetchFirst(CONFIG.osrmUrls,
    `/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`,
    (x) => x && x.code === 'Ok' && x.routes && x.routes[0]);
  if (!j) return fallback;
  const r = j.routes[0];
  return {
    distanceKm: r.distance / 1000,
    durationMin: Math.max(2, Math.round((r.duration / 60) * CONFIG.trafficFactor)),
    coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    estimated: false,
  };
}

// Turn-by-turn navigation in Google Maps (fastest route with live traffic)
export async function navigateTo(to) {
  const nav = `google.navigation:q=${to.lat},${to.lng}&mode=d`;
  try {
    await Linking.openURL(nav);
  } catch (e) {
    await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}&travelmode=driving`);
  }
}

export function openDirections(to, from) {
  const origin = from ? `&origin=${from.lat},${from.lng}` : '';
  return Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}${origin}&travelmode=driving`);
}

export const mapsLink = (p) => `https://maps.google.com/?q=${p.lat},${p.lng}`;
