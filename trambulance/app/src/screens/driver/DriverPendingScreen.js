import React, { useState } from 'react';
import { Text } from 'react-native';
import { Screen, Button, Card, Icon, Row, Divider, Gap } from '../../components/ui';
import { Logo } from '../../components/Logo';
import { C, T } from '../../lib/theme';
import { AMBULANCE_TYPES } from '../../lib/fare';
import { useAuth } from '../../context/Auth';

export default function DriverPendingScreen({ navigation }) {
  const { driver, refresh, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const rejected = driver.status === 'rejected';
  const suspended = driver.status === 'suspended';
  return (
    <Screen>
      <Logo size={30} tagline={false} />
      <Card style={{ marginTop: 20, alignItems: 'center', paddingVertical: 26 }}>
        <Icon name={rejected ? 'close-octagon-outline' : suspended ? 'pause-octagon-outline' : 'timer-sand'} size={44} color={rejected || suspended ? C.red : C.amber} />
        <Text style={[T.h2, { marginTop: 10 }]}>{rejected ? 'Application needs changes' : suspended ? 'Account suspended' : 'Application under review'}</Text>
        <Text style={[T.small, { textAlign: 'center', marginTop: 6, paddingHorizontal: 10 }]}>
          {rejected ? (driver.rejection_reason || 'Update your details and submit again.')
            : suspended ? (driver.rejection_reason || 'Contact support to reactivate your account.')
              : 'We are checking your licence and vehicle. You can go online once approved, usually within 24 hours.'}
        </Text>
      </Card>
      <Card style={{ marginTop: 12 }}>
        <Row icon={AMBULANCE_TYPES[driver.vehicle_type].icon} label={AMBULANCE_TYPES[driver.vehicle_type].name} sub={driver.vehicle_number} />
        <Divider style={{ marginVertical: 0 }} />
        <Row icon="phone" label={driver.phone} sub={driver.full_name} />
      </Card>
      <Gap h={16} />
      <Button title="Check status" icon="refresh" loading={busy} onPress={async () => { setBusy(true); await refresh(); setBusy(false); }} />
      <Gap h={10} />
      <Button title={rejected ? 'Edit and resubmit' : 'Edit application'} variant="outline" onPress={() => navigation.navigate('DriverRegister', { edit: true })} />
      <Gap h={10} />
      <Button title="Contact support" variant="ghost" onPress={() => navigation.navigate('Support')} />
      <Button title="Log out" variant="ghost" textStyle={{ color: C.red }} onPress={signOut} />
    </Screen>
  );
}
