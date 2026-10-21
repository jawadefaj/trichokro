import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/Auth';
import { LangProvider } from './src/lib/i18n';
import RootNavigator from './src/navigation';
import NotConfiguredScreen from './src/screens/auth/NotConfiguredScreen';
import { isConfigured } from './src/lib/supabase';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <LangProvider>
        {isConfigured ? (
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        ) : (
          <NotConfiguredScreen />
        )}
      </LangProvider>
    </SafeAreaProvider>
  );
}
