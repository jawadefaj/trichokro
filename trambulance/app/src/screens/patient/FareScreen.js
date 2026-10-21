import React, { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Screen, Header, Button, Card, Icon, Place, Row, Divider, Stepper, Field, Chip, Label, Avatar, Gap } from '../../components/ui';
import PayMethodPicker from '../../components/PayMethod';
import { C, R, T, money } from '../../lib/theme';
import { supabase, errMsg } from '../../lib/supabase';
import { AMBULANCE_TYPES, estimateFare, offerBounds } from '../../lib/fare';
import { fmtKm } from '../../lib/geo';
import { useAuth } from '../../context/Auth';
import { useT } from '../../lib/i18n';

const SLOTS = [
  { key: 30, label: 'In 30 min' }, { key: 60, label: 'In 1 hour' }, { key: 120, label: 'In 2 hours' },
  { key: 240, label: 'In 4 hours' }, { key: 'tm8', label: 'Tomorrow 8 AM' }, { key: 'tm14', label: 'Tomorrow 2 PM' },
];
function slotTime(k) {
  const d = new Date();
  if (typeof k === 'number') return new Date(d.getTime() + k * 60000);
  d.setDate(d.getDate() + 1);
  d.setHours(k === 'tm8' ? 8 : 14, 0, 0, 0);
  return d;
}

