import React from 'react';
import { Text, View } from 'react-native';
import { Screen, Card } from '../../components/ui';
import { Logo } from '../../components/Logo';
import { C, T } from '../../lib/theme';

export default function NotConfiguredScreen() {
  return (
    <Screen bg={C.white} style={{ padding: 22 }}>
      <Logo size={40} />
      <Text style={[T.title, { marginTop: 28 }]}>Connect your backend</Text>
      <Text style={[T.body, { marginTop: 8 }]}>This build has no Supabase project set, so sign-in and bookings are turned off.</Text>
      <Card style={{ marginTop: 18 }}>
        <Text style={T.h3}>To fix it</Text>
        <Text style={[T.body, { marginTop: 6 }]}>1. Create a free project at supabase.com and run supabase/schema.sql and seed.sql.</Text>
        <Text style={T.body}>2. Put the project URL and anon key in app/eas.json (EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY).</Text>
        <Text style={T.body}>3. Build the APK again.</Text>
      </Card>
      <View style={{ marginTop: 16 }}><Text style={T.small}>Full steps are in DEPLOY.md.</Text></View>
    </Screen>
  );
}
