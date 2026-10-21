import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { NavigationContainer, DefaultTheme, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '../components/ui';
import { Cross } from '../components/Logo';
import { C } from '../lib/theme';
import { useAuth } from '../context/Auth';
import { useT } from '../lib/i18n';

import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotScreen from '../screens/auth/ForgotScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import HomeScreen from '../screens/patient/HomeScreen';
import SOSScreen from '../screens/patient/SOSScreen';
import EmergencyScreen from '../screens/patient/EmergencyScreen';
import HospitalPickScreen from '../screens/patient/HospitalPickScreen';
import HospitalDetailScreen from '../screens/patient/HospitalDetailScreen';
import BookRideScreen from '../screens/patient/BookRideScreen';
import DriverProfileScreen from '../screens/patient/DriverProfileScreen';
import FareScreen from '../screens/patient/FareScreen';
import FindingScreen from '../screens/patient/FindingScreen';
import TrackingScreen from '../screens/patient/TrackingScreen';
import PaymentScreen from '../screens/patient/PaymentScreen';
import TripsScreen from '../screens/patient/TripsScreen';
import DirectoryScreen from '../screens/patient/DirectoryScreen';
import RateScreen from '../screens/shared/RateScreen';
import TripDetailScreen from '../screens/shared/TripDetailScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import SupportScreen from '../screens/shared/SupportScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import EditProfileScreen from '../screens/shared/EditProfileScreen';
import DriverRegisterScreen from '../screens/driver/DriverRegisterScreen';
import DriverPendingScreen from '../screens/driver/DriverPendingScreen';
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import DriverTripScreen from '../screens/driver/DriverTripScreen';
import EarningsScreen from '../screens/driver/EarningsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: C.green, background: C.bg, card: C.white, text: C.ink, border: C.line } };

const tabIcon = (name) => ({ color, size }) => <Icon name={name} color={color} size={size} />;
const tabOptions = {
  headerShown: false,
  tabBarActiveTintColor: C.green,
  tabBarInactiveTintColor: C.muted,
  tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6, borderTopColor: C.line },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
};

function SOSTabButton() {
  const nav = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Pressable onPress={() => nav.navigate('SOS')} accessibilityLabel="SOS emergency" accessibilityRole="button"
        style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: C.red, marginTop: -22, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: C.white, elevation: 6 }}>
        <Icon name="alarm-light" size={28} color={C.white} />
      </Pressable>
    </View>
  );
}
const Empty = () => null;

function PatientTabs() {
  const { t } = useT();
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('Home'), tabBarIcon: tabIcon('home') }} />
      <Tab.Screen name="Trips" component={TripsScreen} options={{ title: t('My Trips'), tabBarIcon: tabIcon('map-marker-path') }} />
      <Tab.Screen name="SOSTab" component={Empty} options={{ title: '', tabBarButton: () => <SOSTabButton /> }} />
      <Tab.Screen name="Hospitals" component={HospitalPickScreen} options={{ title: t('Hospitals'), tabBarIcon: tabIcon('hospital-building') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('Profile'), tabBarIcon: tabIcon('account-circle') }} />
    </Tab.Navigator>
  );
}

function DriverTabs() {
  const { t } = useT();
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="DriverHome" component={DriverHomeScreen} options={{ title: t('Home'), tabBarIcon: tabIcon('steering') }} />
      <Tab.Screen name="Earnings" component={EarningsScreen} options={{ title: t('Earnings'), tabBarIcon: tabIcon('cash-multiple') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('Profile'), tabBarIcon: tabIcon('account-circle') }} />
    </Tab.Navigator>
  );
}

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.white }}>
      <Cross size={64} />
      <ActivityIndicator color={C.green} style={{ marginTop: 24 }} />
    </View>
  );
}

export default function RootNavigator() {
  const { ready, session, profile, driver } = useAuth();
  if (!ready) return <Splash />;

  let screens;
  if (!session) {
    screens = (
      <>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Forgot" component={ForgotScreen} />
      </>
    );
  } else if (!profile || !profile.profile_complete) {
    screens = (
      <>
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} />
      </>
    );
  } else if (profile.role === 'driver' && driver && driver.status === 'approved') {
    screens = (
      <>
        <Stack.Screen name="DriverTabs" component={DriverTabs} />
        <Stack.Screen name="DriverTrip" component={DriverTripScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Rate" component={RateScreen} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} />
      </>
    );
  } else if (profile.role === 'driver') {
    screens = (
      <>
        {driver ? <Stack.Screen name="DriverPending" component={DriverPendingScreen} /> : null}
        <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
      </>
    );
  } else {
    screens = (
      <>
        <Stack.Screen name="Tabs" component={PatientTabs} />
        <Stack.Screen name="SOS" component={SOSScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Emergency" component={EmergencyScreen} />
        <Stack.Screen name="HospitalPick" component={HospitalPickScreen} />
        <Stack.Screen name="HospitalDetail" component={HospitalDetailScreen} />
        <Stack.Screen name="BookRide" component={BookRideScreen} />
        <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
        <Stack.Screen name="Fare" component={FareScreen} />
        <Stack.Screen name="Finding" component={FindingScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Tracking" component={TrackingScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Rate" component={RateScreen} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} />
        <Stack.Screen name="Directory" component={DirectoryScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} />
      </>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>{screens}</Stack.Navigator>
    </NavigationContainer>
  );
}
