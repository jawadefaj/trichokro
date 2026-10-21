import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Screen, Header, Button, Card, Icon, Field, Label, Badge, Gap } from '../../components/ui';
import PayMethodPicker, { MethodBadge } from '../../components/PayMethod';
import { C, R, T, money } from '../../lib/theme';
import { supabase, rpc, must, errMsg } from '../../lib/supabase';
import { useLive } from '../../lib/useLive';
import { CONFIG } from '../../config';
import { useT } from '../../lib/i18n';

export default function PaymentScreen({ navigation, route }) {
  const { t } = useT();
  const { rideId } = route.params;
  const { data: ride, refresh } = useLive(
    () => must(supabase.from('rides').select('*, hospital:hospitals(name)').eq('id', rideId).single()),
    [rideId], { subs: [{ table: 'rides', filter: `id=eq.${rideId}` }], interval: 6000 },
  );
  const [method, setMethod] = useState(null);
  const [trx, setTrx] = useState('');
  const [busy, setBusy] = useState(false);

  if (!ride) return <ActivityIndicator style={{ flex: 1 }} color={C.green} />;
  const m = method || ride.payment_method;
  const amount = ride.final_fare || ride.offered_fare;
  const checkout = m === 'bkash' && CONFIG.payments.bkashMode === 'checkout';
  const number = m === 'bkash' ? CONFIG.payments.bkashNumber : CONFIG.payments.nagadNumber;

  const submit = async () => {
    setBusy(true);
    try {
      if (checkout) {
        const { data, error } = await supabase.functions.invoke('bkash', { body: { action: 'create', rideId } });
        if (error) throw error;
        if (!data || !data.bkashURL) throw new Error((data && data.error) || 'bKash did not return a payment page.');
        await WebBrowser.openAuthSessionAsync(data.bkashURL, Linking.createURL('payment-result'));
        await refresh();
      } else {
        await rpc('set_payment', { p_ride_id: rideId, p_method: m, p_trx_id: m === 'cash' ? null : trx.trim() });
        await refresh();
      }
    } catch (e) {
      Alert.alert('Payment not recorded', errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const done = ride.payment_status === 'paid';
  const pending = ride.payment_status === 'pending';

  return (
    <>
      <Header title={t('Payment')} onBack={() => navigation.popToTop()} />
      <Screen edges={[]} footer={
        done || pending
          ? <Button title={t('Rate your trip')} icon="star" onPress={() => navigation.replace('Rate', { rideId, role: 'patient' })} />
          : <Button title={m === 'cash' ? `I paid ${money(amount)} in cash` : checkout ? `Pay ${money(amount)} with bKash` : 'Submit transaction ID'}
              onPress={submit} loading={busy} disabled={m !== 'cash' && !checkout && trx.trim().length < 6} />
      }>
        <Card style={{ alignItems: 'center', paddingVertical: 22 }}>
          <Icon name={done ? 'check-decagram' : 'hospital-building'} size={40} color={C.green} />
          <Text style={[T.h2, { marginTop: 8 }]}>{done ? 'Payment complete' : 'You have arrived'}</Text>
          <Text style={T.small}>{(ride.hospital && ride.hospital.name) || ride.dest_address}</Text>
          <Text style={{ fontSize: 34, fontWeight: '900', color: C.ink, marginTop: 10 }}>{money(amount)}</Text>
          {pending ? <Badge tone="amber" icon="timer-sand" label={`Waiting for the driver to confirm ${ride.payment_method}`} style={{ alignSelf: 'center', marginTop: 8 }} /> : null}
          {done ? <Badge icon="check" label={`Paid by ${ride.payment_method}`} style={{ alignSelf: 'center', marginTop: 8 }} /> : null}
        </Card>

        {!done && !pending ? (
          <>
            <Label>{t('Payment Method')}</Label>
            <PayMethodPicker value={m} onChange={setMethod} t={t} />
            <Gap />
            {m === 'cash' ? (
              <Card><Text style={T.body}>Pay {money(amount)} to the driver. They will confirm in their app.</Text></Card>
            ) : checkout ? (
              <Card><Text style={T.body}>You will be taken to bKash to enter your number, OTP and PIN. You'll come back here when done.</Text></Card>
            ) : (
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MethodBadge m={m} />
                  <Text style={[T.h3, { marginLeft: 10, flex: 1 }]}>Send {money(amount)} with {m === 'bkash' ? 'bKash' : 'Nagad'}</Text>
                </View>
                <Text style={[T.body, { marginTop: 10 }]}>1. Open your {m === 'bkash' ? 'bKash' : 'Nagad'} app and choose Send Money or Payment.</Text>
                <Pressable onPress={async () => { await Clipboard.setStringAsync(number); Alert.alert('Copied', number); }}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: R.md, padding: 12, marginVertical: 8 }}>
                  <Text style={[T.h2, { flex: 1, letterSpacing: 1 }]}>{number}</Text>
                  <Icon name="content-copy" size={20} color={C.green} />
                </Pressable>
                <Text style={[T.body, { marginBottom: 10 }]}>2. Enter the Transaction ID (TrxID) from the confirmation SMS.</Text>
                <Field value={trx} onChangeText={(v) => setTrx(v.toUpperCase())} placeholder="e.g. 9BC7D2XK1M" autoCapitalize="characters" icon="pound" style={{ marginBottom: 0 }} />
              </Card>
            )}
          </>
        ) : null}
        <Pressable onPress={() => navigation.navigate('Support', { rideId, category: 'payment' })} style={{ alignItems: 'center', padding: 16 }}>
          <Text style={{ color: C.green, fontWeight: '600' }}>Problem with payment?</Text>
        </Pressable>
      </Screen>
    </>
  );
}
