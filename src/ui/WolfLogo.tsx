import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { View, Text } from 'react-native';

export function WolfLogo({ size = 64 }: { size?: number }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={s} height={s} viewBox="0 0 64 64">
        <Circle cx="32" cy="32" r="30" fill="#0A0A0B" stroke="#C0342B" strokeWidth="2" />
        <Rect x="22" y="16" width="20" height="32" rx="10" fill="#FFFFFF" />
        <Path d="M22 22 L42 22 L42 26 L22 26 Z" fill="#C0342B" />
        <Path d="M22 30 L42 30 L42 34 L22 34 Z" fill="#1F3A8A" />
        <Path d="M22 38 L42 38 L42 42 L22 42 Z" fill="#C0342B" />
      </Svg>
    </View>
  );
}

export function WolfWordmark() {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text className="text-ink font-display text-4xl tracking-widest">WOLF</Text>
      <Text className="text-pole-red font-display text-sm tracking-[0.3em] mt-1">BARBERSHOP</Text>
    </View>
  );
}
