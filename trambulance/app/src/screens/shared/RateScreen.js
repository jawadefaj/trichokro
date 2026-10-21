import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Screen, Header, Button, Chip, Field, Stars, Gap } from '../../components/ui';
import { C, T } from '../../lib/theme';
import { rpc, errMsg } from '../../lib/supabase';
import { useT } from '../../lib/i18n';

const PATIENT_TAGS = ['Arrived quickly', 'Careful driving', 'Clean ambulance', 'Helpful crew', 'Good equipment'];
const DRIVER_TAGS = ['Ready at pickup', 'Clear directions', 'Polite', 'Paid promptly'];

export default function RateScreen({ navigation, route }) {
  const { t } = useT();
  const { rideId, role } = route.params;
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const list = role === 'driver' ? DRIVER_TAGS : PATIENT_TAGS;
  const finish = () => navigation.popToTop();
  const submit = async () => {
    setBusy(true);
    try { await rpc('rate_ride', { p_ride_id: rideId, p_stars: stars, p_tags: tags, p_comment: comment.trim() || null }); finish(); } catch (e) { Alert.alert('Rating not saved', errMsg(e)); }
    setBusy(false);
  };
  return (
    <>
      <Header title={role === 'driver' ? 'Rate the patient' : t('Rate your trip')} />
      <Screen edges={[]} footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button style={{ flex: 1 }} variant="outline" title={t('Skip')} onPress={finish} />
          <Button style={{ flex: 2 }} title={t('Submit')} onPress={submit} loading={busy} />
        </View>
      }>
        <Text style={[T.title, { textAlign: 'center', marginTop: 12 }]}>{role === 'driver' ? 'How was the pickup?' : 'How was your ambulance?'}</Text>
        <View style={{ alignItems: 'center', marginVertical: 20 }}><Stars value={stars} size={42} onChange={setStars} /></View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          {list.map((tg) => <Chip key={tg} label={tg} active={tags.includes(tg)} onPress={() => setTags(tags.includes(tg) ? tags.filter((x) => x !== tg) : [...tags, tg])} />)}
        </View>
        <Gap />
        <Field label="Comments (optional)" value={comment} onChangeText={setComment} multiline placeholder="Tell us what went well or what to improve" />
        {role !== 'driver' ? (
          <Pressable onPress={() => navigation.navigate('Support', { rideId, category: 'report_driver' })} style={{ alignItems: 'center', padding: 8 }}>
            <Text style={{ color: C.red, fontWeight: '600' }}>{t('Report a problem')} with this trip</Text>
          </Pressable>
        ) : null}
      </Screen>
    </>
  );
}
