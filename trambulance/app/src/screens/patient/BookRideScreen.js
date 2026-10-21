import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, Button, Card, Field, Icon, Place, Badge, Avatar, Rating, Divider } from '../../components/ui';
import LeafletMap from '../../components/LeafletMap';
import { C, R, T, money } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { getCurrentLocation, getRoute, reverseGeocode, searchPlaces, fmtKm } from '../../lib/geo';
import { AMBULANCE_TYPES, TYPE_ORDER, estimateFare, etaFromKm } from '../../lib/fare';
import { emergencyByKey } from '../../lib/emergency';
import { CONFIG } from '../../config';
import { useT } from '../../lib/i18n';

export default function BookRideScreen({ navigation, route }) {
  const { t } = useT();
  const p = route.params;
  const emergency = emergencyByKey(p.emergency);
  const hospital = p.hospital;
  const dest = { lat: hospital.lat, lng: hospital.lng };
  const [pickup, setPickup] = useState(p.pickup || null);
  const [type, setType] = useState((p.driver && p.driver.vehicle_type) || emergency.ambulance);
  const [routeInfo, setRouteInfo] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);

  const setPickupAt = async (loc, address) => {
    setPickup({ ...loc, address: address || 'Locating address…' });
    if (!address) {
      const a = await reverseGeocode(loc);
      setPickup((cur) => (cur && cur.lat === loc.lat && cur.lng === loc.lng ? { ...cur, address: a } : cur));
    }
  };

  const useMyLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      await setPickupAt(loc);
      setEditing(false);
    } catch (e) {
      Alert.alert('Location unavailable', e.message);
      setEditing(true);
    }
  };

  useEffect(() => { if (!pickup) useMyLocation(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!pickup || hospital.lat == null) return;
    let alive = true;
    getRoute(pickup, dest).then((r) => alive && setRouteInfo(r));
    return () => { alive = false; };
  }, [pickup && pickup.lat, pickup && pickup.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // Nearby ambulances, refreshed every 8 s
  useEffect(() => {
    if (!pickup) return undefined;
    let alive = true;
    const load = async () => {
      const { data } = await supabase.rpc('nearby_drivers', { p_lat: pickup.lat, p_lng: pickup.lng, p_radius_km: CONFIG.nearbyRadiusKm });
      if (alive && data) setDrivers(data);
    };
    load();
    const id = setInterval(load, 8000);
    return () => { alive = false; clearInterval(id); };
  }, [pickup && pickup.lat, pickup && pickup.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSearch = (text) => {
    setQ(text);
    clearTimeout(searchTimer.current);
    if (text.trim().length < 3) { setResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try { setResults(await searchPlaces(text, pickup)); } catch (e) { setResults([]); }
      setSearching(false);
    }, 450);
  };

  const km = routeInfo ? routeInfo.distanceKm : null;
  const nearestOf = (tp) => drivers.filter((d) => d.vehicle_type === tp)[0];
  const typeDrivers = drivers.filter((d) => d.vehicle_type === type);

  const next = (targetDriver) => {
    if (!pickup) return Alert.alert('Set pickup', 'Choose where the ambulance should pick up the patient.');
    if (!routeInfo) return;
    const td = targetDriver || p.driver || null;
    navigation.navigate('Fare', {
      ...p, pickup, type: td ? td.vehicle_type : type, targetDriver: td,
      route: { distanceKm: routeInfo.distanceKm, durationMin: routeInfo.durationMin },
      etaMin: td ? etaFromKm(td.distance_km) : nearestOf(type) ? etaFromKm(nearestOf(type).distance_km) : null,
    });
  };

  const markers = [
    ...(pickup ? [{ id: 'pickup', kind: 'pickup', lat: pickup.lat, lng: pickup.lng }] : []),
    { id: 'dest', kind: 'dest', lat: dest.lat, lng: dest.lng },
    ...drivers.map((d) => ({ id: d.id, kind: 'ambulance', lat: d.lat, lng: d.lng, selected: d.vehicle_type === type })),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['bottom']}>
      <Header title={t('Pickup & Destination')} subtitle={`${t(emergency.label)} emergency`} onBack={() => navigation.goBack()} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 110 }}>
        <View>
          <LeafletMap height={250} center={pickup || dest} markers={markers} route={routeInfo ? routeInfo.coords : null}
            fitKey={`${pickup ? pickup.lat.toFixed(4) : ''}-${routeInfo ? 'r' : ''}`}
            onMapPress={pickMode ? (loc) => { setPickMode(false); setPickupAt(loc); } : undefined}
            onMarkerPress={(id) => {
              const d = drivers.find((x) => x.id === id);
              if (d) navigation.navigate('DriverProfile', { ...p, driver: d, pickup, route: routeInfo && { distanceKm: routeInfo.distanceKm, durationMin: routeInfo.durationMin } });
            }} />
          {pickMode ? (
            <View style={{ position: 'absolute', top: 10, left: 10, right: 10 }}>
              <Badge tone="amber" icon="gesture-tap" label={t('Tap the map to set pickup')} style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12 }} />
            </View>
          ) : null}
        </View>

        <View style={{ padding: 16 }}>
          <Card>
            <Place kind="pickup" title={t('Pickup')} text={pickup ? pickup.address : 'Finding your location…'}
              right={<Pressable onPress={() => setEditing(!editing)} hitSlop={8}><Text style={{ color: C.green, fontWeight: '700' }}>{t('Change')}</Text></Pressable>} />
            {editing ? (
              <View style={{ marginTop: 4 }}>
                <Field icon="magnify" value={q} onChangeText={onSearch} placeholder="Search a road, area or landmark" autoFocus
                  right={searching ? <ActivityIndicator size="small" color={C.green} /> : null} />
                {results.map((r) => (
                  <Pressable key={`${r.lat},${r.lng}`} onPress={() => { setPickupAt({ lat: r.lat, lng: r.lng }, r.address); setEditing(false); setQ(''); setResults([]); }}
                    style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
                    <Text style={T.h3}>{r.name}</Text>
                    <Text style={T.small} numberOfLines={1}>{r.address}</Text>
                  </Pressable>
                ))}
                <Pressable onPress={useMyLocation} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                  <Icon name="crosshairs-gps" size={20} color={C.green} />
                  <Text style={[T.body, { marginLeft: 10 }]}>{t('Use my current location')}</Text>
                </Pressable>
                <Pressable onPress={() => { setPickMode(true); setEditing(false); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                  <Icon name="map-marker-plus" size={20} color={C.green} />
                  <Text style={[T.body, { marginLeft: 10 }]}>{t('Tap the map to set pickup')}</Text>
                </Pressable>
              </View>
            ) : null}
            <Divider style={{ marginVertical: 2 }} />
            <Place kind="dest" title={t('Destination')} text={hospital.name}
              right={<Pressable onPress={() => navigation.goBack()} hitSlop={8}><Text style={{ color: C.green, fontWeight: '700' }}>{t('Change')}</Text></Pressable>} />
            {routeInfo ? (
              <Text style={[T.small, { marginTop: 4 }]}>
                {fmtKm(routeInfo.distanceKm)} · about {routeInfo.durationMin} min in traffic{routeInfo.estimated ? ' (estimated)' : ''}
              </Text>
            ) : pickup ? <ActivityIndicator style={{ alignSelf: 'flex-start', marginTop: 6 }} color={C.green} /> : null}
          </Card>

          <Text style={[T.h2, { marginTop: 18, marginBottom: 10 }]}>{t('Select Ambulance Type')}</Text>
          {TYPE_ORDER.map((key) => {
            const a = AMBULANCE_TYPES[key];
            const fare = km != null ? estimateFare(key, km).total : null;
            const nearest = nearestOf(key);
            const eta = nearest ? etaFromKm(nearest.distance_km) : null;
            const on = type === key;
            const suggested = emergency.ambulance === key;
            return (
              <Pressable key={key} onPress={() => setType(key)} accessibilityState={{ selected: on }}
                style={{ backgroundColor: C.white, borderRadius: R.lg, borderWidth: 2, borderColor: on ? C.green : C.line, padding: 14, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: on ? C.mint : C.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={a.icon} size={30} color={on ? C.green : C.muted} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text style={[T.h3, { marginRight: 6 }]}>{t(a.name)}</Text>
                      {suggested ? <Badge label="Suggested" tone="amber" /> : null}
                    </View>
                    <Text style={T.small}>{a.desc}</Text>
                    <Text style={[T.tiny, { marginTop: 4 }]}>{a.features.join(' • ')}</Text>
                  </View>
                  {on ? <Icon name="check-circle" size={22} color={C.green} /> : null}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="clock-outline" size={16} color={C.muted} />
                    <Text style={[T.small, { marginLeft: 4 }]}>{eta ? `ETA ${eta}–${eta + 6} min` : 'No nearby vehicle right now'}</Text>
                  </View>
                  <Text style={T.money}>{fare != null ? money(fare) : '…'}</Text>
                </View>
              </Pressable>
            );
          })}

          <Text style={[T.h2, { marginTop: 10, marginBottom: 4 }]}>{t('Nearby ambulances')}</Text>
          <Text style={[T.small, { marginBottom: 10 }]}>Tap one to see the driver and request them directly.</Text>
          {typeDrivers.length === 0 ? (
            <Card style={{ backgroundColor: C.amberSoft, borderColor: C.amberSoft }}>
              <Text style={[T.body, { color: C.amber }]}>
                No {AMBULANCE_TYPES[type].name.toLowerCase()} vehicles online within {CONFIG.nearbyRadiusKm} km. You can still send a request; drivers coming online will see it.
              </Text>
              <Pressable onPress={() => navigation.navigate('Directory')} style={{ marginTop: 8 }}>
                <Text style={{ color: C.green, fontWeight: '700' }}>Or call an ambulance service directly</Text>
              </Pressable>
            </Card>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {typeDrivers.map((d) => (
                <Pressable key={d.id} onPress={() => navigation.navigate('DriverProfile', { ...p, driver: d, pickup, route: routeInfo && { distanceKm: routeInfo.distanceKm, durationMin: routeInfo.durationMin } })}
                  style={{ width: 170, backgroundColor: C.white, borderRadius: R.lg, borderWidth: 1, borderColor: C.line, padding: 12, marginRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar uri={d.photo_url} name={d.full_name} size={38} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text style={T.h3} numberOfLines={1}>{d.full_name}</Text>
                      <Rating value={d.rating} />
                    </View>
                  </View>
                  <Text style={[T.small, { marginTop: 8 }]} numberOfLines={1}>{d.vehicle_number}</Text>
                  <Text style={[T.small, { color: C.green, fontWeight: '700' }]}>{fmtKm(d.distance_km)} · ~{etaFromKm(d.distance_km)} min</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.line }}>
        <Button title={p.driver ? `Continue with ${p.driver.full_name.split(' ')[0]}` : t('Continue')} onPress={() => next()} disabled={!pickup || !routeInfo} />
      </View>
    </SafeAreaView>
  );
}
