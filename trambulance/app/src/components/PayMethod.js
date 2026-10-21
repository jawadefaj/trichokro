import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from './ui';
import { C, R, T } from '../lib/theme';

export const METHODS = [
  { key: 'bkash', label: 'bKash', color: C.bkash, icon: 'cellphone' },
  { key: 'nagad', label: 'Nagad', color: C.nagad, icon: 'cellphone' },
  { key: 'cash', label: 'Cash', color: C.green, icon: 'cash' },
];

export function MethodBadge({ m, size = 34 }) {
  const meta = METHODS.find((x) => x.key === m) || METHODS[2];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 3, backgroundColor: meta.color, alignItems: 'center', justifyContent: 'center' }}>
      {meta.key === 'cash'
        ? <Icon name="cash" size={size * 0.6} color={C.white} />
        : <Text style={{ color: C.white, fontWeight: '900', fontSize: size * 0.42 }}>{meta.label[0].toLowerCase() === 'b' ? 'b' : 'N'}</Text>}
    </View>
  );
}

export default function PayMethodPicker({ value, onChange, t = (s) => s }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {METHODS.map((m) => {
        const on = value === m.key;
        return (
          <Pressable key={m.key} onPress={() => onChange(m.key)} accessibilityState={{ selected: on }}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: R.md, borderWidth: 2, borderColor: on ? m.color : C.line, backgroundColor: C.white }}>
            <MethodBadge m={m.key} />
            <Text style={[T.h3, { marginTop: 6, fontSize: 14 }]}>{t(m.label)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
