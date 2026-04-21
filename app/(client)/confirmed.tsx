import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Button } from '@/ui/Button';

function formatWhen(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Confirmed() {
  const router = useRouter();
  const { starts_at, barber, service } = useLocalSearchParams<{
    starts_at?: string;
    barber?: string;
    service?: string;
  }>();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-6">
        <Svg width={120} height={120} viewBox="0 0 48 48">
          <Circle cx="24" cy="24" r="22" fill="#C0342B" />
          <Path d="M14 24 L21 31 L34 18" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text className="text-ink font-display text-3xl mt-6 text-center">¡Reserva confirmada!</Text>
        {service && <Text className="text-ink-muted mt-3 text-center">{service}</Text>}
        {barber && <Text className="text-ink-muted text-center">con {barber}</Text>}
        {starts_at && (
          <Text className="text-ink font-semibold text-base mt-3 text-center">
            {formatWhen(starts_at)}
          </Text>
        )}
      </View>
      <View className="px-6 pb-8 pt-4">
        <Button label="Volver a mis turnos" onPress={() => router.replace('/(client)' as never)} />
      </View>
    </SafeAreaView>
  );
}
