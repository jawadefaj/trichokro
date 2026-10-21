import React from 'react';
import { Linking, Text, View } from 'react-native';
import { Screen, Header, Button, Card, Avatar, Rating, Badge, Row, Divider, Gap } from '../../components/ui';
import { C, R, T } from '../../lib/theme';
import { AMBULANCE_TYPES, etaFromKm } from '../../lib/fare';
import { fmtKm } from '../../lib/geo';
import { useT } from '../../lib/i18n';

export default function DriverProfileScreen({ navigation, route }) {
  const { t } = useT();
  const p = route.params;
  const d = p.driver;
  const type = AMBULANCE_TYPES[d.vehicle_type] || AMBULANCE_TYPES.basic;
  const inBooking = !!(p.hospital && p.pickup);
  const eta = etaFromKm(d.distance_km);

  const request = () => {
    if (inBooking && p.route) {
      navigation.navigate('Fare', { ...p, type: d.vehicle_type, targetDriver: d, etaMin: eta });
    } else if (p.hospital) {
      navigation.navigate('BookRide', { ...p, driver: d });
    } else {
      navigation.navigate('Emergency', { driver: d });
    }
  };

  return (
    <>
      <Header title="Ambulance" onBack={() => navigation.goBack()} />
      <Screen edges={[]} footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {d.phone ? <Button style={{ flex: 1 }} variant="outline" icon="phone" title={t('Call driver')} onPress={() => Linking.openURL(`tel:${d.phone}`)} /> : null}
          {!p.viewOnly ? <Button style={{ flex: 1.4 }} icon="ambulance" title={t('Request this ambulance')} onPress={request} /> : null}
        </View>
      }>
        <Card style={{ alignItems: 'center', paddingVertical: 22 }}>
          <Avatar uri={d.photo_url} name={d.full_name} size={88} />
          <Text style={[T.h2, { marginTop: 10 }]}>{d.full_name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Rating value={d.rating} count={d.rating_count} />
            <Text style={[T.small, { marginLeft: 8 }]}>{d.trips_count || 0} trips</Text>
          </View>
          {d.organization ? <Badge label={d.organization} tone="blue" style={{ marginTop: 8, alignSelf: 'center' }} /> : null}
          {d.distance_km != null ? (
            <Text style={{ color: C.green, fontWeight: '800', marginTop: 10, fontSize: 16 }}>{fmtKm(d.distance_km)} away · about {eta} min</Text>
          ) : null}
        </Card>
        <Gap />
        <Card>
          <Row icon={type.icon} label={t(type.name)} sub={type.desc} />
          <Divider style={{ marginVertical: 0 }} />
          <Row icon="card-text-outline" label={d.vehicle_number} sub={d.vehicle_model || 'Vehicle number'} />
        </Card>
        {d.equipment && d.equipment.length ? (
          <>
            <Text style={[T.h3, { marginTop: 18, marginBottom: 8 }]}>On board</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {d.equipment.map((e) => <Badge key={e} label={e} style={{ marginRight: 6, marginBottom: 6 }} />)}
            </View>
          </>
        ) : null}
        <View style={{ backgroundColor: C.mintSoft, borderRadius: R.md, padding: 12, marginTop: 16 }}>
          <Text style={T.small}>
            Requesting sends your trip to {d.full_name.split(' ')[0]} first. If they decline, it goes to other ambulances nearby automatically.
          </Text>
        </View>
      </Screen>
    </>
  );
}
