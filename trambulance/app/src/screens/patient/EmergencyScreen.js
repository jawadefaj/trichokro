import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen, Header, Icon } from '../../components/ui';
import { C, R, T } from '../../lib/theme';
import { EMERGENCIES } from '../../lib/emergency';
import { useT } from '../../lib/i18n';

export default function EmergencyScreen({ navigation, route }) {
  const { t } = useT();
  const p = route.params || {};
  const choose = (e) => {
    const next = { ...p, emergency: e.key };
    if (p.hospital) navigation.navigate('BookRide', next);
    else navigation.navigate('HospitalPick', next);
  };
  return (
    <>
      <Header title={p.schedule ? t('Schedule for Later') : t('Book an Ambulance')} onBack={() => navigation.goBack()} />
      <Screen edges={[]}>
        <Text style={T.title}>{t('What is your emergency?')}</Text>
        <Text style={[T.small, { marginTop: 4, marginBottom: 16 }]}>
          {t('Choose the closest match. We use it to suggest the right hospital and ambulance.')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {EMERGENCIES.map((e) => (
            <Pressable key={e.key} onPress={() => choose(e)} accessibilityRole="button" accessibilityLabel={e.label}
              style={({ pressed }) => ({
                width: e.key === 'other' ? '100%' : '48.5%', marginBottom: 12, padding: 14, borderRadius: R.lg,
                backgroundColor: C.white, borderWidth: 1, borderColor: C.line, opacity: pressed ? 0.85 : 1,
                flexDirection: e.key === 'other' ? 'row' : 'column', alignItems: e.key === 'other' ? 'center' : 'flex-start',
              })}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: e.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={e.icon} size={28} color={e.color} />
              </View>
              <View style={{ marginTop: e.key === 'other' ? 0 : 10, marginLeft: e.key === 'other' ? 12 : 0, flex: e.key === 'other' ? 1 : undefined }}>
                <Text style={T.h3}>{t(e.label)}</Text>
                <Text style={[T.small, { marginTop: 2 }]} numberOfLines={2}>{e.hint}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        {p.driver ? (
          <Text style={[T.small, { textAlign: 'center' }]}>You chose {p.driver.full_name}'s ambulance. We'll send them the request.</Text>
        ) : null}
      </Screen>
    </>
  );
}
