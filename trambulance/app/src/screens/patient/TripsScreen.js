import React, { useCallback, useState } from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Header, Card, Segmented, Badge, Icon, Empty, Button } from '../../components/ui';
import { C, T, money, fmtDateTime } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { ACTIVE_STATUSES, STATUS_LABEL } from '../../lib/data';
import { emergencyByKey } from '../../lib/emergency';
import { AMBULANCE_TYPES } from '../../lib/fare';
import { useAuth } from '../../context/Auth';
import { useT } from '../../lib/i18n';
import { openRide } from './HomeScreen';

const isCurrent = (r) => ACTIVE_STATUSES.includes(r.status) || (r.status === 'completed' && r.payment_status !== 'paid');

export function TripCard({ r, onPress, showPatient }) {
  const e = emergencyByKey(r.emergency_type);
  const tone = r.status === 'completed' ? 'green' : r.status === 'cancelled' ? 'gray' : 'amber';
  return (
    <Card style={{ marginBottom: 10 }} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: e.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={e.icon} size={22} color={e.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={T.h3} numberOfLines={1}>{(r.hospital && r.hospital.name) || r.dest_address}</Text>
          <Text style={T.small}>{fmtDateTime(r.created_at)}</Text>
          <Text style={T.small} numberOfLines={1}>
            {AMBULANCE_TYPES[r.ambulance_type] ? AMBULANCE_TYPES[r.ambulance_type].name : ''}
            {showPatient && r.patient_name ? ` · ${r.patient_name}` : r.driver ? ` · ${r.driver.full_name}` : ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[T.h3, { marginBottom: 4 }]}>{money(r.final_fare || r.offered_fare)}</Text>
          <Badge label={r.status === 'completed' && r.payment_status !== 'paid' ? 'Payment due' : STATUS_LABEL[r.status]} tone={tone} />
        </View>
      </View>
    </Card>
  );
}

export default function TripsScreen({ navigation }) {
  const { t } = useT();
  const { user } = useAuth();
  const [tab, setTab] = useState('current');
  const [rides, setRides] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('rides')
      .select('id, status, payment_status, emergency_type, ambulance_type, created_at, final_fare, offered_fare, dest_address, hospital:hospitals(name), driver:drivers!rides_driver_id_fkey(full_name)')
      .eq('patient_id', user.id).order('created_at', { ascending: false }).limit(60);
    setRides(data || []);
    setLoading(false);
  }, [user.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const list = (rides || []).filter((r) => (tab === 'current' ? isCurrent(r) : !isCurrent(r)));
  return (
    <>
      <Header title={t('My Trips')} />
      <Screen edges={[]} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={[C.green]} />}>
        <Segmented options={[{ key: 'current', label: t('Current Trip') }, { key: 'past', label: t('Past Trips') }]} value={tab} onChange={setTab} style={{ marginBottom: 14 }} />
        {rides && list.length === 0 ? (
          <Empty icon="ambulance" title={tab === 'current' ? 'No trip in progress' : 'No past trips yet'}
            body={tab === 'current' ? 'When you book an ambulance, you can follow it here.' : 'Completed and cancelled trips appear here.'}
            action={tab === 'current' ? <Button title={t('Book an Ambulance')} onPress={() => navigation.navigate('Emergency')} /> : null} />
        ) : list.map((r) => <TripCard key={r.id} r={r} onPress={() => openRide(navigation, r)} />)}
      </Screen>
    </>
  );
}
