import { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/ui/Button';
import { sendOtp } from '@/data/auth';

export default function Login() {
  const [phone, setPhone] = useState('+34');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    try {
      await sendOtp(phone);
      router.push({ pathname: '/verify', params: { phone } });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'OTP failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-cream px-6 justify-center">
      <Text className="text-ink text-2xl font-bold mb-2">Wolf Barbershop</Text>
      <Text className="text-ink/70 mb-6">Introduce tu teléfono para recibir el código SMS</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        className="border border-ink/20 rounded-lg px-4 py-3 mb-4 text-ink bg-white"
      />
      <Button label={loading ? 'Enviando...' : 'Enviar código'} onPress={onSubmit} disabled={loading} />
    </View>
  );
}
