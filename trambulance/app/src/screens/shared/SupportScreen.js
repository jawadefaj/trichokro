import React, { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Header, Button, Card, Chip, Field, Label, Row, Badge, Divider, Icon } from '../../components/ui';
import { C, T, timeAgo } from '../../lib/theme';
import { supabase, errMsg } from '../../lib/supabase';
import { CONFIG } from '../../config';
import { useAuth } from '../../context/Auth';

const CATS = [
  { key: 'report_driver', label: 'Report driver' }, { key: 'safety', label: 'Safety concern' },
  { key: 'payment', label: 'Payment issue' }, { key: 'fare', label: 'Fare dispute' },
  { key: 'lost_item', label: 'Lost item' }, { key: 'report_patient', label: 'Report patient' },
  { key: 'app', label: 'App problem' }, { key: 'other', label: 'Other' },
];
const FAQ = [
  ['How is the fare calculated?', 'A base fare for the ambulance type plus a per-km charge for the route to the hospital. You can offer a different price and drivers may counter-offer.'],
  ['What if no driver accepts?', 'Raise your offer from the Finding screen, or call an ambulance service from the Directory. In a life-threatening emergency, call 999.'],
  ['How do I pay with bKash or Nagad?', 'After drop-off, choose bKash or Nagad, send the amount to the number shown, and enter the transaction ID. The driver confirms it.'],
  ['Can I book for someone else?', 'Yes. On the Fare Summary screen, tick "Booking for someone else" and enter the patient name and number.'],
];

export default function SupportScreen({ navigation, route }) {
  const p = route.params || {};
  const { user, profile } = useAuth();
  const [cat, setCat] = useState(p.category || (p.rideId ? 'report_driver' : 'other'));
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('support_tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    setTickets(data || []);
  }, [user.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const submit = async () => {
    if (msg.trim().length < 10) return Alert.alert('Report a problem', 'Describe what happened in a few words (at least 10 characters).');
    setBusy(true);
    const { error } = await supabase.from('support_tickets').insert({ user_id: user.id, ride_id: p.rideId || null, category: cat, message: msg.trim() });
    setBusy(false);
    if (error) return Alert.alert('Report not sent', errMsg(error));
    setMsg('');
    load();
    Alert.alert('Report sent', 'Our team will reply here. For safety issues we will also call you.');
  };
  const cats = CATS.filter((c) => (profile && profile.role === 'driver' ? c.key !== 'report_driver' : c.key !== 'report_patient'));

  return (
    <>
      <Header title="Help & support" onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <Screen edges={[]}>
        <Card style={{ backgroundColor: C.redSoft, borderColor: C.redSoft }}>
          <Text style={[T.h3, { color: C.redDark }]}>Emergency numbers</Text>
          {CONFIG.hotlines.map((h) => (
            <Row key={h.number} icon="phone-alert" iconColor={C.red} label={h.label} sub={h.number}
              right={<Button small variant="danger" title={`Call ${h.number}`} onPress={() => Linking.openURL(`tel:${h.number}`)} />} />
          ))}
        </Card>
        <Card style={{ marginTop: 12 }}>
          <Row icon="headset" label="Call Trambulance support" sub={CONFIG.supportPhone} onPress={() => Linking.openURL(`tel:${CONFIG.supportPhone}`)} />
          <Divider style={{ marginVertical: 0 }} />
          <Row icon="email-outline" label="Email us" sub={CONFIG.supportEmail} onPress={() => Linking.openURL(`mailto:${CONFIG.supportEmail}`)} />
        </Card>

        <Label>Report a problem{p.rideId ? ' with this trip' : ''}</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cats.map((c) => <Chip key={c.key} label={c.label} active={cat === c.key} color={['safety', 'report_driver', 'report_patient'].includes(c.key) ? C.red : C.green} onPress={() => setCat(c.key)} />)}
        </View>
        <Field value={msg} onChangeText={setMsg} multiline placeholder="What happened? Include time, place and anything that helps us." style={{ marginTop: 6 }} />
        <Button title="Send report" icon="send" onPress={submit} loading={busy} />

        {tickets.length ? <Label>Your reports</Label> : null}
        {tickets.map((tk) => (
          <Card key={tk.id} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={T.h3}>{(CATS.find((c) => c.key === tk.category) || { label: tk.category }).label}</Text>
              <Badge label={tk.status.replace('_', ' ')} tone={tk.status === 'resolved' || tk.status === 'closed' ? 'green' : 'amber'} />
            </View>
            <Text style={[T.small, { marginTop: 4 }]} numberOfLines={3}>{tk.message}</Text>
            {tk.admin_reply ? <Text style={[T.body, { marginTop: 6, color: C.greenDark }]}>Trambulance: {tk.admin_reply}</Text> : null}
            <Text style={[T.tiny, { marginTop: 4 }]}>{timeAgo(tk.created_at)}</Text>
          </Card>
        ))}

        <Label>Common questions</Label>
        {FAQ.map(([q, a], i) => (
          <Pressable key={q} onPress={() => setOpen(open === i ? null : i)} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[T.h3, { flex: 1 }]}>{q}</Text>
              <Icon name={open === i ? 'chevron-up' : 'chevron-down'} size={20} color={C.muted} />
            </View>
            {open === i ? <Text style={[T.body, { marginTop: 6 }]}>{a}</Text> : null}
          </Pressable>
        ))}
      </Screen>
    </>
  );
}
