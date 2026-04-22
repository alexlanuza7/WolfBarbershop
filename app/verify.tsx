import { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/ui/Button';
import { verifyOtp } from '@/data/auth';

export default function Verify() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!phone) return;
    setLoading(true);
    try {
      await verifyOtp(phone, token);
      router.replace('/');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Verificación falló');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 justify-center">
        <View className="flex-row items-center gap-2 mb-3">
          <View style={{ width: 6, height: 6, backgroundColor: '#C0342B' }} />
          <Text className="text-ink-subtle text-xs tracking-widest uppercase">
            02 / Código
          </Text>
        </View>
        <Text
          className="text-ink font-display-black uppercase"
          style={{ fontSize: 48, lineHeight: 48, letterSpacing: 0.5 }}
        >
          Verificar
        </Text>
        <Text className="text-ink-muted mt-3 mb-8" style={{ fontFamily: 'Archivo' }}>
          Código enviado a {phone}
        </Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          keyboardType="number-pad"
          placeholder="000000"
          placeholderTextColor="#6E6A66"
          maxLength={6}
          className="bg-surface-1 px-4 py-5 mb-6 text-ink text-center"
          style={{
            fontFamily: 'BigShoulders-Black',
            fontSize: 40,
            letterSpacing: 8,
          }}
        />
        <Button label="Verificar" onPress={onSubmit} loading={loading} />
      </View>
    </SafeAreaView>
  );
}
