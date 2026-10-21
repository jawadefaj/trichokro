import React, { useState } from 'react';
import { Alert, Text } from 'react-native';
import { Screen, Header, Button, Field, Gap } from '../../components/ui';
import { C, T } from '../../lib/theme';
import { supabase, errMsg } from '../../lib/supabase';
import { redirectUrl } from '../../context/Auth';

export default function ForgotScreen({ navigation, route }) {
  const [email, setEmail] = useState((route.params && route.params.email) || '');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!email.trim()) return Alert.alert('Reset password', 'Enter the email you signed up with.');
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: redirectUrl() });
    setBusy(false);
    if (error) return Alert.alert('Could not send link', errMsg(error));
    Alert.alert('Check your email', 'Open the link on this phone. You will be signed in, then set a new password in Profile → Edit profile.');
    navigation.goBack();
  };
  return (
    <>
      <Header title="Reset password" onBack={() => navigation.goBack()} />
      <Screen edges={[]} style={{ padding: 20 }} bg={C.white}>
        <Text style={T.body}>We will email you a sign-in link.</Text>
        <Gap h={16} />
        <Field label="Email" icon="email-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Button title="Send reset link" onPress={send} loading={busy} />
      </Screen>
    </>
  );
}
