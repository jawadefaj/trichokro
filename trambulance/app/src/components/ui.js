import React from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, R, T, shadow } from '../lib/theme';

export const Icon = MaterialCommunityIcons;

export function Screen({ children, scroll = true, style, footer, edges = ['top'], bg = C.bg, refreshControl }) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[{ padding: 16, paddingBottom: 32 }, style]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={edges}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {body}
        {footer ? <View style={s.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Header({ title, onBack, right, subtitle }) {
  return (
    <View style={s.header}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={s.headerBack} accessibilityLabel="Go back">
          <Icon name="arrow-left" size={24} color={C.ink} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={T.small} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const BTN = {
  primary: { bg: C.green, fg: C.white, border: C.green },
  danger: { bg: C.red, fg: C.white, border: C.red },
  outline: { bg: C.white, fg: C.ink, border: C.line },
  light: { bg: C.mint, fg: C.greenDark, border: C.mint },
  ghost: { bg: 'transparent', fg: C.green, border: 'transparent' },
  dangerLight: { bg: C.redSoft, fg: C.redDark, border: C.redSoft },
};

export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style, small, right, textStyle }) {
  const v = BTN[variant] || BTN.primary;
  const off = disabled || loading;
  return (
    <Pressable
      onPress={off ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off }}
      style={({ pressed }) => [
        s.btn,
        small && s.btnSmall,
        { backgroundColor: v.bg, borderColor: v.border, opacity: off ? 0.55 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={small ? 16 : 20} color={v.fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[s.btnText, small && { fontSize: 13 }, { color: v.fg }, textStyle]} numberOfLines={1}>{title}</Text>
          {right ? <View style={{ marginLeft: 'auto' }}>{right}</View> : null}
        </>
      )}
    </Pressable>
  );
}

export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.9 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[s.card, style]}>{children}</View>;
}

export function Field({ label, icon, style, inputStyle, multiline, right, ...props }) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={[s.input, multiline && { minHeight: 84, alignItems: 'flex-start', paddingTop: 10 }]}>
        {icon ? <Icon name={icon} size={18} color={C.muted} style={{ marginRight: 8, marginTop: multiline ? 2 : 0 }} /> : null}
        <TextInput
          placeholderTextColor={C.faint}
          style={[{ flex: 1, fontSize: 15, color: C.ink, paddingVertical: Platform.OS === 'ios' ? 12 : 8 }, multiline && { textAlignVertical: 'top' }, inputStyle]}
          multiline={multiline}
          {...props}
        />
        {right}
      </View>
    </View>
  );
}

export function Chip({ label, active, onPress, icon, color = C.green, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active && { backgroundColor: color, borderColor: color }, style]}
      accessibilityState={{ selected: !!active }}
    >
      {icon ? <Icon name={icon} size={14} color={active ? C.white : color} style={{ marginRight: 5 }} /> : null}
      <Text style={[s.chipText, active && { color: C.white }]}>{label}</Text>
    </Pressable>
  );
}

const TONES = {
  green: [C.mint, C.greenDark], red: [C.redSoft, C.redDark], amber: [C.amberSoft, C.amber],
  gray: ['#EEF2EF', C.muted], blue: [C.blueSoft, C.blue],
};
export function Badge({ label, tone = 'green', icon, style }) {
  const [bg, fg] = TONES[tone] || TONES.green;
  return (
    <View style={[s.badge, { backgroundColor: bg }, style]}>
      {icon ? <Icon name={icon} size={12} color={fg} style={{ marginRight: 4 }} /> : null}
      <Text style={[s.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function Avatar({ uri, name, size = 48 }) {
  const initials = String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.mint }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: C.greenDark, fontWeight: '800', fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export function Stars({ value = 0, size = 16, onChange }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={onChange ? () => onChange(n) : undefined} hitSlop={6} disabled={!onChange}>
          <Icon name={n <= Math.round(value) ? 'star' : 'star-outline'} size={size} color="#F5A524" style={{ marginRight: 2 }} />
        </Pressable>
      ))}
    </View>
  );
}

export function Rating({ value, count }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Icon name="star" size={14} color="#F5A524" />
      <Text style={[T.small, { marginLeft: 3, color: C.text, fontWeight: '600' }]}>
        {Number(value || 5).toFixed(1)}{count != null ? ` (${count})` : ''}
      </Text>
    </View>
  );
}

