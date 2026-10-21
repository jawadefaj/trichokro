import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, Field, Segmented, Chip, Empty } from '../../components/ui';
import HospitalCard from '../../components/HospitalCard';
import LeafletMap from '../../components/LeafletMap';
import { C, T } from '../../lib/theme';
import { loadHospitals } from '../../lib/data';
import { distanceKm, getCurrentLocation } from '../../lib/geo';
import { emergencyByKey, recommendHospitals } from '../../lib/emergency';
import { CONFIG } from '../../config';
import { useT } from '../../lib/i18n';

const FILTERS = ['Emergency', 'Cardiology', 'Neurology', 'Critical Care', 'Trauma', 'Burn', 'Eye', 'Paediatrics', 'Kidney'];

// Booking mode (route.params.emergency set): Recommended / Nearby / All with a Select button.
// Browse mode (Hospitals tab): search and filter, tap for details.
export default function HospitalPickScreen({ navigation, route }) {
  const { t } = useT();
  const p = route.params || {};
  const booking = !!p.emergency;
  const emergency = booking ? emergencyByKey(p.emergency) : null;
  const [all, setAll] = useState(null);
  const [me, setMe] = useState(null);
  const [locTried, setLocTried] = useState(false);
  const [tab, setTab] = useState(booking ? 'rec' : 'near');
  const [view, setView] = useState('list');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState(null);
  const jumped = useRef(false);

  useEffect(() => {
    loadHospitals().then(setAll);
    getCurrentLocation().then(setMe).catch(() => setMe(null)).finally(() => setLocTried(true));
  }, []);

  const dist = (h) => (me && h.lat != null ? distanceKm(me, h) : null);
  const recommended = useMemo(() => (all && emergency ? recommendHospitals(all, emergency, dist) : []), [all, me, p.emergency]); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => {
    if (!all) return [];
    let base = tab === 'rec' ? recommended : [...all];
    if (tab === 'near') base.sort((a, b) => (dist(a) ?? 999) - (dist(b) ?? 999));
    if (tab === 'all') base.sort((a, b) => a.name.localeCompare(b.name));
    if (filter) base = base.filter((h) => (h.specialties || []).some((s) => s.toLowerCase().includes(filter.toLowerCase())));
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      base = base.filter((h) => [h.name, h.area, h.address, ...(h.specialties || [])].join(' ').toLowerCase().includes(k));
    }
    return base;
  }, [all, tab, q, filter, recommended, me]); // eslint-disable-line react-hooks/exhaustive-deps

  const select = (h) => navigation.navigate('BookRide', { ...p, hospital: h });

  // SOS quick-book: go straight to the best recommended hospital
  useEffect(() => {
    if (p.quick && !jumped.current && recommended.length && locTried) {
      jumped.current = true;
      navigation.replace('BookRide', { ...p, hospital: recommended[0] });
    }
  }, [p.quick, recommended, locTried]); // eslint-disable-line react-hooks/exhaustive-deps

  const tabs = [
    ...(booking ? [{ key: 'rec', label: t('Recommended') }] : []),
    { key: 'near', label: t('Nearby') },
    { key: 'all', label: t('All') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={booking ? [] : ['top']}>
      <Header title={booking ? `${t(emergency.label)}: choose hospital` : t('Hospitals')} onBack={booking ? () => navigation.goBack() : undefined} />
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <Field icon="magnify" value={q} onChangeText={setQ} placeholder={t('Search hospitals, area or service')} style={{ marginBottom: 10 }} />
        <Segmented options={tabs} value={tab} onChange={setTab} />
        <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
          <Segmented style={{ flex: 1 }} options={[{ key: 'list', label: t('List View') }, { key: 'map', label: t('Map View') }]} value={view} onChange={setView} />
        </View>
        {!booking ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {FILTERS.map((f) => <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(filter === f ? null : f)} />)}
          </ScrollView>
        ) : (
          <Text style={[T.small, { marginTop: 10 }]}>
            {tab === 'rec' ? `Ranked by ${emergency.specialties.slice(0, 2).join(' & ').toLowerCase()} care and distance.` : 'Sorted by distance from you.'}
          </Text>
        )}
      </View>
      {!all ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={C.green} />
      ) : view === 'map' ? (
        <LeafletMap style={{ flex: 1, marginTop: 12 }} center={me || CONFIG.defaultCenter}
          markers={[...(me ? [{ id: 'me', kind: 'me', lat: me.lat, lng: me.lng }] : []),
            ...list.filter((h) => h.lat != null).map((h) => ({ id: h.id, kind: 'hospital', lat: h.lat, lng: h.lng }))]}
          fitKey={`${tab}-${filter}-${q}`}
          onMarkerPress={(id) => { const h = list.find((x) => x.id === id); if (h) navigation.navigate('HospitalDetail', { ...p, hospital: h }); }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          {list.length === 0 ? (
            <Empty icon="hospital-building" title="No hospitals match" body="Try another search or clear the filter." />
          ) : list.map((h, i) => (
            <HospitalCard key={h.id} h={h} dist={dist(h)} t={t} best={tab === 'rec' && i === 0}
              onPress={() => navigation.navigate('HospitalDetail', { ...p, hospital: h })}
              onSelect={booking ? () => select(h) : undefined} />
          ))}
          <Text style={[T.tiny, { textAlign: 'center', marginTop: 4 }]}>
            Hospital details come from public sources. Call ahead to confirm beds and services.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
