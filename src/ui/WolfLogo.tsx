import Svg, { Rect, Line } from 'react-native-svg';
import { View, Text } from 'react-native';

export function WolfLogo({ size = 64 }: { size?: number }) {
  const s = size;
  return (
    <View style={{ width: s, height: s * 2, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={s} height={s * 2} viewBox="0 0 32 64">
        {/* Barber pole — slab vertical crudo, sin redondeados */}
        <Rect x="6" y="4" width="20" height="4" fill="#2D2826" />
        <Rect x="6" y="56" width="20" height="4" fill="#2D2826" />
        <Rect x="8" y="8" width="16" height="48" fill="#F4F2F0" />
        {/* Bandas diagonales pintadas */}
        <Line x1="8" y1="12" x2="24" y2="20" stroke="#C0342B" strokeWidth="3" />
        <Line x1="8" y1="20" x2="24" y2="28" stroke="#1F3A8A" strokeWidth="3" />
        <Line x1="8" y1="28" x2="24" y2="36" stroke="#C0342B" strokeWidth="3" />
        <Line x1="8" y1="36" x2="24" y2="44" stroke="#1F3A8A" strokeWidth="3" />
        <Line x1="8" y1="44" x2="24" y2="52" stroke="#C0342B" strokeWidth="3" />
      </Svg>
    </View>
  );
}

export function WolfWordmark({ scale = 1 }: { scale?: number }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text
        className="text-pole-white font-display-black tracking-widest"
        style={{ fontSize: 56 * scale, lineHeight: 56 * scale, letterSpacing: 56 * scale * 0.12 }}
      >
        WOLF
      </Text>
      <View className="flex-row items-center mt-1" style={{ gap: 8 * scale }}>
        <View style={{ height: 1, width: 24 * scale, backgroundColor: '#C0342B' }} />
        <Text
          className="text-pole-red font-semibold tracking-widest"
          style={{ fontSize: 10 * scale, letterSpacing: 10 * scale * 0.2 }}
        >
          BARBERSHOP
        </Text>
        <View style={{ height: 1, width: 24 * scale, backgroundColor: '#C0342B' }} />
      </View>
    </View>
  );
}
