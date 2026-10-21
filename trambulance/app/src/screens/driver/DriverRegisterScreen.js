import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';
import { Screen, Header, Button, Field, Chip, Label, Icon, Card } from '../../components/ui';
import { PhotoPicker } from '../../components/ProfileForm';
import { C, R, T } from '../../lib/theme';
import { supabase, errMsg } from '../../lib/supabase';
import { pickImage, uploadImage } from '../../lib/upload';
import { AMBULANCE_TYPES, TYPE_ORDER } from '../../lib/fare';
import { useAuth } from '../../context/Auth';

const EQUIPMENT = ['Oxygen cylinder', 'Stretcher', 'Wheelchair', 'AED / defibrillator', 'Ventilator', 'Patient monitor', 'Suction', 'Paramedic on board', 'Doctor on board', 'Air conditioning'];

function DocPhoto({ label, preview, onPick, busy }) {
  return (
    <Pressable onPress={onPick} style={{ flex: 1, height: 110, borderRadius: R.md, borderWidth: 1, borderStyle: 'dashed', borderColor: C.green, backgroundColor: C.mintSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {busy ? <ActivityIndicator color={C.green} />
        : preview ? <Image source={{ uri: preview }} style={{ width: '100%', height: '100%' }} />
          : (<><Icon name="camera-plus-outline" size={26} color={C.green} /><Text style={[T.small, { marginTop: 4, color: C.greenDark, textAlign: 'center' }]}>{label}</Text></>)}
    </Pressable>
  );
}

export default function DriverRegisterScreen({ navigation }) {
  const { user, profile, driver, refresh } = useAuth();
  const [f, setF] = useState({
    full_name: (driver && driver.full_name) || (profile && profile.full_name) || '',
    phone: (driver && driver.phone) || (profile && profile.phone) || '',
    photo_url: (driver && driver.photo_url) || (profile && profile.avatar_url) || null,
    vehicle_type: (driver && driver.vehicle_type) || 'basic',
    vehicle_model: (driver && driver.vehicle_model) || '',
    vehicle_number: (driver && driver.vehicle_number) || '',
    vehicle_photo_url: (driver && driver.vehicle_photo_url) || null,
    organization: (driver && driver.organization) || '',
    base_area: (driver && driver.base_area) || '',
    equipment: (driver && driver.equipment) || [],
    nid_number: '', license_number: '', license_photo_path: null, nid_photo_path: null,
  });
  const [previews, setPreviews] = useState({});
  const [uploading, setUploading] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((o) => ({ ...o, [k]: v }));

  useEffect(() => {
    if (!driver) return;
    supabase.from('driver_documents').select('*').eq('driver_id', user.id).maybeSingle().then(({ data }) => {
      if (data) setF((o) => ({ ...o, nid_number: data.nid_number || '', license_number: data.license_number || '', license_photo_path: data.license_photo_path, nid_photo_path: data.nid_photo_path }));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doc = (key, bucket, name) => async () => {
    try {
      const asset = await pickImage({ camera: true, square: false });
      if (!asset) return;
      setUploading(key);
      const { path, publicUrl } = await uploadImage(asset, bucket, name);
      setF((o) => ({ ...o, [key]: bucket === 'avatars' ? publicUrl : path }));
      setPreviews((o) => ({ ...o, [key]: asset.uri }));
    } catch (e) {
      Alert.alert('Photo not uploaded', errMsg(e));
    } finally {
      setUploading(null);
    }
  };

  const submit = async () => {
    const phone = f.phone.replace(/[\s-]/g, '');
    if (!f.full_name.trim()) return Alert.alert('Driver details', 'Enter your full name as on your licence.');
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone)) return Alert.alert('Driver details', 'Enter a Bangladeshi mobile number patients can call.');
    if (!f.license_number.trim()) return Alert.alert('Driver details', 'Enter your driving licence number.');
    if (!f.vehicle_number.trim()) return Alert.alert('Vehicle details', 'Enter the registration number, e.g. Dhaka Metro-Cha 71-2345.');
    if (!f.license_photo_path && !driver) return Alert.alert('Documents', 'Add a photo of your driving licence.');
    setBusy(true);
    try {
      const row = {
        id: user.id, full_name: f.full_name.trim(), phone, photo_url: f.photo_url, vehicle_type: f.vehicle_type,
        vehicle_model: f.vehicle_model.trim() || null, vehicle_number: f.vehicle_number.trim(), vehicle_photo_url: f.vehicle_photo_url,
        organization: f.organization.trim() || null, base_area: f.base_area.trim() || null, equipment: f.equipment,
      };
      if (driver) {
        const upd = { ...row };
        delete upd.id;
        if (driver.status === 'rejected') upd.status = 'pending';
        const { error } = await supabase.from('drivers').update(upd).eq('id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('drivers').insert(row);
        if (error) throw error;
      }
      const { error: e2 } = await supabase.from('driver_documents').upsert({
        driver_id: user.id, nid_number: f.nid_number.trim() || null, license_number: f.license_number.trim(),
        license_photo_path: f.license_photo_path, nid_photo_path: f.nid_photo_path, updated_at: new Date().toISOString(),
      });
      if (e2) throw e2;
      await supabase.from('profiles').update({ profile_complete: true, phone, full_name: f.full_name.trim(), avatar_url: f.photo_url }).eq('id', user.id);
      await refresh();
      if (driver && navigation.canGoBack()) navigation.goBack();
    } catch (e) {
      Alert.alert('Registration not saved', errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header title={driver ? 'Vehicle & documents' : 'Register your ambulance'} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <Screen edges={[]} footer={<Button title={driver ? 'Save changes' : 'Submit for approval'} onPress={submit} loading={busy} />}>
        {!driver ? (
          <Card style={{ backgroundColor: C.mintSoft, borderColor: C.mint, marginBottom: 6 }}>
            <Text style={T.h3}>How approval works</Text>
            <Text style={[T.small, { marginTop: 4 }]}>Our team checks your licence and vehicle, usually within 24 hours. You can go online as soon as you're approved.</Text>
          </Card>
        ) : null}
        <PhotoPicker uri={f.photo_url} name={f.full_name} onChange={set('photo_url')} label="Add your photo" />
        <Field label="Full name (as on licence)" icon="account-outline" value={f.full_name} onChangeText={set('full_name')} />
        <Field label="Mobile number" icon="phone-outline" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="01712345678" />
        <Field label="Driving licence number" icon="card-account-details-outline" value={f.license_number} onChangeText={set('license_number')} autoCapitalize="characters" />
        <Field label="NID number (optional)" icon="badge-account-horizontal-outline" value={f.nid_number} onChangeText={set('nid_number')} keyboardType="number-pad" />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
          <DocPhoto label={f.license_photo_path ? 'Licence added ✓' : 'Licence photo'} preview={previews.license_photo_path} busy={uploading === 'license_photo_path'} onPick={doc('license_photo_path', 'driver-docs', 'license')} />
          <DocPhoto label={f.nid_photo_path ? 'NID added ✓' : 'NID photo'} preview={previews.nid_photo_path} busy={uploading === 'nid_photo_path'} onPick={doc('nid_photo_path', 'driver-docs', 'nid')} />
        </View>

        <Label>Vehicle</Label>
        {TYPE_ORDER.map((k) => (
          <Pressable key={k} onPress={() => set('vehicle_type')(k)} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: R.md, borderWidth: 2, borderColor: f.vehicle_type === k ? C.green : C.line, backgroundColor: C.white, marginBottom: 8 }}>
            <Icon name={AMBULANCE_TYPES[k].icon} size={26} color={f.vehicle_type === k ? C.green : C.muted} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={T.h3}>{AMBULANCE_TYPES[k].name}</Text>
              <Text style={T.small}>{AMBULANCE_TYPES[k].features.join(' • ')}</Text>
            </View>
            {f.vehicle_type === k ? <Icon name="check-circle" size={22} color={C.green} /> : null}
          </Pressable>
        ))}
        <Field label="Registration number" icon="card-text-outline" value={f.vehicle_number} onChangeText={set('vehicle_number')} placeholder="Dhaka Metro-Cha 71-2345" style={{ marginTop: 6 }} />
        <Field label="Model (optional)" icon="car-info" value={f.vehicle_model} onChangeText={set('vehicle_model')} placeholder="e.g. Toyota HiAce" />
        <Field label="Hospital or company (optional)" icon="domain" value={f.organization} onChangeText={set('organization')} placeholder="e.g. Square Hospitals" />
        <Field label="Usual area" icon="map-marker-outline" value={f.base_area} onChangeText={set('base_area')} placeholder="e.g. Dhanmondi" />
        <DocPhoto label="Vehicle photo" preview={previews.vehicle_photo_url || f.vehicle_photo_url} busy={uploading === 'vehicle_photo_url'} onPick={doc('vehicle_photo_url', 'avatars', 'vehicle')} />
        <Label>Equipment on board</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {EQUIPMENT.map((e) => <Chip key={e} label={e} active={f.equipment.includes(e)} onPress={() => set('equipment')(f.equipment.includes(e) ? f.equipment.filter((x) => x !== e) : [...f.equipment, e])} />)}
        </View>
      </Screen>
    </>
  );
}
