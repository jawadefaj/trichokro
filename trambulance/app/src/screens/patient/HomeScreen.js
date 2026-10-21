import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Button, Card, Icon, Badge, Gap } from '../../components/ui';
import { Logo } from '../../components/Logo';
import LangToggle from '../../components/LangToggle';
import LeafletMap from '../../components/LeafletMap';
import { C, R, T, shadow } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { getCurrentLocation, reverseGeocode } from '../../lib/geo';
import { ACTIVE_STATUSES, STATUS_LABEL } from '../../lib/data';
import { CONFIG } from '../../config';
import { useAuth } from '../../context/Auth';
import { useT } from '../../lib/i18n';

export function openRide(navigation, r) {
  if (r.status === 'searching') navigation.navigate('Finding', { rideId: r.id });
  else if (['accepted', 'arrived', 'picked_up'].includes(r.status)) navigation.navigate('Tracking', { rideId: r.id });
  else if (r.status === 'completed' && r.payment_status !== 'paid') navigation.navigate('Payment', { rideId: r.id });
  else navigation.navigate('TripDetail', { rideId: r.id });
}

export default function HomeScreen({ navigation }) {
  const { profile, user } = useAuth();
  const { t } = useT();
  const [me, setMe] = useState(null);
  const [address, setAddress] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [active, setActive] = useState(null);
  const [locError, setLocError] = useState(null);

  useEffect(() => {
    getCurrentLocation()
      .then(async (loc) => { setMe(loc); setAddress(await reverseGeocode(loc)); })
      .catch((e) => setLocError(e.message));
  }, []);

  // Live ambulances around me, refreshed every 10 s while this tab is open
  useFocusEffect(useCallback(() => {
    let alive = true;
    const load = async () => {
      if (me) {
        const { data } = await supabase.rpc('nearby_drivers', { p_lat: me.lat, p_lng: me.lng, p_radius_km: CONFIG.nearbyRadiusKm });
        if (alive && data) setDrivers(data);
      }
      const { data: rides } = await supabase.from('rides').select('id,status,payment_status,dest_address,hospital:hospitals(name)')
        .eq('patient_id', user.id).order('created_at', { ascending: false }).limit(5);
      if (alive) setActive((rides || []).find((r) => ACTIVE_STATUSES.includes(r.status) || (r.status === 'completed' && r.payment_status !== 'paid')) || null);
    };
    load();
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, [me, user.id]));

  const first = (profile && profile.full_name ? profile.full_name.split(' ')[0] : '');
  const markers = [
    ...(me ? [{ id: 'me', kind: 'me', lat: me.lat, lng: me.lng }] : []),
    ...drivers.map((d) => ({ id: d.id, kind: 'ambulance', lat: d.lat, lng: d.lng })),
  ];

  return (
    <Screen style={{ paddingTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size={30} tagline={false} />
        <LangToggle />
      </View>
      <Text style={[T.title, { marginTop: 16 }]}>{first ? `Hi ${first},` : 'Hello,'}</Text>
      <Text style={T.small}>{t('With time, beside people')}</Text>

      {active ? (
        <Card style={{ marginTop: 14, borderColor: C.green, backgroundColor: C.mintSoft }} onPress={() => openRide(navigation, active)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="ambulance" size={26} color={C.green} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={T.h3}>{active.status === 'completed' ? 'Payment due' : STATUS_LABEL[active.status]}</Text>
              <Text style={T.small} numberOfLines={1}>To {(active.hospital && active.hospital.name) || active.dest_address}</Text>
            </View>
            <Icon name="chevron-right" size={22} color={C.green} />
          </View>
        </Card>
      ) : null}

      <View style={[{ marginTop: 14, borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.line }, shadow]}>
        <LeafletMap height={190} center={me || CONFIG.defaultCenter} markers={markers} fitKey={me ? 'me' : 'dhaka'}
          onMarkerPress={(id) => { const d = drivers.find((x) => x.id === id); if (d) navigation.navigate('DriverProfile', { driver: d, from: me }); }} />
        <View style={{ position: 'absolute', left: 10, top: 10 }}>
          <Badge tone={drivers.length ? 'green' : 'gray'} icon="ambulance"
            label={drivers.length ? `${drivers.length} ${t('ambulances nearby')}` : t('No ambulances online nearby')} />
        </View>
      </View>

      <Pressable onPress={() => navigation.navigate('SOS')} accessibilityRole="button" accessibilityLabel="SOS emergency help"
        style={({ pressed }) => [{ marginTop: 16, backgroundColor: C.red, borderRadius: R.pill, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.88 : 1 }, shadow]}>
        <View style={{ backgroundColor: C.white, borderRadius: 22, padding: 8, marginRight: 14 }}>
          <Icon name="phone-alert" size={24} color={C.red} />
        </View>
        <View>
          <Text style={{ color: C.white, fontSize: 24, fontWeight: '900', letterSpacing: 1 }}>SOS</Text>
          <Text style={{ color: '#FFE3E3', fontSize: 12, marginTop: -2 }}>{t('Emergency Help')}</Text>
        </View>
      </Pressable>

      <Gap h={14} />
      <Button title={t('Book an Ambulance')} icon="ambulance" onPress={() => navigation.navigate('Emergency')}
        right={<Icon name="chevron-right" size={22} color={C.white} />} />
      <Gap h={10} />
      <Button title={t('Schedule for Later')} variant="outline" icon="calendar-clock" onPress={() => navigation.navigate('Emergency', { schedule: true })} />
      <Gap h={10} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button style={{ flex: 1 }} title={t('Find Hospitals')} variant="outline" icon="hospital-building" onPress={() => navigation.navigate('Hospitals')} />
        <Button style={{ flex: 1 }} title="Directory" variant="outline" icon="phone-classic" onPress={() => navigation.navigate('Directory')} />
      </View>

      <Pressable onPress={() => me && navigation.navigate('Emergency')} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
        <Icon name="map-marker" size={18} color={C.green} />
        <Text style={[T.small, { marginLeft: 6, flex: 1 }]} numberOfLines={1}>{locError || address || 'Finding your location…'}</Text>
      </Pressable>
    </Screen>
  );
}
