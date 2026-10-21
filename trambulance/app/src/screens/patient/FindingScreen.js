import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { Screen, Header, Button, Card, Icon, Avatar, Rating, Stepper, Label, Divider } from '../../components/ui';
import LeafletMap from '../../components/LeafletMap';
import { C, R, T, money } from '../../lib/theme';
import { supabase, rpc, must, errMsg } from '../../lib/supabase';
import { useLive } from '../../lib/useLive';
import { offerBounds, etaFromKm } from '../../lib/fare';
import { distanceKm, fmtKm } from '../../lib/geo';
import { CONFIG } from '../../config';
import { useT } from '../../lib/i18n';

function Step({ done, active, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
      {done ? <Icon name="check-circle" size={22} color={C.green} />
        : active ? <ActivityIndicator size="small" color={C.green} style={{ width: 22 }} />
          : <Icon name="circle-outline" size={22} color={C.line} />}
      <Text style={[T.body, { marginLeft: 10, color: done || active ? C.ink : C.muted }]}>{label}</Text>
    </View>
  );
}

export default function FindingScreen({ navigation, route }) {
  const { t } = useT();
  const { rideId } = route.params;
  const [nearby, setNearby] = useState([]);
  const [offer, setOffer] = useState(null);
  const [busy, setBusy] = useState(null);
  const [seconds, setSeconds] = useState(0);

  const { data } = useLive(async () => {
    const ride = await must(supabase.from('rides').select('*, hospital:hospitals(name), target:drivers!rides_target_driver_id_fkey(full_name)').eq('id', rideId).single());
    const offers = await must(supabase.from('ride_offers')
      .select('id, amount, eta_min, created_at, driver:drivers(id, full_name, photo_url, rating, rating_count, trips_count, vehicle_type, vehicle_number, vehicle_model, lat, lng)')
      .eq('ride_id', rideId).eq('status', 'pending').order('amount'));
    return { ride, offers };
  }, [rideId], { subs: [{ table: 'rides', filter: `id=eq.${rideId}` }, { table: 'ride_offers', filter: `ride_id=eq.${rideId}` }], interval: 5000 });

  const ride = data && data.ride;
  const offers = (data && data.offers) || [];

  useEffect(() => { if (ride && offer === null) setOffer(ride.offered_fare); }, [ride, offer]);
  useEffect(() => { const id = setInterval(() => setSeconds((s) => s + 1), 1000); return () => clearInterval(id); }, []);

  useEffect(() => {
    if (!ride) return;
    if (['accepted', 'arrived', 'picked_up'].includes(ride.status)) navigation.replace('Tracking', { rideId });
    else if (ride.status === 'cancelled') navigation.popToTop();
  }, [ride && ride.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ride) return undefined;
    let alive = true;
    const load = () => supabase.rpc('nearby_drivers', { p_lat: ride.pickup_lat, p_lng: ride.pickup_lng, p_radius_km: CONFIG.nearbyRadiusKm, p_type: null })
      .then(({ data: d }) => alive && d && setNearby(d));
    load();
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, [ride && ride.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ride) return <ActivityIndicator style={{ flex: 1 }} color={C.green} />;

  const pickup = { lat: ride.pickup_lat, lng: ride.pickup_lng };
  const bounds = offerBounds(ride.suggested_fare);
  const accept = async (o) => {
    setBusy(o.id);
    try { await rpc('accept_offer', { p_offer_id: o.id }); navigation.replace('Tracking', { rideId }); } catch (e) { Alert.alert('Could not accept', errMsg(e)); }
    setBusy(null);
  };
  const updateOffer = async () => {
    setBusy('offer');
    try { await rpc('update_offer_fare', { p_ride_id: rideId, p_amount: offer }); Alert.alert('Offer updated', `Drivers now see ${money(offer)}.`); } catch (e) { Alert.alert('Offer not updated', errMsg(e)); }
    setBusy(null);
  };
  const cancel = () => Alert.alert('Cancel request?', 'Drivers will stop seeing this request.', [
    { text: 'Keep waiting', style: 'cancel' },
    { text: 'Cancel request', style: 'destructive', onPress: async () => {
      try { await rpc('cancel_ride', { p_ride_id: rideId, p_reason: 'Patient cancelled while searching' }); navigation.popToTop(); } catch (e) { Alert.alert('Could not cancel', errMsg(e)); }
    } },
  ]);

  const scheduled = ride.scheduled_at && new Date(ride.scheduled_at) > new Date(Date.now() + 15 * 60000);

  return (
    <>
      <Header title={t('Finding a Driver')} onBack={() => navigation.popToTop()} />
      <Screen edges={[]} footer={<Button title={t('Cancel Request')} variant="outline" onPress={cancel} />}>
        <View style={{ borderRadius: R.lg, overflow: 'hidden' }}>
          <LeafletMap height={210} center={pickup} zoom={14} fitKey="once"
            circle={{ lat: pickup.lat, lng: pickup.lng, radius: 1500 + (seconds % 6) * 300 }}
            markers={[{ id: 'pickup', kind: 'pickup', ...pickup }, ...nearby.map((d) => ({ id: d.id, kind: 'ambulance', lat: d.lat, lng: d.lng }))]} />
          <View style={{ position: 'absolute', top: 10, left: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: R.md, padding: 10 }}>
            <Text style={[T.h3, { textAlign: 'center' }]}>
              {ride.target ? `Waiting for ${ride.target.full_name} to respond…` : scheduled ? 'Scheduled request sent to drivers' : "We're finding the best ambulance near you…"}
            </Text>
          </View>
        </View>

        <Card style={{ marginTop: 12 }}>
          <Step done label={t('Searching nearby ambulances')} />
          <Step done={nearby.length > 0 || offers.length > 0} active={!nearby.length && !offers.length} label={nearby.length ? `${t('Checking availability')}: ${nearby.length} nearby` : t('Checking availability')} />
          <Step active={nearby.length > 0 || offers.length > 0} label={t('Matching with a driver')} />
        </Card>

        {offers.length ? <Label>Driver offers ({offers.length})</Label> : null}
        {offers.map((o) => {
          const dk = o.driver && o.driver.lat != null ? distanceKm(pickup, o.driver) : null;
          return (
            <Card key={o.id} style={{ marginBottom: 10, borderColor: C.green }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar uri={o.driver.photo_url} name={o.driver.full_name} size={46} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={T.h3}>{o.driver.full_name}</Text>
                  <Rating value={o.driver.rating} count={o.driver.rating_count} />
                  <Text style={T.small} numberOfLines={1}>{o.driver.vehicle_number}{dk != null ? ` · ${fmtKm(dk)}` : ''}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={T.money}>{money(o.amount)}</Text>
                  <Text style={T.small}>~{o.eta_min || etaFromKm(dk) || '?'} min away</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <Button small style={{ flex: 1 }} variant="outline" icon="account-details" title="Profile"
                  onPress={() => navigation.navigate('DriverProfile', { driver: { ...o.driver, distance_km: dk }, viewOnly: true })} />
                <Button small style={{ flex: 1.6 }} title={`${t('Accept')} ${money(o.amount)}`} loading={busy === o.id} onPress={() => accept(o)} />
              </View>
            </Card>
          );
        })}

        <Label>{t('Your offer')}</Label>
        <Card>
          <Text style={[T.small, { marginBottom: 8 }]}>Suggested fare {money(ride.suggested_fare)}. Drivers see your current offer of {money(ride.offered_fare)}.</Text>
          {offer !== null ? <Stepper value={offer} onChange={setOffer} step={50} min={bounds.min} max={bounds.max} format={money} /> : null}
          <Button style={{ marginTop: 10 }} variant="light" title={t('Update offer')} disabled={offer === ride.offered_fare} loading={busy === 'offer'} onPress={updateOffer} />
        </Card>

        {seconds > 90 && !offers.length ? (
          <Card style={{ marginTop: 12, backgroundColor: C.amberSoft, borderColor: C.amberSoft }}>
            <Text style={[T.h3, { color: C.amber }]}>No response yet?</Text>
            <Text style={[T.small, { marginTop: 4 }]}>Raise your offer, or call an ambulance service directly while you wait.</Text>
            <Divider />
            <Pressable onPress={() => navigation.navigate('Directory')}><Text style={{ color: C.green, fontWeight: '700' }}>Open ambulance directory</Text></Pressable>
          </Card>
        ) : null}
      </Screen>
    </>
  );
}
