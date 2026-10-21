import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';

// Loads data, refreshes on Supabase realtime changes, and polls as a fallback.
// subs: [{ table: 'rides', filter: 'id=eq.123' }]
export function useLive(fetcher, deps, { subs = [], interval = 6000, enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef(fetcher);
  ref.current = fetcher;
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const d = await ref.current();
      if (alive.current) { setData(d); setError(null); }
    } catch (e) {
      if (alive.current) setError(e);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  const subKey = JSON.stringify(subs);
  useEffect(() => {
    alive.current = true;
    if (!enabled) return undefined;
    refresh();
    const timer = interval ? setInterval(refresh, interval) : null;
    const channels = subs.filter((s) => s && s.table).map((s, i) => {
      const name = `live-${s.table}-${s.filter || 'all'}-${i}-${Math.random().toString(36).slice(2, 8)}`;
      return supabase
        .channel(name)
        .on('postgres_changes', { event: '*', schema: 'public', table: s.table, ...(s.filter ? { filter: s.filter } : {}) }, refresh)
        .subscribe();
    });
    return () => {
      alive.current = false;
      if (timer) clearInterval(timer);
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, subKey, interval, ...deps]);

  return { data, error, loading, refresh, setData };
}
