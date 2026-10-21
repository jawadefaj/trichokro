import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { Avatar, Chip, Field, Icon, Label } from './ui';
import { C, T } from '../lib/theme';
import { pickImage, uploadImage } from '../lib/upload';
import { errMsg } from '../lib/supabase';

const BLOOD = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Female', 'Male', 'Other'];

export function useProfileForm(p = {}) {
  const [f, setF] = useState({
    full_name: p.full_name || '', phone: p.phone || '', gender: p.gender || '', date_of_birth: p.date_of_birth || '',
    blood_group: p.blood_group || '', address: p.address || '', emergency_contact_name: p.emergency_contact_name || '',
    emergency_contact_phone: p.emergency_contact_phone || '', medical_notes: p.medical_notes || '', avatar_url: p.avatar_url || null,
  });
  const set = (k) => (v) => setF((o) => ({ ...o, [k]: v }));
  const validate = () => {
    if (!f.full_name.trim()) return 'Enter your full name.';
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(f.phone.replace(/[\s-]/g, ''))) return 'Enter a Bangladeshi mobile number, e.g. 01712345678.';
    if (f.date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(f.date_of_birth)) return 'Write date of birth as YYYY-MM-DD, e.g. 1990-05-21.';
    if (f.emergency_contact_phone && !/^(\+?88)?01[3-9]\d{8}$/.test(f.emergency_contact_phone.replace(/[\s-]/g, ''))) return 'Check the emergency contact number.';
    return null;
  };
  const values = () => ({
    ...f,
    phone: f.phone.replace(/[\s-]/g, ''),
    emergency_contact_phone: f.emergency_contact_phone.replace(/[\s-]/g, '') || null,
    date_of_birth: f.date_of_birth || null,
    gender: f.gender || null,
    blood_group: f.blood_group || null,
  });
  return { f, set, validate, values };
}

export function PhotoPicker({ uri, name, onChange, label = 'Add photo' }) {
  const [busy, setBusy] = useState(false);
  const choose = (camera) => async () => {
    try {
      const asset = await pickImage({ camera });
      if (!asset) return;
      setBusy(true);
      const { publicUrl } = await uploadImage(asset, 'avatars', 'avatar');
      onChange(publicUrl);
    } catch (e) {
      Alert.alert('Photo not uploaded', errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  const open = () => Alert.alert('Profile photo', 'A clear face photo helps crews recognise you.', [
    { text: 'Take photo', onPress: choose(true) },
    { text: 'Choose from gallery', onPress: choose(false) },
    { text: 'Cancel', style: 'cancel' },
  ]);
  return (
    <Pressable onPress={open} style={{ alignItems: 'center', marginVertical: 8 }}>
      <View>
        <Avatar uri={uri} name={name} size={92} />
        <View style={{ position: 'absolute', right: -2, bottom: -2, backgroundColor: C.green, borderRadius: 16, padding: 6, borderWidth: 2, borderColor: C.white }}>
          {busy ? <ActivityIndicator color={C.white} size="small" /> : <Icon name="camera" size={16} color={C.white} />}
        </View>
      </View>
      <Text style={{ color: C.green, fontWeight: '700', marginTop: 8 }}>{uri ? 'Change photo' : label}</Text>
    </Pressable>
  );
}

export default function ProfileForm({ form, t = (s) => s }) {
  const { f, set } = form;
  return (
    <View>
      <PhotoPicker uri={f.avatar_url} name={f.full_name} onChange={set('avatar_url')} />
      <Field label={t('Full name')} icon="account-outline" value={f.full_name} onChangeText={set('full_name')} placeholder="e.g. Rahim Uddin" />
      <Field label={t('Phone number')} icon="phone-outline" value={f.phone} onChangeText={set('phone')} placeholder="01712345678" keyboardType="phone-pad" />
      <Text style={{ fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 }}>{t('Gender')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {GENDERS.map((g) => <Chip key={g} label={g} active={f.gender === g} onPress={() => set('gender')(g)} />)}
      </View>
      <Field label={t('Date of birth')} icon="calendar" value={f.date_of_birth} onChangeText={set('date_of_birth')} placeholder="YYYY-MM-DD" style={{ marginTop: 6 }} />
      <Text style={{ fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 }}>{t('Blood group')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {BLOOD.map((b) => <Chip key={b} label={b} active={f.blood_group === b} color={C.red} onPress={() => set('blood_group')(f.blood_group === b ? '' : b)} />)}
      </View>
      <Field label={t('Address')} icon="home-outline" value={f.address} onChangeText={set('address')} placeholder="House, road, area" style={{ marginTop: 6 }} />
      <Label>{t('Emergency contact')}</Label>
      <Text style={[T.small, { marginBottom: 10 }]}>We can text this person your live location when you press SOS.</Text>
      <Field label="Name" icon="account-heart-outline" value={f.emergency_contact_name} onChangeText={set('emergency_contact_name')} placeholder="e.g. Ayesha (sister)" />
      <Field label="Phone" icon="phone-outline" value={f.emergency_contact_phone} onChangeText={set('emergency_contact_phone')} placeholder="01XXXXXXXXX" keyboardType="phone-pad" />
      <Field label={t('Medical notes')} icon="clipboard-pulse-outline" value={f.medical_notes} onChangeText={set('medical_notes')}
        placeholder="Allergies, conditions, medicines (shared with your crew)" multiline />
    </View>
  );
}
