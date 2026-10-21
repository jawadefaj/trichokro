import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Screen, Button, Icon, Gap } from '../../components/ui';
import ProfileForm, { useProfileForm } from '../../components/ProfileForm';
import { Logo } from '../../components/Logo';
import { C, R, T } from '../../lib/theme';
import { supabase, errMsg } from '../../lib/supabase';
import { useAuth } from '../../context/Auth';
import { useT } from '../../lib/i18n';

function RoleCard({ icon, title, body, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, padding: 14, borderRadius: R.lg, borderWidth: 2, borderColor: active ? C.green : C.line, backgroundColor: active ? C.mintSoft : C.white }}>
      <Icon name={icon} size={28} color={active ? C.green : C.muted} />
      <Text style={[T.h3, { marginTop: 8 }]}>{title}</Text>
      <Text style={[T.small, { marginTop: 2 }]}>{body}</Text>
    </Pressable>
  );
}

export default function ProfileSetupScreen({ navigation }) {
  const { user, profile, refresh, signOut } = useAuth();
  const { t } = useT();
  const form = useProfileForm(profile || {});
  const [role, setRole] = useState('patient');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const problem = form.validate();
    if (problem) return Alert.alert('Check your details', problem);
    setBusy(true);
    try {
      const { error } = await supabase.from('profiles')
        .upsert({ id: user.id, email: user.email, ...form.values(), profile_complete: role === 'patient' });
      if (error) throw error;
      if (role === 'driver') navigation.navigate('DriverRegister', { fromSetup: true });
      else await refresh();
    } catch (e) {
      Alert.alert('Could not save profile', errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen footer={<Button title={role === 'driver' ? 'Next: vehicle details' : 'Save and continue'} onPress={save} loading={busy} />}>
      <Logo size={34} t={t} />
      <Text style={[T.title, { marginTop: 22 }]}>Set up your profile</Text>
      <Text style={[T.small, { marginTop: 4 }]}>Crews use this to reach you and to prepare for the patient.</Text>
      <Gap h={16} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <RoleCard icon="account-heart" title="I need ambulances" body="Book for myself or family" active={role === 'patient'} onPress={() => setRole('patient')} />
        <RoleCard icon="ambulance" title="I drive an ambulance" body="Get trip requests" active={role === 'driver'} onPress={() => setRole('driver')} />
      </View>
      <Gap h={12} />
      <ProfileForm form={form} t={t} />
      <Pressable onPress={signOut} style={{ alignItems: 'center', padding: 12 }}>
        <Text style={{ color: C.muted }}>Signed in as {user && user.email} · <Text style={{ color: C.red }}>Log out</Text></Text>
      </Pressable>
    </Screen>
  );
}
