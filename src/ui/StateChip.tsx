import { View, Text } from 'react-native';
import type { AppointmentState } from '@/domain/appointmentState';
import { STATE_LABEL_ES } from '@/domain/appointmentState';

type ChipStyle = { dot: string; fg: string };

// Sistema de chips rediseñado: rectángulo crudo, sin pill/rounded, sin icono.
// Un punto de color como señal + label en mayúsculas. Pole-red solo para estados
// activos (in_chair/in_service). Grises para estados neutros/finales para no
// saturar de color.
const STYLES: Record<AppointmentState, ChipStyle> = {
  booked: { dot: '#6E6A66', fg: '#AAA6A2' },
  confirmed: { dot: '#F4F2F0', fg: '#F4F2F0' },
  checked_in: { dot: '#F4F2F0', fg: '#F4F2F0' },
  waiting: { dot: '#D98A2B', fg: '#D98A2B' },
  in_chair: { dot: '#C0342B', fg: '#C0342B' },
  in_service: { dot: '#C0342B', fg: '#C0342B' },
  finished_pending_payment: { dot: '#D98A2B', fg: '#D98A2B' },
  paid: { dot: '#3DA55C', fg: '#3DA55C' },
  cancelled: { dot: '#6E6A66', fg: '#6E6A66' },
  no_show: { dot: '#6E6A66', fg: '#6E6A66' },
};

export function StateChip({ state }: { state: AppointmentState }) {
  const style = STYLES[state];
  const label = STATE_LABEL_ES[state];
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <View style={{ width: 6, height: 6, backgroundColor: style.dot }} />
      <Text
        style={{
          color: style.fg,
          fontSize: 11,
          fontFamily: 'Archivo-Bold',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
