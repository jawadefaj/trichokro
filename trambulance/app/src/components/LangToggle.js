import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { C } from '../lib/theme';
import { useT } from '../lib/i18n';

export default function LangToggle() {
  const { lang, setLang } = useT();
  const opt = (key, label) => (
    <Pressable onPress={() => setLang(key)} style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999, backgroundColor: lang === key ? C.green : 'transparent' }}
      accessibilityLabel={key === 'en' ? 'English' : 'Bangla'}>
      <Text style={{ fontSize: 12.5, fontWeight: '700', color: lang === key ? C.white : C.text }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: C.line, borderRadius: 999, padding: 2, backgroundColor: C.white }}>
      {opt('en', 'EN')}
      {opt('bn', 'বাংলা')}
    </View>
  );
}
