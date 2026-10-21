import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Badge, Button, Card, Icon } from './ui';
import { C, T } from '../lib/theme';
import { fmtKm } from '../lib/geo';

export default function HospitalCard({ h, dist, best, onPress, onSelect, selectLabel = 'Select', t = (s) => s }) {
  const highlights = h.matches && h.matches.length ? h.matches : (h.specialties || []).slice(0, 3);
  return (
    <Card style={{ marginBottom: 12 }} onPress={onPress}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.redSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="hospital-box" size={26} color={C.red} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={[T.h3, { marginRight: 6 }]} numberOfLines={2}>{h.name}</Text>
            {h.verified ? <Badge label="Verified" icon="check-decagram" /> : null}
          </View>
          <Text style={[T.small, { marginTop: 2 }]}>
            {dist != null ? `${fmtKm(dist)} · ` : ''}{h.area}{h.type ? ` · ${h.type}` : ''}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
            {best ? <Badge label={t('Best match')} tone="amber" icon="star" style={{ marginRight: 6, marginBottom: 4 }} /> : null}
            {highlights.map((sp) => (
              <Badge key={sp} label={sp} tone={h.matches && h.matches.includes(sp) ? 'green' : 'gray'} style={{ marginRight: 6, marginBottom: 4 }} />
            ))}
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
        {onSelect ? <Button small title={t(selectLabel)} icon="check" style={{ flex: 1 }} onPress={onSelect} /> : null}
        {h.phone ? (
          <Pressable onPress={() => Linking.openURL(`tel:${h.phone}`)} accessibilityLabel={`Call ${h.name}`}
            style={{ width: 40, height: 36, borderRadius: 8, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" size={18} color={C.green} />
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}
