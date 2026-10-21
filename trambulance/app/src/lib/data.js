import { supabase } from './supabase';
import fallbackHospitals from '../data/hospitals.json';
import fallbackServices from '../data/ambulanceServices.json';

// Hospitals from the database; bundled directory is used if the database is unreachable or empty.
export async function loadHospitals() {
  try {
    const { data, error } = await supabase.from('hospitals').select('*').order('name');
    if (error) throw error;
    if (data && data.length) return data;
  } catch (e) { /* use bundled copy */ }
  return fallbackHospitals;
}

export async function loadAmbulanceServices() {
  try {
    const { data, error } = await supabase.from('ambulance_services').select('*').order('name');
    if (error) throw error;
    if (data && data.length) return data;
  } catch (e) { /* use bundled copy */ }
  return fallbackServices;
}

export const ACTIVE_STATUSES = ['searching', 'accepted', 'arrived', 'picked_up'];

export const STATUS_LABEL = {
  searching: 'Finding a driver',
  accepted: 'Driver on the way',
  arrived: 'Driver arrived',
  picked_up: 'On the way to hospital',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
