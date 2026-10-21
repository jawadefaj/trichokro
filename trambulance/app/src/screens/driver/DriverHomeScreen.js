import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Screen, Button, Card, Icon, Badge, Stepper, Empty, Divider } from '../../components/ui';
import { Logo } from '../../components/Logo';
import LeafletMap from '../../components/LeafletMap';
import { C, R, T, money, timeAgo, fmtDateTime } from '../../lib/theme';
import { supabase, rpc, must, errMsg } from '../../lib/supabase';
import { useLive } from '../../lib/useLive';
import { startSharing, stopSharing } from '../../lib/driverLocation';
import { getCurrentLocation, fmtKm } from '../../lib/geo';
import { emergencyByKey } from '../../lib/emergency';
import { AMBULANCE_TYPES, counterBounds, etaFromKm } from '../../lib/fare';
import { CONFIG } from '../../config';
import { useAuth } from '../../context/Auth';
import { useT } from '../../lib/i18n';

function RequestCard({ r, onDone, t }) {
  const e = emergencyByKey(r.emergency_type);
  const [counter, setCounter] = useState(null);
  const [busy, setBusy] = useState(null);
  const eta = etaFromKm(r.pickup_km);
  const b = counterBounds(r.suggested_fare);

  const respond = async (amount) => {
    setBusy(amount === r.offered_fare ? 'accept' : 'counter');
    try {
      const res = await rpc('driver_respond', { p_ride_id: r.id, p_amount: amount, p_eta_min: eta });
      setCounter(null);
      onDone(res === 'accepted' ? 'accepted' : 'offered', r);
    } catch (err) {
      Alert.alert('Response not sent', errMsg(err));
      onDone('error', r);
    } finally {
      setBusy(null);
    }
  };
  const decline = async () => {
    try { await rpc('driver_decline', { p_ride_id: r.id }); } catch (err) { /* ignore */ }
    onDone('declined', r);
  };

  return (
    <Card style={{ marginBottom: 12, borderColor: r.targeted ? C.red : C.line, borderWidth: r.targeted ? 2 : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: e.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Icon name={e.icon} size={14} color={e.color} />
          <Text style={{ color: e.color, fontWeight: '800', fontSize: 12, marginLeft: 4 }}>{t(e.label)}</Text>
        </View>
        <Badge label={AMBULANCE_TYPES[r.ambulance_type].name} tone="gray" />
        {r.targeted ? <Badge label="Requested you" tone="red" icon="account-star" /> : null}
        {r.scheduled_at ? <Badge label={`Scheduled ${fmtDateTime(r.scheduled_at)}`} tone="blue" icon="calendar-clock" /> : null}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={[T.tiny, { color: C.green, fontWeight: '700' }]}>PICKUP · {r.pickup_km != null ? `${fmtKm(r.pickup_km)} away (~${eta} min)` : ''}</Text>
          <Text style={T.body} numberOfLines={2}>{r.pickup_address}</Text>
          <Text style={[T.tiny, { color: C.red, fontWeight: '700', marginTop: 6 }]}>HOSPITAL · {fmtKm(Number(r.distance_km))} trip</Text>
          <Text style={T.body} numberOfLines={1}>{r.hospital_name || r.dest_address}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
          <Text style={T.tiny}>Patient offers</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: C.ink }}>{money(r.offered_fare)}</Text>
          <Text style={T.tiny}>Suggested {money(r.suggested_fare)}</Text>
        </View>
      </View>
      {r.notes ? <Text style={[T.small, { marginTop: 8, backgroundColor: C.bg, padding: 8, borderRadius: 8 }]}>“{r.notes}”</Text> : null}
      <Text style={[T.tiny, { marginTop: 6 }]}>{r.patient_name || 'Patient'} · requested {timeAgo(r.created_at)}</Text>
      {r.my_offer ? <Badge tone="amber" icon="timer-sand" label={`Your offer ${money(r.my_offer)} sent. Waiting for patient`} style={{ marginTop: 8 }} /> : null}

      {counter !== null ? (
        <View style={{ marginTop: 10 }}>
          <Stepper value={counter} onChange={setCounter} step={50} min={b.min} max={b.max} format={money} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Button small style={{ flex: 1 }} variant="outline" title={t('Cancel')} onPress={() => setCounter(null)} />
            <Button small style={{ flex: 2 }} title={`Send offer ${money(counter)}`} loading={busy === 'counter'} onPress={() => respond(counter)} />
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <Button small style={{ flex: 0.9 }} variant="outline" title={t('Decline')} onPress={decline} />
          <Button small style={{ flex: 1.1 }} variant="light" title={t('Counter offer')} onPress={() => setCounter(Math.max(r.offered_fare + 200, r.suggested_fare))} />
          <Button small style={{ flex: 1.4 }} title={`${t('Accept')} ${money(r.offered_fare)}`} loading={busy === 'accept'} onPress={() => respond(r.offered_fare)} />
        </View>
      )}
    </Card>
  );
}

