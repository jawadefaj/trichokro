import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, Icon, Chip } from '../../components/ui';
import { C, R, T } from '../../lib/theme';
import { supabase, must } from '../../lib/supabase';
import { useLive } from '../../lib/useLive';
import { useAuth } from '../../context/Auth';

const QUICK_PATIENT = ['Please call me', 'I am at the main gate', 'Patient is ready', 'Please hurry'];
const QUICK_DRIVER = ['I am on my way', 'I have arrived', 'Stuck in traffic, 5 more minutes', 'Please come down'];

export default function ChatScreen({ navigation, route }) {
  const { rideId, title } = route.params;
  const { user, profile } = useAuth();
  const [text, setText] = useState('');
  const scroll = useRef(null);
  const { data: msgs, refresh } = useLive(
    () => must(supabase.from('messages').select('*').eq('ride_id', rideId).order('created_at').limit(200)),
    [rideId], { subs: [{ table: 'messages', filter: `ride_id=eq.${rideId}` }], interval: 4000 },
  );
  useEffect(() => { setTimeout(() => scroll.current && scroll.current.scrollToEnd({ animated: true }), 100); }, [msgs && msgs.length]);

  const send = async (body) => {
    const b = (body || text).trim();
    if (!b) return;
    setText('');
    await supabase.from('messages').insert({ ride_id: rideId, sender_id: user.id, body: b });
    refresh();
  };
  const quick = profile && profile.role === 'driver' ? QUICK_DRIVER : QUICK_PATIENT;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['bottom']}>
      <Header title={title || 'Chat'} subtitle="Messages are shared only with your trip" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={{ padding: 16 }}>
          {(msgs || []).length === 0 ? <Text style={[T.small, { textAlign: 'center', marginTop: 30 }]}>Send a message to coordinate the pickup.</Text> : null}
          {(msgs || []).map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <View key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '80%', marginBottom: 8,
                backgroundColor: mine ? C.green : C.white, borderRadius: R.lg, borderBottomRightRadius: mine ? 4 : R.lg, borderBottomLeftRadius: mine ? R.lg : 4,
                paddingHorizontal: 12, paddingVertical: 8, borderWidth: mine ? 0 : 1, borderColor: C.line }}>
                <Text style={{ color: mine ? C.white : C.ink, fontSize: 15 }}>{m.body}</Text>
                <Text style={{ color: mine ? '#CFEAD9' : C.faint, fontSize: 10, marginTop: 2, alignSelf: 'flex-end' }}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, paddingHorizontal: 12 }}>
          {quick.map((q) => <Chip key={q} label={q} onPress={() => send(q)} />)}
        </ScrollView>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.line }}>
          <TextInput value={text} onChangeText={setText} placeholder="Type a message" placeholderTextColor={C.faint}
            style={{ flex: 1, backgroundColor: C.bg, borderRadius: R.pill, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: C.ink }}
            onSubmitEditing={() => send()} returnKeyType="send" />
          <Pressable onPress={() => send()} accessibilityLabel="Send" style={{ marginLeft: 8, width: 44, height: 44, borderRadius: 22, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" size={20} color={C.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