export function Segmented({ options, value, onChange, style }) {
  return (
    <View style={[s.seg, style]}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} style={[s.segItem, on && s.segOn]}>
            <Text style={[s.segText, on && { color: C.white }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({ value, onChange, step = 50, min = 0, max = 1e9, format = (v) => v }) {
  return (
    <View style={s.stepper}>
      <Pressable style={s.stepBtn} onPress={() => onChange(Math.max(min, value - step))} disabled={value <= min} accessibilityLabel="Decrease">
        <Icon name="minus" size={22} color={value <= min ? C.faint : C.greenDark} />
      </Pressable>
      <Text style={s.stepValue}>{format(value)}</Text>
      <Pressable style={s.stepBtn} onPress={() => onChange(Math.min(max, value + step))} disabled={value >= max} accessibilityLabel="Increase">
        <Icon name="plus" size={22} color={value >= max ? C.faint : C.greenDark} />
      </Pressable>
    </View>
  );
}

export function Timeline({ steps, current }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 }}>
      {steps.map((label, i) => {
        const done = i <= current;
        return (
          <View key={label} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <View style={[s.tlLine, { opacity: i === 0 ? 0 : 1, backgroundColor: i <= current ? C.green : C.line }]} />
              <View style={[s.tlDot, done && { backgroundColor: C.green, borderColor: C.green }, i === current && s.tlCurrent]} />
              <View style={[s.tlLine, { opacity: i === steps.length - 1 ? 0 : 1, backgroundColor: i < current ? C.green : C.line }]} />
            </View>
            <Text style={[s.tlText, done && { color: C.greenDark, fontWeight: '700' }]} numberOfLines={1}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function Empty({ icon = 'information-outline', title, body, action }) {
  return (
    <View style={{ alignItems: 'center', padding: 28 }}>
      <View style={s.emptyIcon}><Icon name={icon} size={28} color={C.green} /></View>
      <Text style={[T.h3, { textAlign: 'center', marginTop: 12 }]}>{title}</Text>
      {body ? <Text style={[T.small, { textAlign: 'center', marginTop: 6 }]}>{body}</Text> : null}
      {action ? <View style={{ marginTop: 14, alignSelf: 'stretch' }}>{action}</View> : null}
    </View>
  );
}

export function Row({ icon, iconColor = C.green, label, value, onPress, right, sub }) {
  const content = (
    <View style={s.row}>
      {icon ? <Icon name={icon} size={20} color={iconColor} style={{ marginRight: 12 }} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={[T.body, { color: C.ink }]}>{label}</Text>
        {sub ? <Text style={T.small}>{sub}</Text> : null}
      </View>
      {value != null ? <Text style={[T.body, { fontWeight: '600', color: C.ink }]}>{value}</Text> : null}
      {right}
      {onPress && !right ? <Icon name="chevron-right" size={20} color={C.faint} /> : null}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

export function Place({ kind = 'pickup', title, text, onPress, right }) {
  const pickup = kind === 'pickup';
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={s.place}>
      <Icon name={pickup ? 'map-marker-radius' : 'map-marker'} size={22} color={pickup ? C.green : C.red} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={[T.tiny, { color: pickup ? C.green : C.red, fontWeight: '700' }]}>{title}</Text>
        <Text style={[T.body, { color: C.ink }]} numberOfLines={2}>{text || '—'}</Text>
      </View>
      {right}
    </Pressable>
  );
}

export const Divider = ({ style }) => <View style={[{ height: 1, backgroundColor: C.line, marginVertical: 12 }, style]} />;
export const Gap = ({ h = 12 }) => <View style={{ height: h }} />;
export const Label = ({ children, style }) => <Text style={[s.section, style]}>{children}</Text>;

export const s = StyleSheet.create({
  footer: { padding: 16, paddingBottom: 20, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.line },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.line },
  headerBack: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.ink },
  btn: { minHeight: 50, borderRadius: R.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  btnSmall: { minHeight: 36, paddingHorizontal: 12, borderRadius: R.sm },
  btnText: { fontSize: 15.5, fontWeight: '700' },
  card: { backgroundColor: C.white, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.line, ...shadow },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 },
  input: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: R.md, paddingHorizontal: 12, minHeight: 48 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: R.pill, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, marginRight: 8, marginBottom: 8 },
  chipText: { fontSize: 13, color: C.text, fontWeight: '600' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11.5, fontWeight: '700' },
  seg: { flexDirection: 'row', backgroundColor: '#EAF1EC', borderRadius: R.md, padding: 3 },
  segItem: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: R.sm + 2 },
  segOn: { backgroundColor: C.green },
  segText: { fontSize: 13.5, fontWeight: '700', color: C.text },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.mintSoft, borderRadius: R.md, borderWidth: 1, borderColor: C.mint, padding: 6 },
  stepBtn: { width: 46, height: 46, borderRadius: R.md, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line },
  stepValue: { fontSize: 24, fontWeight: '800', color: C.ink },
  tlLine: { flex: 1, height: 2 },
  tlDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: C.line, backgroundColor: C.white },
  tlCurrent: { width: 18, height: 18, borderRadius: 9, borderWidth: 4, borderColor: C.mint },
  tlText: { fontSize: 10.5, color: C.muted, marginTop: 6 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  place: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  section: { fontSize: 15, fontWeight: '700', color: C.ink, marginTop: 18, marginBottom: 10 },
});
