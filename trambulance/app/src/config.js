// Values starting with EXPO_PUBLIC_ are read from .env (local) or eas.json (cloud builds).
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://YOUR-PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR-ANON-KEY';

// Ignore unset values and leftover placeholders
const own = (v) => (v && /^https:\/\//.test(v) && !/YOUR-|example\./.test(v) ? v.replace(/\/+$/, '') : null);

export const CONFIG = {
  appName: 'Trambulance',
  // Open-source map stack. Your own Oracle Cloud map server (see server/README.md) is
  // tried first; the public OpenStreetMap servers are the automatic backup.
  osrmUrls: [own(process.env.EXPO_PUBLIC_OSRM_URL), 'https://router.project-osrm.org'].filter(Boolean),
  nominatimUrls: [own(process.env.EXPO_PUBLIC_NOMINATIM_URL), 'https://nominatim.openstreetmap.org'].filter(Boolean),
  pmtilesUrl: own(process.env.EXPO_PUBLIC_PMTILES_URL),
  mapKey: process.env.EXPO_PUBLIC_MAP_KEY || '',
  tileUrl: process.env.EXPO_PUBLIC_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: '&copy; OpenStreetMap contributors',
  // OSRM has no live traffic; Dhaka travel times are scaled by this factor.
  trafficFactor: 1.6,
  defaultCenter: { lat: 23.7808, lng: 90.4093 }, // Dhaka
  nearbyRadiusKm: 20,
  supportPhone: process.env.EXPO_PUBLIC_SUPPORT_PHONE || '09600000000',
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@trambulance.app',
  payments: {
    // 'manual' = patient sends money and enters the TrxID; driver confirms.
    // 'checkout' = bKash Tokenized Checkout through the Supabase edge function.
    bkashMode: process.env.EXPO_PUBLIC_BKASH_MODE || 'manual',
    bkashNumber: process.env.EXPO_PUBLIC_BKASH_NUMBER || '01XXXXXXXXX',
    nagadNumber: process.env.EXPO_PUBLIC_NAGAD_NUMBER || '01XXXXXXXXX',
  },
  hotlines: [
    { label: 'National Emergency Service', number: '999' },
    { label: 'Health helpline (Shastho Batayon)', number: '16263' },
  ],
};
