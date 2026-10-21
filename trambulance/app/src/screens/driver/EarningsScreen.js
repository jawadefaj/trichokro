import React, { useCallback, useState } from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Header, Card, Empty } from '../../components/ui';
import { TripCard } from '../patient/TripsScreen';
import { C, T, money } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/Auth';

export default function EarningsScreen({ navigation }) {
  const { user } = useAuth();
  const [rides, setRides] = useState(null);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('rides')
      .select('id, status, payment_status, payment_method, emergency_type, ambulance_type, created_at, completed_at, final_fare, offered_fare, dest_address, patient_name, hospital:hospitals(name)')
      .eq('driver_id', user.id).in('status', ['completed', 'cancelled']).order('created_at', { ascending: false }).limit(100);
    setRides(data || []);
    setLoading(false);
  }, [user.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const done = (rides || []).filter((r) => r.status === 'completed');
  const since = (days) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - days); return d; };
  const sum = (from) => done.filter((r) => new Date(r.completed_at) >= from).reduce((s, r) => s + (r.final_fare || 0), 0);
  const unpaid = done.filter((r) => r.payment_status !== 'paid').reduce((s, r) => s + (r.final_fare || 0), 0);
  const Stat = ({ label, value }) => (
    <View style={{ flex: 1 }}><Text style={T.tiny}>{label}</Text><Text style={[T.h2, { marginTop: 2 }]}>{value}</Text></View>
  );
  return (
    <>
      <Header title="Earnings" />
      <Screen edges={[]} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={[C.green]} />}>
        <Card style={{ backgroundColor: C.green, borderColor: C.green }}>
          <Text style={{ color: '#CFEAD9', fontSize: 13 }}>This week</Text>
          <Text style={{ color: C.white, fontSize: 32, fontWeight: '900' }}>{money(sum(since(6)))}</Text>
        </Card>
        <Card style={{ marginTop: 12, flexDirection: 'row' }}>
          <Stat label="Today" value={money(sum(since(0)))} />
          <Stat label="30 days" value={money(sum(since(29)))} />
          <Stat label="Unconfirmed" value={money(unpaid)} />
        </Card>
        <Text style={[T.h2, { marginTop: 18, marginBottom: 10 }]}>Trips</Text>
        {rides && rides.length === 0 ? <Empty icon="cash-multiple" title="No trips yet" body="Completed trips and payments appear here." /> : null}
        {(rides || []).map((r) => <TripCard key={r.id} r={r} showPatient onPress={() => navigation.navigate(r.status === 'completed' && r.payment_status !== 'paid' ? 'DriverTrip' : 'TripDetail', { rideId: r.id })} />)}
      </Screen>
    </>
  );
}
