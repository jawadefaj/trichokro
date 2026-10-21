import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui';
import { C, R, T } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { getCurrentLocation, mapsLink } from '../../lib/geo';
import { useAuth } from '../../context/Auth';
import { useT } from '../../lib/i18n';

function Action({ icon, title, body, onPress, tone = 'white' }) {
  const strong = tone === 'strong';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({
      flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: R.lg, marginBottom: 12,
      backgroundColor: strong ? C.white : 'rgba(255,255,255,0.12)', opacity: pressed ? 0.85 : 1,
    })}>
      <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: strong ? C.red : C.white, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={24} color={strong ? C.white : C.red} />
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: strong ? C.ink : C.white }}>{title}</Text>
        <Text style={{ fontSize: 13, color: strong ? C.muted : '#FFDADA', marginTop: 2 }}>{body}</Text>
      </View>
      <Icon name="chevron-right" size={22} color={strong ? C.muted : C.white} />
    </Pressable>
  );
}

export default function SOSScreen({ navigation }) {
  const { profile } = useAuth();
  const { t } = useT();
  const [loc, setLoc] = useState(null);
  useEffect(() => { getCurrentLocation().then(setLoc).catch(() => {}); }, []);

  const log = (action) => supabase.from('sos_events').insert({ lat: loc && loc.lat, lng: loc && loc.lng, action }).then(() => {}, () => {});
  const message = () => `EMERGENCY: ${profile && profile.full_name ? profile.full_name : 'I'} need${profile && profile.full_name ? 's' : ''} help.` +
    (loc ? ` Location: ${mapsLink(loc)}` : '') + ' (sent from Trambulance)';

  const call999 = () => { log('call_999'); Linking.openURL('tel:999'); };
  const alertContact = () => {
    const n = profile && profile.emergency_contact_phone;
    if (!n) {
      Alert.alert('No emergency contact', 'Add one in Profile → Edit profile so SOS can text them.', [
        { text: 'Add now', onPress: () => navigation.navigate('EditProfile') }, { text: 'Not now', style: 'cancel' }]);
      return;
    }
    log('sms_contact');
    Linking.openURL(`sms:${n}?body=${encodeURIComponent(message())}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.redDark }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}><Icon name="close" size={26} color={C.white} /></Pressable>
        <Text style={{ color: C.white, fontSize: 18, fontWeight: '800', marginLeft: 14 }}>{t('Get help now')}</Text>
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ color: C.white, fontSize: 15, lineHeight: 22, marginBottom: 18 }}>
          If the person is not breathing, unconscious, or bleeding heavily, call 999 now. You can book an ambulance at the same time.
        </Text>
        <Action tone="strong" icon="phone" title={t('Call 999')} body="National Emergency Service: police, fire, ambulance" onPress={call999} />
        <Action icon="ambulance" title="Book the nearest ambulance" body="Pick the emergency, we choose the best hospital"
          onPress={() => { log('quick_book'); navigation.replace('Emergency', { quick: true }); }} />
        <Action icon="message-alert" title="Alert my emergency contact"
          body={profile && profile.emergency_contact_name ? `Text ${profile.emergency_contact_name} your location` : 'Text your live location'} onPress={alertContact} />
        <Action icon="share-variant" title="Share my location" body="Send a map link on WhatsApp, Messenger or SMS"
          onPress={() => { log('share'); Share.share({ message: message() }); }} />
        <Text style={[T.tiny, { color: '#FFCFCF', marginTop: 8 }]}>{loc ? `Your location: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}` : 'Getting your location…'}</Text>
      </View>
    </SafeAreaView>
  );
}
