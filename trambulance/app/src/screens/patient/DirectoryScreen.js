import React, { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { Screen, Header, Card, Chip, Badge, Button, Field } from '../../components/ui';
import { C, T } from '../../lib/theme';
import { loadAmbulanceServices } from '../../lib/data';

export default function DirectoryScreen({ navigation }) {
  const [list, setList] = useState([]);
  const [zone, setZone] = useState(null);
  const [q, setQ] = useState('');
  useEffect(() => { loadAmbulanceServices().then(setList); }, []);
  const zones = useMemo(() => [...new Set(list.map((a) => a.zone).filter(Boolean))], [list]);
  const shown = list.filter((a) => (!zone || a.zone === zone) &&
    (!q.trim() || [a.name, a.area, a.base, ...(a.kinds || [])].join(' ').toLowerCase().includes(q.trim().toLowerCase())));
  return (
    <>
      <Header title="Ambulance services" subtitle="Call a provider directly" onBack={() => navigation.goBack()} />
      <Screen edges={[]}>
        <View style={{ backgroundColor: C.amberSoft, borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={[T.small, { color: C.amber }]}>Listed from public sources. Call to confirm the vehicle, equipment, crew and fare before you go.</Text>
        </View>
        <Field icon="magnify" value={q} onChangeText={setQ} placeholder="Search by name, area or ICU" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <Chip label="All areas" active={!zone} onPress={() => setZone(null)} />
          {zones.map((z) => <Chip key={z} label={z} active={zone === z} onPress={() => setZone(z)} />)}
        </ScrollView>
        {shown.map((a) => (
          <Card key={a.id} style={{ marginBottom: 10 }}>
            <Text style={T.h3}>{a.name}</Text>
            <Text style={T.small}>{a.base || a.area}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
              {(a.kinds || []).map((k) => <Badge key={k} label={k} tone={/ICU|Cardiac/.test(k) ? 'red' : 'green'} style={{ marginRight: 6, marginBottom: 4 }} />)}
            </View>
            {a.description ? <Text style={[T.small, { marginTop: 4 }]}>{a.description}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Button small style={{ flex: 1 }} icon="phone" title={a.phone} onPress={() => Linking.openURL(`tel:${a.phone}`)} />
              {a.alt_phone ? <Button small style={{ flex: 1 }} variant="outline" icon="phone" title={a.alt_phone} onPress={() => Linking.openURL(`tel:${a.alt_phone}`)} /> : null}
            </View>
            <Text style={[T.tiny, { marginTop: 6 }]}>Source: {a.source_grade}</Text>
          </Card>
        ))}
      </Screen>
    </>
  );
}
