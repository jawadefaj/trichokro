import React, { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { Screen, Header, Button, Card, Badge, Icon, Row, Divider, Gap } from '../../components/ui';
import LeafletMap from '../../components/LeafletMap';
import { C, R, T } from '../../lib/theme';
import { distanceKm, fmtKm, getCurrentLocation, openDirections } from '../../lib/geo';
import { useT } from '../../lib/i18n';

export default function HospitalDetailScreen({ navigation, route }) {
  const { t } = useT();
  const p = route.params;
  const h = p.hospital;
  const [me, setMe] = useState(null);
  useEffect(() => { getCurrentLocation().then(setMe).catch(() => {}); }, []);
  const d = me && h.lat != null ? distanceKm(me, h) : null;
  const book = () => {
    if (p.emergency) navigation.navigate('BookRide', { ...p, hospital: h });
    else navigation.navigate('Emergency', { hospital: h });
  };
  return (
    <>
      <Header title={h.name} onBack={() => navigation.goBack()} />
      <Screen edges={[]} footer={<Button title={p.emergency ? t('Select') : t('Book ambulance to here')} icon="ambulance" onPress={book} />}>
        {h.lat != null ? (
          <View style={{ borderRadius: R.lg, overflow: 'hidden', marginBottom: 14 }}>
            <LeafletMap height={170} center={{ lat: h.lat, lng: h.lng }} zoom={15}
              markers={[{ id: h.id, kind: 'hospital', lat: h.lat, lng: h.lng }, ...(me ? [{ id: 'me', kind: 'me', lat: me.lat, lng: me.lng }] : [])]} />
          </View>
        ) : null}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={[T.h2, { marginRight: 8 }]}>{h.name}</Text>
            {h.verified ? <Badge label="Verified" icon="check-decagram" /> : <Badge label="Public listing" tone="gray" />}
          </View>
          <Text style={[T.small, { marginTop: 4 }]}>{[d != null ? fmtKm(d) : null, h.area, h.type].filter(Boolean).join(' · ')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
            {(h.specialties || []).map((sp) => <Badge key={sp} label={sp} tone="green" style={{ marginRight: 6, marginBottom: 6 }} />)}
          </View>
          <Divider />
          {h.phone ? <Row icon="phone" label={h.phone} sub={h.phone_label} right={<Button small title={t('Call')} variant="light" onPress={() => Linking.openURL(`tel:${h.phone}`)} />} /> : null}
          {h.lat != null ? <Row icon="directions" label={t('Get Directions')} sub={h.address} onPress={() => openDirections(h, me)} /> : null}
        </Card>
        <Gap />
        {[['ambulance', 'Emergency', h.emergency_info], ['bed', 'ICU', h.icu_info], ['information-outline', 'Best for', h.about], ['alert-circle-outline', 'Note', h.note]]
          .filter((x) => x[2]).map(([icon, label, text]) => (
            <View key={label} style={{ flexDirection: 'row', marginBottom: 12 }}>
              <Icon name={icon} size={20} color={C.green} style={{ marginTop: 1 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={T.h3}>{label}</Text>
                <Text style={T.body}>{text}</Text>
              </View>
            </View>
          ))}
        <View style={{ backgroundColor: C.amberSoft, padding: 12, borderRadius: R.md }}>
          <Text style={[T.small, { color: C.amber }]}>Availability information is provided by the hospital and may vary. Please confirm directly.</Text>
        </View>
      </Screen>
    </>
  );
}
