import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Screen, Header, Button, Field, Label, Gap } from '../../components/ui';
import ProfileForm, { useProfileForm } from '../../components/ProfileForm';
import { supabase, errMsg } from '../../lib/supabase';
import { useAuth } from '../../context/Auth';
import { useT } from '../../lib/i18n';

export default function EditProfileScreen({ navigation }) {
  const { t } = useT();
  const { user, profile, refresh } = useAuth();
  const form = useProfileForm(profile || {});
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  const save = async () => {
    const problem = form.validate();
    if (problem) return Alert.alert('Check your details', problem);
    setBusy(true);
    const { error } = await supabase.from('profiles').update(form.values()).eq('id', user.id);
    setBusy(false);
    if (error) return Alert.alert('Not saved', errMsg(error));
    await refresh();
    navigation.goBack();
  };
  const changePw = async () => {
    if (pw.length < 8) return Alert.alert('New password', 'Use at least 8 characters.');
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwBusy(false);
    if (error) return Alert.alert('Password not changed', errMsg(error));
    setPw('');
    Alert.alert('Password changed', 'Use your new password next time you sign in.');
  };
  return (
    <>
      <Header title={t('Edit profile')} onBack={() => navigation.goBack()} />
      <Screen edges={[]} footer={<Button title={t('Save')} onPress={save} loading={busy} />}>
        <ProfileForm form={form} t={t} />
        <Label>Change password</Label>
        <Field value={pw} onChangeText={setPw} placeholder="New password (8+ characters)" secureTextEntry icon="lock-reset" autoCapitalize="none" />
        <Button title="Update password" variant="outline" onPress={changePw} loading={pwBusy} />
        <Gap h={20} />
      </Screen>
    </>
  );
}
