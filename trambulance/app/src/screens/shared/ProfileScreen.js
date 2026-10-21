import React from 'react';
import { Alert, Text, View } from 'react-native';
import { Screen, Header, Card, Avatar, Row, Divider, Badge, Rating } from '../../components/ui';
import LangToggle from '../../components/LangToggle';
import { C, T } from '../../lib/theme';
import { AMBULANCE_TYPES } from '../../lib/fare';
import { useAuth } from '../../context/Auth';
import { useT } from '../../lib/i18n';

export default function ProfileScreen({ navigation }) {
  const { t } = useT();
  const { profile, driver, user, signOut } = useAuth();
  const isDriver = profile && profile.role === 'driver';
  const logout = () => Alert.alert('Log out?', 'You will need to sign in again to book or drive.', [
    { text: 'Cancel', style: 'cancel' }, { text: t('Log out'), style: 'destructive', onPress: signOut },
  ]);
  return (
    <>
      <Header title={t('Profile')} />
      <Screen edges={[]}>
        <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Avatar uri={(isDriver && driver && driver.photo_url) || (profile && profile.avatar_url)} name={profile && profile.full_name} size={84} />
          <Text style={[T.h2, { marginTop: 10 }]}>{(profile && profile.full_name) || 'Your name'}</Text>
          <Text style={T.small}>{user && user.email}</Text>
          <Text style={T.small}>{profile && profile.phone}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
            <Badge label={isDriver ? 'Driver' : profile && profile.role === 'admin' ? 'Admin' : 'Patient'} tone={isDriver ? 'blue' : 'green'} />
            {profile && profile.blood_group ? <Badge label={`Blood ${profile.blood_group}`} tone="red" /> : null}
          </View>
        </Card>

        {isDriver && driver ? (
          <Card style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={T.h3}>{AMBULANCE_TYPES[driver.vehicle_type].name}</Text>
              <Rating value={driver.rating} count={driver.rating_count} />
            </View>
            <Text style={T.small}>{driver.vehicle_number}{driver.vehicle_model ? ` · ${driver.vehicle_model}` : ''}</Text>
            <Text style={T.small}>{driver.trips_count} trips completed</Text>
          </Card>
        ) : null}

        <Card style={{ marginTop: 12, paddingVertical: 4 }}>
          <Row icon="account-edit-outline" label={t('Edit profile')} sub="Photo, contact, medical info, password" onPress={() => navigation.navigate('EditProfile')} />
          <Divider style={{ marginVertical: 0 }} />
          {isDriver ? (
            <>
              <Row icon="ambulance" label="Vehicle & documents" sub="Update your registration" onPress={() => navigation.navigate('DriverRegister', { edit: true })} />
              <Divider style={{ marginVertical: 0 }} />
            </>
          ) : null}
          <Row icon="translate" label={t('Language')} right={<LangToggle />} />
          <Divider style={{ marginVertical: 0 }} />
          <Row icon="lifebuoy" label={t('Support')} sub="Hotlines, reports and FAQs" onPress={() => navigation.navigate('Support')} />
          <Divider style={{ marginVertical: 0 }} />
          <Row icon="shield-alert-outline" iconColor={C.red} label="Report a safety issue" onPress={() => navigation.navigate('Support', { category: 'safety' })} />
          {!isDriver ? (
            <>
              <Divider style={{ marginVertical: 0 }} />
              <Row icon="steering" label={t('Become a driver')} sub="Register your ambulance" onPress={() => navigation.navigate('DriverRegister')} />
            </>
          ) : null}
          <Divider style={{ marginVertical: 0 }} />
          <Row icon="file-document-outline" label="Terms & privacy" onPress={() => Alert.alert('Terms & privacy',
            'Your location is shared with your assigned crew only during an active trip. Medical notes are shared with the crew you book. Contact support to delete your account.')} />
          <Divider style={{ marginVertical: 0 }} />
          <Row icon="logout" iconColor={C.red} label={t('Log out')} onPress={logout} />
        </Card>
        <Text style={[T.tiny, { textAlign: 'center', marginTop: 16 }]}>Trambulance v1.0 · সময়ের সাথে, মানুষের পাশে</Text>
      </Screen>
    </>
  );
}
