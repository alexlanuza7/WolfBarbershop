import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';
import { Button } from '@/ui/Button';

function formatDateBlock(iso?: string) {
  if (!iso) return { day: '--', month: '---', weekday: '', time: '--:--' };
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d
    .toLocaleString('es-ES', { month: 'short' })
    .toUpperCase()
    .replace('.', '');
  const weekday = d
    .toLocaleString('es-ES', { weekday: 'long' })
    .toUpperCase();
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return { day, month, weekday, time };
}

export default function Confirmed() {
  const router = useRouter();
  const { starts_at, barber, service } = useLocalSearchParams<{
    starts_at?: string;
    barber?: string;
    service?: string;
  }>();
  const { day, month, weekday, time } = formatDateBlock(starts_at);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-6">
        {/* Marca superior — check cuadrado + leyenda editorial */}
        <View className="flex-row items-center gap-3 mb-10">
          <Svg width={28} height={28} viewBox="0 0 24 24">
            <Rect x="1" y="1" width="22" height="22" fill="#C0342B" />
            <Path
              d="M6 12 L10 16 L18 8"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="square"
            />
          </Svg>
          <Text className="text-ink-subtle text-xs tracking-widest uppercase">
            RESERVA REGISTRADA · N° {starts_at?.slice(-6) ?? ''}
          </Text>
        </View>

        {/* Titular signage */}
        <Text
          className="text-ink font-display-black uppercase"
          style={{ fontSize: 64, lineHeight: 60, letterSpacing: 0.5 }}
        >
          Te{'\n'}Esperamos
        </Text>

        {/* Bloque fecha — estilo calendario rasgado, enorme */}
        <View
          className="mt-12 py-6"
          style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#2D2826' }}
        >
          <View className="flex-row items-end gap-6">
            <View className="items-center">
              <Text
                className="text-ink font-display-black"
                style={{ fontSize: 96, lineHeight: 96, fontVariant: ['tabular-nums'] }}
              >
                {day}
              </Text>
              <Text className="text-ink-muted text-sm tracking-widest mt-1">{month}</Text>
            </View>
            <View className="flex-1 pb-3">
              <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-1">
                {weekday}
              </Text>
              <Text
                className="text-ink font-display-black"
                style={{ fontSize: 44, lineHeight: 44, letterSpacing: 0.5 }}
              >
                {time}
              </Text>
            </View>
          </View>
        </View>

        {/* Detalles servicio / barbero */}
        <View className="mt-8">
          {service && (
            <View className="mb-5">
              <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-1">
                SERVICIO
              </Text>
              <Text
                className="text-ink font-display uppercase"
                style={{ fontSize: 22, lineHeight: 24, letterSpacing: 0.5 }}
              >
                {service}
              </Text>
            </View>
          )}
          {barber && (
            <View>
              <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-1">
                BARBERO
              </Text>
              <Text
                className="text-ink font-display uppercase"
                style={{ fontSize: 22, lineHeight: 24, letterSpacing: 0.5 }}
              >
                {barber}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="px-6 pb-8 pt-4">
        <Button label="Volver a mis turnos" onPress={() => router.replace('/(client)' as never)} />
      </View>
    </SafeAreaView>
  );
}
