import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

export const isConfigured = !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR-ANON');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

export function errMsg(e) {
  if (!e) return 'Something went wrong. Check your connection and try again.';
  if (typeof e === 'string') return e;
  const m = e.message || e.error_description || String(e);
  if (/Network request failed|Failed to fetch/i.test(m)) return 'No internet connection. Check your data or Wi-Fi and try again.';
  return m;
}

// Throws on error so callers can use try/catch
export async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

export async function must(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
