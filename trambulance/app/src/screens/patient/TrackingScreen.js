import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, Share, Text, View } from 'react-native';
import { Screen, Header, Button, Card, Icon, Avatar, Rating, Timeline, Badge, Place, Divider, Row } from '../../components/ui';
import LeafletMap from '../../components/LeafletMap';
import { C, R, T, money } from '../../lib/theme';
import { supabase, rpc, must, errMsg } from '../../lib/supabase';
import { useLive } from '../../lib/useLive';
import { distanceKm, getRoute, mapsLink, openDirections } from '../../lib/geo';
import { STATUS_LABEL } from '../../lib/data';
import { CONFIG } from '../../config';
import { useT } from '../../lib/i18n';

const STEP = { accepted: 1, arrived: 2, picked_up: 3, completed: 4 };

export default function TrackingScreen({ navigation, route }) {
  const { t } = useT();
  const { rideId } = route.params;
  const [eta, setEta] = useState(null);
  const lastCalc = useRef({ at: 0, from: null, status: null });

  const { data: ride } = useLive(
    () => must(supabase.from('rides')
      .select('*, driver:drivers!rides_driver_id_fkey(id, full_name, phone, photo_url, rating, rating_count, trips_count, vehicle_type, vehicle_model, vehicle_number, lat, lng, location_updated_at), hospital:hospitals(name, phone, address)')
      .eq('id', rideId).single()),
    [rideId], { subs: [{ table: 'rides', filter: `id=eq.${rideId}` }], interval: 5000 },
  );

  useEffect(() => {
    if (!ride) return;
    if (ride.status === 'completed') navigation.replace('Payment', { rideId });
    else if (ride.status === 'searching') {
      Alert.alert('Driver cancelled', 'Your driver had to cancel. We are finding you another ambulance now.');
      navigation.replace('Finding', { rideId });
    } else if (ride.status === 'cancelled') navigation.popToTop();
  }, [ride && ride.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const d = ride && ride.driver;
  const pickup = ride && { lat: ride.pickup_lat, lng: ride.pickup_lng };
  const dest = ride && { lat: ride.dest_lat, lng: ride.dest_lng };
  const driverPos = d && d.lat != null ? { lat: d.lat, lng: d.lng } : null;
  const target = ride && (ride.status === 'picked_up' ? dest : pickup);

  // Recalculate ETA when the ambulance moves ~150 m, the status changes, or every minute
  useEffect(() => {
    if (!ride || !target) return;
    const from = ride.status === 'arrived' ? pickup : driverPos;
    if (!from) return;
    const L = lastCalc.current;
    const moved = L.from ? distanceKm(L.from, from) : 1;
    if (L.status === ride.status && moved < 0.15 && Date.now() - L.at < 60000) return;
    lastCalc.current = { at: Date.now(), from, status: ride.status };
    getRoute(from, target).then((r) => setEta(r));
  }, [ride && ride.status, driverPos && driverPos.lat, driverPos && driverPos.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ride) return <ActivityIndicator style={{ flex: 1 }} color={C.green} />;

  const step = STEP[ride.status] || 0;
  const etaText = ride.status === 'arrived' ? 'Driver is here' : eta ? `${eta.durationMin} min` : '…';
  const stale = d && d.location_updated_at && Date.now() - new Date(d.location_updated_at).getTime() > 3 * 60000;

  const share = () => Share.share({
    message: `I'm in a Trambulance ambulance${d ? ` (${d.vehicle_number}, driver ${d.full_name})` : ''} going to ${(ride.hospital && ride.hospital.name) || ride.dest_address}.` +
      (driverPos ? ` Ambulance location: ${mapsLink(driverPos)}` : ''),
  });
  const sos = () => Alert.alert(t('Emergency Support'), 'Who do you want to call?', [
    { text: 'Call 999', onPress: () => Linking.openURL('tel:999') },
    { text: 'Trambulance support', onPress: () => Linking.openURL(`tel:${CONFIG.supportPhone}`) },
    ...(ride.hospital && ride.hospital.phone ? [{ text: 'Call the hospital', onPress: () => Linking.openURL(`tel:${ride.hospital.phone}`) }] : []),
    { text: 'Close', style: 'cancel' },
  ]);
  const cancel = () => Alert.alert('Cancel this trip?', 'The ambulance is already on the way. Cancel only if you no longer need it.', [
    { text: 'Keep trip', style: 'cancel' },
    { text: 'Cancel trip', style: 'destructive', onPress: async () => {
      try { await rpc('cancel_ride', { p_ride_id: rideId, p_reason: 'Patient cancelled after driver accepted' }); navigation.popToTop(); } catch (e) { Alert.alert('Could not cancel', errMsg(e)); }
    } },
  ]);

  return (
    <>
      <Header title={t('Trip Tracking')} subtitle={STATUS_LABEL[ride.status]} onBack={() => navigation.popToTop()}
        right={<Badge label={`ETA ${etaText}`} tone={ride.status === 'arrived' ? 'amber' : 'green'} icon="clock-outline" />} />
      <Screen edges={[]} footer={<Button title={t('Emergency Support')} variant="danger" icon="alarm-light" onPress={sos} />}>
        <View style={{ borderRadius: R.lg, overflow: 'hidden' }}>
          <LeafletMap height={250} center={driverPos || pickup}
            markers={[
              ...(driverPos ? [{ id: 'amb', kind: 'ambulance', ...driverPos, selected: true }] : []),
              { id: 'pickup', kind: 'pickup', ...pickup },
              { id: 'dest', kind: 'dest', ...dest },
            ]}
            route={eta ? eta.coords : null} fitKey={`${ride.status}-${eta ? 'r' : ''}`} />
        </View>
        {stale ? <Text style={[T.tiny, { color: C.amber, marginTop: 6 }]}>Ambulance location last updated a few minutes ago. Call the driver if you need an update.</Text> : null}

        {d ? (
          <Card style={{ marginTop: 12 }}>
            <Text style={[T.small, { fontWeight: '700', marginBottom: 8 }]}>{t('Driver Information')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar uri={d.photo_url} name={d.full_name} size={52} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={T.h3}>{d.full_name}</Text>
                <Rating value={d.rating} count={d.trips_count != null ? `${d.trips_count} trips` : null} />
              </View>
              <Pressable onPress={() => Linking.openURL(`tel:${d.phone}`)} accessibilityLabel="Call driver" style={iconBtn}><Icon name="phone" size={22} color={C.white} /></Pressable>
              <Pressable onPress={() => navigation.navigate('Chat', { rideId, title: d.full_name })} accessibilityLabel="Chat with driver" style={[iconBtn, { marginLeft: 8 }]}><Icon name="message-text" size={20} color={C.white} /></Pressable>
            </View>
            <Divider />
            <Row icon="ambulance" label={d.vehicle_model || 'Ambulance'} sub={d.vehicle_number} />
          </Card>
        ) : null}

        <Card style={{ marginTop: 12 }}>
          <Text style={[T.small, { fontWeight: '700' }]}>{t('Trip Status')}</Text>
          <Timeline steps={[t('Request'), t('En Route'), t('Arrived'), t('Picked Up'), t('Completed')]} current={step} />
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Place kind="pickup" title={t('Pickup')} text={ride.pickup_address} />
          <Place kind="dest" title={t('Destination')} text={(ride.hospital && ride.hospital.name) || ride.dest_address} />
          <Divider />
          <Row icon="cash" label="Agreed fare" value={money(ride.final_fare || ride.offered_fare)} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Button small style={{ flex: 1 }} variant="light" icon="google-maps" title={t('Open in Google Maps')} onPress={() => openDirections(dest, driverPos || pickup)} />
            <Button small style={{ flex: 0.7 }} variant="light" icon="share-variant" title={t('Share')} onPress={share} />
          </View>
        </Card>

        {['accepted', 'arrived'].includes(ride.status) ? (
          <Pressable onPress={cancel} style={{ alignItems: 'center', padding: 14 }}>
            <Text style={{ color: C.red, fontWeight: '600' }}>Cancel trip</Text>
          </Pressable>
        ) : null}
      </Screen>
    </>
  );
}

const iconBtn = { width: 42, height: 42, borderRadius: 21, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' };
