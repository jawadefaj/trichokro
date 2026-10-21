import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const AuthCtx = createContext(null);
export const redirectUrl = () => Linking.createURL('auth-callback');

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [driver, setDriver] = useState(null);
  const [ready, setReady] = useState(false);
  const sessionRef = useRef(null);

  const load = useCallback(async (s) => {
    if (!s) { setProfile(null); setDriver(null); return; }
    const uid = s.user.id;
    let { data: p } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (!p) {
      // Profile trigger missing or delayed: create it from the app
      const meta = s.user.user_metadata || {};
      const { data: created } = await supabase
        .from('profiles')
        .upsert({ id: uid, email: s.user.email, full_name: meta.full_name || meta.name || null, avatar_url: meta.avatar_url || meta.picture || null })
        .select()
        .maybeSingle();
      p = created;
    }
    setProfile(p || null);
    const { data: d } = await supabase.from('drivers').select('*').eq('id', uid).maybeSingle();
    setDriver(d || null);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      sessionRef.current = data.session;
      setSession(data.session);
      try { await load(data.session); } catch (e) { /* offline */ }
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      sessionRef.current = s;
      setSession(s);
      // Defer DB calls outside the auth callback
      setTimeout(() => load(s).catch(() => {}), 0);
    });
    // Email confirmation / password reset links open the app with ?code=
    const handleUrl = async ({ url }) => {
      const { queryParams } = Linking.parse(url);
      if (queryParams && queryParams.code) {
        await supabase.auth.exchangeCodeForSession(String(queryParams.code)).catch(() => {});
      }
    };
    const linkSub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then((url) => url && handleUrl({ url }));
    return () => { mounted = false; sub.subscription.unsubscribe(); linkSub.remove(); };
  }, [load]);

  const refresh = useCallback(() => load(sessionRef.current), [load]);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = redirectUrl();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (res.type !== 'success') return false;
    const { queryParams } = Linking.parse(res.url);
    if (queryParams.error_description) throw new Error(String(queryParams.error_description));
    if (queryParams.code) {
      const { error: e2 } = await supabase.auth.exchangeCodeForSession(String(queryParams.code));
      if (e2) throw e2;
    }
    return true;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthCtx.Provider value={{ session, user: session ? session.user : null, profile, driver, ready, refresh, signInWithGoogle, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
