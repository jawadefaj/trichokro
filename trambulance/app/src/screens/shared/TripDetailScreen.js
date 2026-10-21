import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Screen, Header, Button, Card, Place, Row, Divider, Badge, Avatar, Rating } from '../../components/ui';
import { MethodBadge } from '../../components/PayMethod';
import { C, T, money, fmtDateTime } from '../../lib/theme';
import { supabase, must } from '../../lib/supabase';
import { useLive } from '../../lib/useLive';
import { STATUS_LABEL } from '../../lib/data';
import { emergencyByKey } from '../../lib/emergency';
import { AMBULANCE_TYPES } from '../../lib/fare';
import { fmtKm } from '../../lib/geo';
import { useAuth } from '../../context/Auth';

export default function TripDetailScreen({ navigation, route }) {
  const { rideId } = route.params;
  const { user, profile } = useAuth();
  const isDriver = profile && profile.role === 'driver';
  const { data } = useLive(async () => {
    const ride = await must(supabase.from('rides')
      .select('*, hospital:hospitals(*), driver:drivers!rides_driver_id_fkey(full_name, photo_url, rating, vehicle_number)').eq('id', rideId).single());
    const { data: rated } = await supabase.from('ratings').select('stars').eq('ride_id', rideId).eq('rater_id', user.id).maybeSingle();
    return { ride, rated };
  }, [rideId], { interval: 0 });
  if (!data) return <ActivityIndicator style={{ flex: 1 }} color={C.green} />;
  const r = data.ride;
  const e = emergencyByKey(r.emergency_type);
  return (
    <>
      <Header title="Trip details" subtitle={fmtDateTime(r.created_at)} onBack={() => navigation.goBack()} />
      <Screen edges={[]}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Badge label={STATUS_LABEL[r.status]} tone={r.status === 'completed' ? 'green' : 'gray'} />
            <Text style={T.money}>{money(r.final_fare || r.offered_fare)}</Text>
          </View>
          <Divider />
          <Place kind="pickup" title="Pickup" text={r.pickup_address} />
          <Place kind="dest" title="Destination" text={(r.hospital && r.hospital.name) || r.dest_address} />
          <Divider />
          <Row icon={e.icon} iconColor={e.color} label="Emergency" value={e.label} />
          <Row icon="ambulance" label="Ambulance" value={AMBULANCE_TYPES[r.ambulance_type].name} />
          <Row icon="map-marker-distance" label="Distance" value={fmtKm(Number(r.distance_km))} />
          {r.cancel_reason ? <Row icon="close-circle-outline" label="Cancel reason" sub={r.cancel_reason} /> : null}
        </Card>
        <Card style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MethodBadge m={r.payment_method} />
            <Text style={[T.h3, { flex: 1, marginLeft: 10, textTransform: 'capitalize' }]}>{r.payment_method}</Text>
            <Badge label={r.payment_status} tone={r.payment_status === 'paid' ? 'green' : 'amber'} />
          </View>
        </Card>
        {!isDriver && r.driver ? (
          <Card style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar uri={r.driver.photo_url} name={r.driver.full_name} size={44} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={T.h3}>{r.driver.full_name}</Text>
                <Text style={T.small}>{r.driver.vehicle_number}</Text>
              </View>
              <Rating value={r.driver.rating} />
            </View>
          </Card>
        ) : null}
        <View style={{ marginTop: 16, gap: 10 }}>
          {r.status === 'completed' && !data.rated ? <Button title="Rate this trip" icon="star" onPress={() => navigation.navigate('Rate', { rideId, role: isDriver ? 'driver' : 'patient' })} /> : null}
          {data.rated ? <Text style={[T.small, { textAlign: 'center' }]}>You rated this trip {data.rated.stars} stars.</Text> : null}
          <Button title="Report a problem" variant="outline" icon="flag-outline" onPress={() => navigation.navigate('Support', { rideId })} />
          {!isDriver && r.hospital ? (
            <Button title="Book again" variant="light" icon="refresh" onPress={() => navigation.navigate('BookRide', { emergency: r.emergency_type, hospital: r.hospital })} />
          ) : null}
        </View>
      </Screen>
    </>
  );
}
