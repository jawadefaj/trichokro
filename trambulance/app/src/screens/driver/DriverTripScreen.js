import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { Screen, Header, Button, Card, Icon, Badge, Place, Divider, Row, Timeline } from '../../components/ui';
import { MethodBadge } from '../../components/PayMethod';
import LeafletMap from '../../components/LeafletMap';
import { C, R, T, money } from '../../lib/theme';
import { supabase, rpc, must, errMsg } from '../../lib/supabase';
import { useLive } from '../../lib/useLive';
import { startSharing } from '../../lib/driverLocation';
import { distanceKm, getRoute, navigateTo } from '../../lib/geo';
import { emergencyByKey } from '../../lib/emergency';
import { STATUS_LABEL } from '../../lib/data';
import { useT } from '../../lib/i18n';

const STEP = { accepted: 1, arrived: 2, picked_up: 3, completed: 4 };
const REASONS = ['Vehicle problem', 'Patient not reachable', 'Wrong pickup location', 'Patient needs different ambulance', 'Other'];

export default function DriverTripScreen({ navigation, route }) {
  const { t } = useT();
  const { rideId } = route.params;
  const [me, setMe] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const last = useRef({ from: null, status: null, at: 0 });

  const { data: ride, refresh } = useLive(
    () => must(supabase.from('rides').select('*, hospital:hospitals(name, phone, address)').eq('id', rideId).single()),
    [rideId], { subs: [{ table: 'rides', filter: `id=eq.${rideId}` }], interval: 6000 },
  );

  // Keep sharing location for the whole trip; watch locally for the map
  useEffect(() => {
    startSharing().catch(() => {});
    let sub;
    Location.watchPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 20 },
      (l) => setMe({ lat: l.coords.latitude, lng: l.coords.longitude })).then((s) => { sub = s; }).catch(() => {});
    return () => sub && sub.remove();
  }, []);

  const pickup = ride && { lat: ride.pickup_lat, lng: ride.pickup_lng };
  const dest = ride && { lat: ride.dest_lat, lng: ride.dest_lng };
  const target = ride && (ride.status === 'picked_up' ? dest : pickup);

  useEffect(() => {
    if (!ride || !me || !target || ride.status === 'completed') return;
    const L = last.current;
    if (L.status === ride.status && L.from && distanceKm(L.from, me) < 0.15 && Date.now() - L.at < 60000) return;
    last.current = { from: me, status: ride.status, at: Date.now() };
    getRoute(me, target).then(setRouteInfo);
  }, [ride && ride.status, me && me.lat, me && me.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ride) return;
    if (ride.status === 'cancelled') {
      Alert.alert('Trip cancelled', 'The patient cancelled this trip.');
      navigation.popToTop();
    } else if (ride.status === 'searching' && ride.driver_id == null) navigation.popToTop();
  }, [ride && ride.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ride) return <ActivityIndicator style={{ flex: 1 }} color={C.green} />;
  const e = emergencyByKey(ride.emergency_type);

  const advance = async (status) => {
    setBusy(true);
    try { await rpc('advance_ride', { p_ride_id: rideId, p_status: status }); await refresh(); } catch (err) { Alert.alert('Not updated', errMsg(err)); }
    setBusy(false);
  };
  const confirmDrop = () => Alert.alert('Complete drop-off?', `Confirm the patient has arrived at ${(ride.hospital && ride.hospital.name) || 'the hospital'}.`, [
    { text: 'Not yet', style: 'cancel' }, { text: 'Complete', onPress: () => advance('completed') },
  ]);
  const confirmPaid = async () => {
    setBusy(true);
    try { await rpc('confirm_payment', { p_ride_id: rideId }); await refresh(); } catch (err) { Alert.alert('Not confirmed', errMsg(err)); }
    setBusy(false);
  };
  const cancel = () => Alert.alert('Cancel trip?', 'The request goes back to other drivers. Frequent cancellations lower your rating.',
    [...REASONS.map((reason) => ({ text: reason, onPress: async () => {
      try { await rpc('cancel_ride', { p_ride_id: rideId, p_reason: reason }); navigation.popToTop(); } catch (err) { Alert.alert('Not cancelled', errMsg(err)); }
    } })), { text: 'Keep trip', style: 'cancel' }]);

  const action = {
    accepted: { title: t('Arrived at pickup'), icon: 'map-marker-check', onPress: () => advance('arrived') },
    arrived: { title: t('Patient picked up'), icon: 'account-arrow-right', onPress: () => advance('picked_up') },
    picked_up: { title: t('Complete drop-off'), icon: 'hospital-building', onPress: confirmDrop },
  }[ride.status];

  const done = ride.status === 'completed';
  const paid = ride.payment_status === 'paid';
  if (!done && !action) return <ActivityIndicator style={{ flex: 1 }} color={C.green} />;

  return (
    <>
      <Header title={done ? 'Trip complete' : STATUS_LABEL[ride.status]} subtitle={routeInfo && !done ? `${routeInfo.durationMin} min to ${ride.status === 'picked_up' ? 'hospital' : 'pickup'}` : undefined}
        onBack={() => navigation.popToTop()} />
      <Screen edges={[]} footer={
        done ? (paid
          ? <Button title="Rate patient & finish" icon="star" onPress={() => navigation.replace('Rate', { rideId, role: 'driver' })} />
          : <Button title={`${t('Confirm payment received')} · ${money(ride.final_fare)}`} icon="cash-check" loading={busy} onPress={confirmPaid} />)
          : (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button style={{ flex: 1 }} variant="light" icon="navigation-variant" title={t('Navigate')} onPress={() => navigateTo(target)} />
              <Button style={{ flex: 1.7 }} title={action.title} icon={action.icon} loading={busy} onPress={action.onPress} />
            </View>
          )
      }>
        {!done ? (
          <View style={{ borderRadius: R.lg, overflow: 'hidden' }}>
            <LeafletMap height={240} center={me || pickup}
              markers={[...(me ? [{ id: 'me', kind: 'ambulance', ...me, selected: true }] : []), { id: 'p', kind: 'pickup', ...pickup }, { id: 'd', kind: 'dest', ...dest }]}
              route={routeInfo ? routeInfo.coords : null} fitKey={`${ride.status}-${routeInfo ? 1 : 0}`} />
          </View>
        ) : null}

        <Card style={{ marginTop: done ? 0 : 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: e.bg, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={e.icon} size={24} color={e.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={T.h3}>{ride.patient_name || 'Patient'}</Text>
              <Text style={T.small}>{t(e.label)} emergency</Text>
            </View>
            <Pressable onPress={() => Linking.openURL(`tel:${ride.patient_phone}`)} style={circle} accessibilityLabel="Call patient"><Icon name="phone" size={22} color={C.white} /></Pressable>
            <Pressable onPress={() => navigation.navigate('Chat', { rideId, title: ride.patient_name || 'Patient' })} style={[circle, { marginLeft: 8 }]} accessibilityLabel="Chat with patient">
              <Icon name="message-text" size={20} color={C.white} />
            </Pressable>
          </View>
          {ride.notes ? <Text style={[T.body, { marginTop: 10, backgroundColor: C.amberSoft, padding: 10, borderRadius: 10 }]}>{ride.notes}</Text> : null}
          <Divider />
          <Place kind="pickup" title={t('Pickup')} text={ride.pickup_address} />
          <Place kind="dest" title={t('Destination')} text={(ride.hospital && ride.hospital.name) || ride.dest_address} />
          {ride.hospital && ride.hospital.phone ? <Row icon="phone-plus" label="Call hospital ahead" sub={ride.hospital.phone} onPress={() => Linking.openURL(`tel:${ride.hospital.phone}`)} /> : null}
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Timeline steps={[t('Request'), t('En Route'), t('Arrived'), t('Picked Up'), t('Completed')]} current={STEP[ride.status] || 0} />
        </Card>

        <Card style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MethodBadge m={ride.payment_method} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[T.h3, { textTransform: 'capitalize' }]}>{ride.payment_method}</Text>
              <Text style={T.small}>{paid ? 'Paid' : ride.payment_status === 'pending' ? 'Patient says paid. Check and confirm.' : done ? 'Waiting for patient to pay' : 'Collect after drop-off'}</Text>
            </View>
            <Text style={T.money}>{money(ride.final_fare)}</Text>
          </View>
          {done && ride.payment_method !== 'cash' ? <PaymentTrx rideId={rideId} /> : null}
        </Card>

        {['accepted', 'arrived'].includes(ride.status) ? (
          <Pressable onPress={cancel} style={{ alignItems: 'center', padding: 14 }}><Text style={{ color: C.red, fontWeight: '600' }}>Cancel trip</Text></Pressable>
        ) : null}
      </Screen>
    </>
  );
}

function PaymentTrx({ rideId }) {
  const { data } = useLive(() => must(supabase.from('payments').select('trx_id,status,method').eq('ride_id', rideId).order('created_at', { ascending: false }).limit(1)), [rideId], { interval: 6000 });
  const p = data && data[0];
  if (!p || !p.trx_id) return null;
  return <Badge tone="blue" icon="pound" label={`TrxID ${p.trx_id}: check your ${p.method} SMS`} style={{ marginTop: 10 }} />;
}

const circle = { width: 42, height: 42, borderRadius: 21, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' };
