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
    <View className="flex-1 bg-bg px-6 justify-center">
      <Text className="text-ink text-4xl font-display mb-2">WOLF</Text>
      <Text className="text-ink-muted text-base mb-8">Barbershop</Text>
      <Text className="text-ink text-lg mb-2">Introduce tu teléfono</Text>
      <Text className="text-ink-muted text-sm mb-4">Recibirás un código SMS</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="+34 600 000 000"
        placeholderTextColor="#6C6C68"
        className="border border-border bg-surface-2 rounded-md px-4 py-3 mb-4 text-ink"
      />
      <Button label="Enviar código" onPress={onSubmit} loading={loading} />
    </View>
  );
}
