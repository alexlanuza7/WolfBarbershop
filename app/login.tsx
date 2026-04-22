import { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/ui/Button';
import { sendOtp } from '@/data/auth';
import { WolfLogo, WolfWordmark } from '@/ui/WolfLogo';

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
    <SafeAreaView className="flex-1 bg-bg">
      {/* Hero signage — pole + wordmark centrados */}
      <View className="flex-1 items-center justify-center px-8">
        <WolfLogo size={48} />
        <View className="mt-8">
          <WolfWordmark scale={1.1} />
        </View>
        <View className="mt-6 flex-row items-center gap-3">
          <View style={{ height: 1, flex: 1, backgroundColor: '#2D2826' }} />
          <Text className="text-ink-subtle text-xs tracking-widest uppercase">
            EST · WOLF
          </Text>
          <View style={{ height: 1, flex: 1, backgroundColor: '#2D2826' }} />
        </View>
      </View>

      {/* Formulario abajo — editorial, sin tarjeta */}
      <View className="px-6 pb-10">
        <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-2">
          01 / Teléfono
        </Text>
        <Text className="text-ink font-display text-xl uppercase tracking-wide mb-4">
          Introduce tu número
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder="+34 600 000 000"
          placeholderTextColor="#6E6A66"
          className="bg-surface-1 px-4 py-4 mb-2 text-ink text-md"
          style={{ fontFamily: 'Archivo' }}
        />
        <Text className="text-ink-subtle text-xs mb-6">
          Recibirás un código SMS para iniciar sesión
        </Text>
        <Button label="Enviar código" onPress={onSubmit} loading={loading} />
      </View>
    </SafeAreaView>
  );
}
