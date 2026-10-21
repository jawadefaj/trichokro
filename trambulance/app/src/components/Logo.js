import React from 'react';
import { Text, View } from 'react-native';
import { C } from '../lib/theme';

// Red-and-green medical cross from the Trambulance brand (diagonal split)
export function Cross({ size = 40 }) {
  const bar = size * 0.36;
  const arm = (size - bar) / 2;
  const r = size * 0.09;
  const box = { position: 'absolute' };
  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel="Trambulance">
      <View style={[box, { left: arm, top: 0, width: bar, height: arm + 1, backgroundColor: C.red, borderTopLeftRadius: r, borderTopRightRadius: r }]} />
      <View style={[box, { left: 0, top: arm, width: arm + 1, height: bar, backgroundColor: C.red, borderTopLeftRadius: r, borderBottomLeftRadius: r }]} />
      <View style={[box, { left: arm + bar - 1, top: arm, width: arm + 1, height: bar, backgroundColor: C.green, borderTopRightRadius: r, borderBottomRightRadius: r }]} />
      <View style={[box, { left: arm, top: arm + bar - 1, width: bar, height: arm + 1, backgroundColor: C.green, borderBottomLeftRadius: r, borderBottomRightRadius: r }]} />
      <View style={[box, { left: arm, top: arm, width: bar, height: bar, backgroundColor: C.green }]} />
      <View style={[box, { left: arm, top: arm, width: 0, height: 0, borderTopWidth: bar, borderRightWidth: bar, borderTopColor: C.red, borderRightColor: 'transparent' }]} />
    </View>
  );
}

export function Logo({ size = 40, tagline = true, center = false, t = (s) => s }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: center ? 'center' : 'flex-start' }}>
      <Cross size={size} />
      <View style={{ marginLeft: size * 0.25 }}>
        <Text style={{ fontSize: size * 0.62, fontWeight: '800', color: C.greenDark, letterSpacing: -0.6 }}>Trambulance</Text>
        {tagline ? <Text style={{ fontSize: Math.max(10, size * 0.26), color: C.text, marginTop: -2 }}>{t('Emergency Transport, Connected.')}</Text> : null}
      </View>
    </View>
  );
}
