import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Screen, Button, Field, Gap, Icon } from '../../components/ui';
import { Logo } from '../../components/Logo';
import { C, T } from '../../lib/theme';
import { supabase, errMsg } from '../../lib/supabase';
import { useAuth } from '../../context/Auth';
import { useT } from '../../lib/i18n';
import LangToggle from '../../components/LangToggle';

export default function LoginScreen({ navigation }) {
  const { signInWithGoogle } = useAuth();
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(null);

  const signIn = async () => {
    if (!email.trim() || !password) return Alert.alert('Sign in', 'Enter your email and password.');
    setBusy('email');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(null);
    if (error) Alert.alert('Could not sign in', errMsg(error));
  };

  const google = async () => {
    setBusy('google');
    try { await signInWithGoogle(); } catch (e) { Alert.alert('Google sign-in failed', errMsg(e)); }
    setBusy(null);
  };

  return (
    <Screen style={{ padding: 22, paddingTop: 12 }} bg={C.white}>
      <View style={{ alignItems: 'flex-end' }}><LangToggle /></View>
      <Gap h={28} />
      <Logo size={46} center t={t} />
      <Text style={[T.small, { textAlign: 'center', marginTop: 10 }]}>সময়ের সাথে, মানুষের পাশে</Text>
      <Gap h={36} />
      <Button title={t('Continue with Google')} variant="outline" icon="google" onPress={google} loading={busy === 'google'} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 22 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
        <Text style={[T.small, { marginHorizontal: 10 }]}>or use email</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
      </View>
      <Field label={t('Email')} icon="email-outline" value={email} onChangeText={setEmail} placeholder="you@gmail.com"
        keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <Field label={t('Password')} icon="lock-outline" value={password} onChangeText={setPassword} placeholder="Your password"
        secureTextEntry={!show} autoCapitalize="none"
        right={<Pressable onPress={() => setShow(!show)} hitSlop={10}><Icon name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.muted} /></Pressable>} />
      <Pressable onPress={() => navigation.navigate('Forgot', { email })} style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
        <Text style={{ color: C.green, fontWeight: '600' }}>{t('Forgot password?')}</Text>
      </Pressable>
      <Button title={t('Sign in')} onPress={signIn} loading={busy === 'email'} />
      <Gap h={18} />
      <Pressable onPress={() => navigation.navigate('SignUp')} style={{ alignItems: 'center', padding: 8 }}>
        <Text style={T.body}>New to Trambulance? <Text style={{ color: C.green, fontWeight: '700' }}>{t('Create account')}</Text></Text>
      </Pressable>
      <Gap h={22} />
      <Text style={[T.tiny, { textAlign: 'center' }]}>In a life-threatening emergency, call 999 first.</Text>
    </Screen>
  );
}