export default function FareScreen({ navigation, route }) {
  const { t } = useT();
  const { user, profile } = useAuth();
  const p = route.params;
  const type = AMBULANCE_TYPES[p.type];
  const fare = useMemo(() => estimateFare(p.type, p.route.distanceKm), [p.type, p.route.distanceKm]);
  const bounds = offerBounds(fare.total);
  const [offer, setOffer] = useState(fare.total);
  const [method, setMethod] = useState('cash');
  const [forOther, setForOther] = useState(false);
  const [name, setName] = useState((profile && profile.full_name) || '');
  const [phone, setPhone] = useState((profile && profile.phone) || '');
  const [notes, setNotes] = useState('');
  const [slot, setSlot] = useState(p.schedule ? 60 : null);
  const [busy, setBusy] = useState(false);
  const td = p.targetDriver;

  const submit = async () => {
    if (!name.trim() || !/^(\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''))) {
      return Alert.alert('Patient details', 'Add the patient name and a mobile number the crew can call.');
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.from('rides').insert({
        patient_id: user.id,
        emergency_type: p.emergency,
        ambulance_type: p.type,
        patient_name: name.trim(),
        patient_phone: phone.replace(/[\s-]/g, ''),
        notes: [notes.trim(), profile && profile.blood_group && !forOther ? `Blood group ${profile.blood_group}` : null,
          profile && profile.medical_notes && !forOther ? profile.medical_notes : null].filter(Boolean).join(' · ') || null,
        pickup_lat: p.pickup.lat, pickup_lng: p.pickup.lng, pickup_address: p.pickup.address,
        hospital_id: p.hospital.id, dest_lat: p.hospital.lat, dest_lng: p.hospital.lng, dest_address: p.hospital.address || p.hospital.name,
        distance_km: Number(p.route.distanceKm.toFixed(2)), duration_min: p.route.durationMin,
        suggested_fare: fare.total, offered_fare: offer, payment_method: method,
        target_driver_id: td ? td.id : null,
        scheduled_at: slot ? slotTime(slot).toISOString() : null,
      }).select('id').single();
      if (error) throw error;
      navigation.reset({ index: 1, routes: [{ name: 'Tabs' }, { name: 'Finding', params: { rideId: data.id } }] });
    } catch (e) {
      Alert.alert('Request not sent', errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header title={t('Fare Summary')} onBack={() => navigation.goBack()} />
      <Screen edges={[]} footer={<Button title={td ? `Request ${td.full_name.split(' ')[0]} for ${money(offer)}` : `${t('Confirm Ambulance Request')} · ${money(offer)}`} onPress={submit} loading={busy} />}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={type.icon} size={30} color={C.green} />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={T.h3}>{t(type.name)}</Text>
              <Text style={T.small}>{p.etaMin ? `ETA ${p.etaMin}–${p.etaMin + 6} min` : 'ETA shown when a driver accepts'}</Text>
            </View>
          </View>
          {td ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 10, backgroundColor: C.mintSoft, borderRadius: R.md }}>
              <Avatar uri={td.photo_url} name={td.full_name} size={34} />
              <Text style={[T.body, { marginLeft: 10, flex: 1 }]}>Sending to <Text style={{ fontWeight: '700' }}>{td.full_name}</Text> · {td.vehicle_number}</Text>
            </View>
          ) : null}
          <Divider />
          <Place kind="pickup" title={t('Pickup')} text={p.pickup.address} />
          <Place kind="dest" title={t('Destination')} text={p.hospital.name} />
          <Divider />
          <Row icon="map-marker-distance" label="Estimated distance" value={fmtKm(p.route.distanceKm)} />
          <Row icon="clock-outline" label="Estimated travel time" value={`${p.route.durationMin} min`} />
        </Card>

        <Label>{t('Fare Breakdown')}</Label>
        <Card>
          <Row label={t('Base Fare')} value={money(fare.base)} />
          <Row label={`${t('Distance Charge')} (${fmtKm(p.route.distanceKm)})`} value={money(fare.distance)} />
          <Row label={t('Additional Charges')} value={money(fare.fee)} />
          <View style={{ backgroundColor: C.mint, borderRadius: R.md, padding: 12, marginTop: 6, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[T.h3, { color: C.greenDark }]}>{t('Total Estimated Fare')}</Text>
              <Text style={T.tiny}>May vary based on actual distance and traffic</Text>
            </View>
            <Text style={[T.money, { color: C.greenDark }]}>{money(fare.total)}</Text>
          </View>
        </Card>

        <Label>{t('Your offer')}</Label>
        <Stepper value={offer} onChange={setOffer} step={50} min={bounds.min} max={bounds.max} format={money} />
        <Text style={[T.small, { marginTop: 8 }]}>
          {offer < fare.total ? 'A lower offer may take longer to be accepted. ' : offer > fare.total ? 'A higher offer helps drivers respond faster. ' : ''}
          Drivers can accept your price or send a counter-offer. You choose.
        </Text>

        {p.schedule ? (
          <>
            <Label>Pickup time</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {SLOTS.map((s) => <Chip key={s.key} label={s.label} active={slot === s.key} onPress={() => setSlot(s.key)} />)}
            </View>
          </>
        ) : null}

        <Label>Patient</Label>
        <Pressable onPress={() => {
          const v = !forOther; setForOther(v);
          setName(v ? '' : (profile && profile.full_name) || ''); setPhone(v ? '' : (profile && profile.phone) || '');
        }} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Icon name={forOther ? 'checkbox-marked' : 'checkbox-blank-outline'} size={22} color={C.green} />
          <Text style={[T.body, { marginLeft: 8 }]}>Booking for someone else</Text>
        </Pressable>
        <Field label="Patient name" value={name} onChangeText={setName} placeholder="Full name" icon="account-outline" />
        <Field label="Contact number" value={phone} onChangeText={setPhone} placeholder="01XXXXXXXXX" keyboardType="phone-pad" icon="phone-outline" />
        <Field label="Notes for the crew" value={notes} onChangeText={setNotes} multiline
          placeholder="Condition, floor number, landmark, wheelchair needed…" />

        <Label>{t('Payment Method')}</Label>
        <PayMethodPicker value={method} onChange={setMethod} t={t} />
        <Text style={[T.tiny, { marginTop: 8 }]}>You pay after the drop-off. You can change the method then.</Text>
        <Gap h={8} />
      </Screen>
    </>
  );
}
