import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

type Props = { title: string; subtitle?: string; icon?: 'calendar' | 'scissors' | 'clock' };

function Icon({ kind }: { kind: NonNullable<Props['icon']> }) {
  if (kind === 'calendar') {
    return (
      <Svg width={72} height={72} viewBox="0 0 48 48">
        <Circle cx="24" cy="24" r="22" fill="#151517" stroke="#2A2A2E" strokeWidth="2" />
        <Path d="M14 18 H34 V34 H14 Z" stroke="#C0342B" strokeWidth="2" fill="none" />
        <Path d="M14 22 H34" stroke="#C0342B" strokeWidth="2" />
        <Path d="M18 16 V20 M30 16 V20" stroke="#A8A8A3" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }
  if (kind === 'scissors') {
    return (
      <Svg width={72} height={72} viewBox="0 0 48 48">
        <Circle cx="24" cy="24" r="22" fill="#151517" stroke="#2A2A2E" strokeWidth="2" />
        <Circle cx="18" cy="30" r="4" stroke="#C0342B" strokeWidth="2" fill="none" />
        <Circle cx="30" cy="30" r="4" stroke="#1F3A8A" strokeWidth="2" fill="none" />
        <Path d="M21 27 L34 14 M27 27 L14 14" stroke="#F5F5F2" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={72} height={72} viewBox="0 0 48 48">
      <Circle cx="24" cy="24" r="22" fill="#151517" stroke="#2A2A2E" strokeWidth="2" />
      <Circle cx="24" cy="24" r="10" stroke="#C0342B" strokeWidth="2" fill="none" />
      <Path d="M24 18 V24 L28 28" stroke="#F5F5F2" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function EmptyState({ title, subtitle, icon = 'calendar' }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Icon kind={icon} />
      <Text className="text-ink font-display text-xl mt-4 text-center">{title}</Text>
      {subtitle && <Text className="text-ink-muted text-center mt-2">{subtitle}</Text>}
    </View>
  );
}
