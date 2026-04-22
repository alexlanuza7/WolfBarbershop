import { View, Text } from 'react-native';
import Svg, { Path, Rect, Line } from 'react-native-svg';

type Props = { title: string; subtitle?: string; icon?: 'calendar' | 'scissors' | 'clock' };

// Iconografía industrial: squared, trazo fino, sin contenedor circular.
// Se abandona la marca roja-tipo-logo dentro del icono para reservar el rojo
// a señales activas (estado/acento). Los glifos viven como ornamento tipográfico.
function Icon({ kind }: { kind: NonNullable<Props['icon']> }) {
  const stroke = '#6E6A66';
  if (kind === 'calendar') {
    return (
      <Svg width={56} height={56} viewBox="0 0 48 48">
        <Rect x="8" y="12" width="32" height="28" stroke={stroke} strokeWidth="1.5" fill="none" />
        <Line x1="8" y1="20" x2="40" y2="20" stroke={stroke} strokeWidth="1.5" />
        <Line x1="16" y1="8" x2="16" y2="14" stroke={stroke} strokeWidth="1.5" />
        <Line x1="32" y1="8" x2="32" y2="14" stroke={stroke} strokeWidth="1.5" />
        <Rect x="14" y="26" width="5" height="5" fill={stroke} />
      </Svg>
    );
  }
  if (kind === 'scissors') {
    return (
      <Svg width={56} height={56} viewBox="0 0 48 48">
        <Path
          d="M14 12 L28 26 M34 12 L20 26 M14 36 C14 38 16 40 18 40 C20 40 22 38 22 36 C22 34 20 32 18 32 C16 32 14 34 14 36 Z M26 36 C26 38 28 40 30 40 C32 40 34 38 34 36 C34 34 32 32 30 32 C28 32 26 34 26 36 Z"
          stroke={stroke}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="square"
        />
      </Svg>
    );
  }
  return (
    <Svg width={56} height={56} viewBox="0 0 48 48">
      <Rect x="8" y="8" width="32" height="32" stroke={stroke} strokeWidth="1.5" fill="none" />
      <Line x1="24" y1="14" x2="24" y2="24" stroke={stroke} strokeWidth="1.5" />
      <Line x1="24" y1="24" x2="30" y2="28" stroke={stroke} strokeWidth="1.5" />
    </Svg>
  );
}

export function EmptyState({ title, subtitle, icon = 'calendar' }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Icon kind={icon} />
      <Text
        className="text-ink font-display-black uppercase mt-6 text-center"
        style={{ fontSize: 24, lineHeight: 26, letterSpacing: 0.5 }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className="text-ink-subtle text-center mt-2 tracking-wide"
          style={{ fontFamily: 'Archivo', fontSize: 13, lineHeight: 18 }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
