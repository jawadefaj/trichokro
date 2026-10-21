// Shares the driver's position while they are online or on a trip.
// Uses an Android foreground service (persistent notification) so tracking keeps
// working while the driver navigates in Google Maps.
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { supabase } from './supabase';

export const LOCATION_TASK = 'trambulance-driver-location';
let lastSent = 0;
let fallbackSub = null;

async function push(coords, force) {
  const now = Date.now();
  if (!force && now - lastSent < 8000) return;
  const { data } = await supabase.auth.getSession();
  const uid = data && data.session && data.session.user.id;
  if (!uid) return;
  lastSent = now;
  await supabase
    .from('drivers')
    .update({
      lat: coords.latitude,
      lng: coords.longitude,
      heading: coords.heading != null && coords.heading >= 0 ? coords.heading : null,
      location_updated_at: new Date().toISOString(),
    })
    .eq('id', uid);
}

if (!TaskManager.isTaskDefined(LOCATION_TASK)) {
  TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
    if (error || !data || !data.locations || !data.locations.length) return;
    try {
      await push(data.locations[data.locations.length - 1].coords);
    } catch (e) { /* retry on next fix */ }
  });
}

export async function startSharing() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Allow location access so patients can see your ambulance.');
  let started = false;
  try {
    started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
  } catch (e) { started = false; }
  if (!started && !fallbackSub) {
    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 25,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Trambulance: you are on duty',
          notificationBody: 'Sharing your location with patients and dispatch',
          notificationColor: '#12753E',
        },
      });
    } catch (e) {
      // e.g. Expo Go: fall back to foreground-only updates
      fallbackSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 25 },
        (loc) => push(loc.coords).catch(() => {}),
      );
    }
  }
  try {
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    await push(pos.coords, true);
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch (e) {
    return null;
  }
}

export async function stopSharing() {
  try {
    if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    }
  } catch (e) { /* not running */ }
  if (fallbackSub) {
    fallbackSub.remove();
    fallbackSub = null;
  }
}