export default function DriverHomeScreen({ navigation }) {
  const { t } = useT();
  const { driver, user, refresh } = useAuth();
  const focused = useIsFocused();
  const [online, setOnline] = useState(!!driver.is_online);
  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState(driver.lat != null ? { lat: driver.lat, lng: driver.lng } : null);
  const [hidden, setHidden] = useState([]);

  useEffect(() => {
    if (online) startSharing().then((loc) => loc && setMe(loc)).catch(() => {});
    else getCurrentLocation().then(setMe).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: requests, refresh: reload } = useLive(() => rpc('open_requests', { p_radius_km: 25 }), [],
    { enabled: online, subs: [{ table: 'rides' }], interval: 6000 });

  const { data: activeRide } = useLive(async () => {
    const { data } = await supabase.from('rides').select('id,status').eq('driver_id', user.id)
      .in('status', ['accepted', 'arrived', 'picked_up']).order('accepted_at', { ascending: false }).limit(1);
    const { data: unpaid } = await supabase.from('rides').select('id').eq('driver_id', user.id).eq('status', 'completed')
      .neq('payment_status', 'paid').order('completed_at', { ascending: false }).limit(1);
    return { active: (data && data[0]) || null, unpaid: (unpaid && unpaid[0]) || null };
  }, [], { subs: [{ table: 'rides', filter: `driver_id=eq.${user.id}` }], interval: 5000 });
  const activeId = activeRide && activeRide.active ? activeRide.active.id : null;
  const unpaidId = activeRide && activeRide.unpaid ? activeRide.unpaid.id : null;

  const { data: today } = useLive(async () => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const rows = await must(supabase.from('rides').select('final_fare').eq('driver_id', user.id).eq('status', 'completed').gte('completed_at', start.toISOString()));
    return { trips: rows.length, earned: rows.reduce((s, r) => s + (r.final_fare || 0), 0) };
  }, [], { interval: 60000 });

  // Jump back into a trip in progress (e.g. after reopening the app)
  useEffect(() => {
    if (focused && activeId) navigation.navigate('DriverTrip', { rideId: activeId });
  }, [focused, activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async () => {
    setBusy(true);
    try {
      if (!online) {
        const loc = await startSharing();
        if (loc) setMe(loc);
        const { error } = await supabase.from('drivers').update({ is_online: true }).eq('id', user.id);
        if (error) throw error;
        setOnline(true);
      } else {
        const { error } = await supabase.from('drivers').update({ is_online: false }).eq('id', user.id);
        if (error) throw error;
        await stopSharing();
        setOnline(false);
      }
      refresh();
    } catch (e) {
      Alert.alert(online ? 'Could not go offline' : 'Could not go online', errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const onDone = (result, r) => {
    if (result === 'accepted') navigation.navigate('DriverTrip', { rideId: r.id });
    else if (result === 'declined') setHidden((h) => [...h, r.id]);
    reload();
  };

  const list = (requests || []).filter((r) => !hidden.includes(r.id));
  const markers = [
    ...(me ? [{ id: 'me', kind: 'ambulance', lat: me.lat, lng: me.lng, selected: true }] : []),
    ...list.map((r) => ({ id: r.id, kind: 'pickup', lat: r.pickup_lat, lng: r.pickup_lng })),
  ];

  return (
    <Screen style={{ paddingTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size={28} tagline={false} />
        <Badge label={online ? 'Online' : 'Offline'} tone={online ? 'green' : 'gray'} icon={online ? 'access-point' : 'access-point-off'} />
      </View>

      <View style={{ marginTop: 14, borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.line }}>
        <LeafletMap height={200} center={me || CONFIG.defaultCenter} markers={markers} fitKey={`${list.length}-${me ? 1 : 0}`} />
      </View>

      {unpaidId && !activeId ? (
        <Card style={{ marginTop: 12, borderColor: C.amber, backgroundColor: C.amberSoft }} onPress={() => navigation.navigate('DriverTrip', { rideId: unpaidId })}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="cash-clock" size={24} color={C.amber} />
            <Text style={[T.h3, { flex: 1, marginLeft: 10, color: C.amber }]}>Confirm payment for your last trip</Text>
            <Icon name="chevron-right" size={22} color={C.amber} />
          </View>
        </Card>
      ) : null}

      <Card style={{ marginTop: 12, backgroundColor: online ? C.mintSoft : C.white, borderColor: online ? C.mint : C.line }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={T.h2}>{online ? t('You are online') : t('You are offline')}</Text>
            <Text style={T.small}>{online ? 'Patients nearby can see and request your ambulance.' : 'Go online to receive trip requests.'}</Text>
          </View>
        </View>
        <Button style={{ marginTop: 12 }} title={online ? t('Go offline') : t('Go online')} variant={online ? 'outline' : 'primary'} icon="power" loading={busy} onPress={toggle} />
        <Divider />
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}><Text style={T.tiny}>Today</Text><Text style={T.h3}>{today ? today.trips : 0} trips</Text></View>
          <View style={{ flex: 1 }}><Text style={T.tiny}>Earned</Text><Text style={T.h3}>{money(today ? today.earned : 0)}</Text></View>
          <View style={{ flex: 1 }}><Text style={T.tiny}>Rating</Text><Text style={T.h3}>★ {Number(driver.rating).toFixed(1)}</Text></View>
        </View>
      </Card>

      <Text style={[T.h2, { marginTop: 18, marginBottom: 10 }]}>{t('New requests')}{online && list.length ? ` (${list.length})` : ''}</Text>
      {!online ? (
        <Empty icon="power-sleep" title="You're offline" body="Requests appear here when you go online." />
      ) : list.length === 0 ? (
        <Empty icon="radar" title="Waiting for requests" body="Keep the app open. New requests show up here within seconds." />
      ) : list.map((r) => <RequestCard key={r.id} r={r} onDone={onDone} t={t} />)}
    </Screen>
  );
}
