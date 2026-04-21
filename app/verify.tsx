import { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
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
    <View className="flex-1 bg-cream px-6 justify-center">
      <Text className="text-ink text-2xl font-bold mb-2">Verificar</Text>
      <Text className="text-ink/70 mb-6">Código enviado a {phone}</Text>
      <TextInput
        value={token}
        onChangeText={setToken}
        keyboardType="number-pad"
        className="border border-ink/20 rounded-lg px-4 py-3 mb-4 text-ink bg-white tracking-widest"
      />
      <Button label={loading ? 'Verificando...' : 'Verificar'} onPress={onSubmit} disabled={loading} />
    </View>
  );
}
