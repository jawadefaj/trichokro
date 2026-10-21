import React, { useState } from 'react';
import { Alert, Text } from 'react-native';
import { Screen, Header, Button, Field, Gap } from '../../components/ui';
import { C, T } from '../../lib/theme';
import { supabase, errMsg } from '../../lib/supabase';
import { redirectUrl, useAuth } from '../../context/Auth';
import { useT } from '../../lib/i18n';

export default function SignUpScreen({ navigation }) {
  const { t } = useT();
  const { signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) return Alert.alert('Create account', 'Enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return Alert.alert('Create account', 'Enter a valid email address.');
    if (password.length < 8) return Alert.alert('Create account', 'Use at least 8 characters for your password.');
    if (password !== confirm) return Alert.alert('Create account', 'The two passwords do not match.');
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim() }, emailRedirectTo: redirectUrl() },
    });
    setBusy(false);
    if (error) return Alert.alert('Could not create account', errMsg(error));
    if (!data.session) {
      Alert.alert('Confirm your email', `We sent a link to ${email.trim()}. Open it on this phone to finish signing up.`);
      navigation.goBack();
    }
  };

  return (
    <>
      <Header title={t('Create account')} onBack={() => navigation.goBack()} />
      <Screen edges={[]} style={{ padding: 20 }} bg={C.white}>
        <Button title={t('Continue with Google')} variant="outline" icon="google"
          onPress={() => signInWithGoogle().catch((e) => Alert.alert('Google sign-in failed', errMsg(e)))} />
        <Gap h={20} />
        <Field label={t('Full name')} icon="account-outline" value={name} onChangeText={setName} placeholder="e.g. Rahim Uddin" />
        <Field label={t('Email')} icon="email-outline" value={email} onChangeText={setEmail} placeholder="you@gmail.com"
          keyboardType="email-address" autoCapitalize="none" />
        <Field label={t('Password')} icon="lock-outline" value={password} onChangeText={setPassword} placeholder="At least 8 characters"
          secureTextEntry autoCapitalize="none" />
        <Field label="Confirm password" icon="lock-check-outline" value={confirm} onChangeText={setConfirm} placeholder="Type it again"
          secureTextEntry autoCapitalize="none" />
        <Gap h={6} />
        <Button title={t('Create account')} onPress={submit} loading={busy} />
        <Text style={[T.tiny, { textAlign: 'center', marginTop: 14 }]}>
          By creating an account you agree to share your location with ambulance crews during a trip.
        </Text>
      </Screen>
    </>
  );
}
