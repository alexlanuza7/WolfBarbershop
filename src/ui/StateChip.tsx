import { View, Text } from 'react-native';
import {
  Calendar,
  CalendarCheck,
  DoorOpen,
  Clock,
  Scissors,
  Wand,
  Wallet,
  CheckCircle,
  XCircle,
  UserX,
} from 'lucide-react-native';
import type { AppointmentState } from '@/domain/appointmentState';
import { STATE_LABEL_ES } from '@/domain/appointmentState';

type ChipStyle = { bg: string; fg: string; Icon: typeof Calendar };

const STYLES: Record<AppointmentState, ChipStyle> = {
  booked: { bg: '#1E1E21', fg: '#A8A8A3', Icon: Calendar },
  confirmed: { bg: '#1F3A8A', fg: '#FFFFFF', Icon: CalendarCheck },
  checked_in: { bg: '#1F3A8A', fg: '#FFFFFF', Icon: DoorOpen },
  waiting: { bg: '#1E1E21', fg: '#1F3A8A', Icon: Clock },
  in_chair: { bg: '#C0342B', fg: '#FFFFFF', Icon: Scissors },
  in_service: { bg: '#C0342B', fg: '#FFFFFF', Icon: Wand },
  finished_pending_payment: { bg: '#F59E0B', fg: '#0A0A0B', Icon: Wallet },
  paid: { bg: '#10B981', fg: '#0A0A0B', Icon: CheckCircle },
  cancelled: { bg: '#DC2626', fg: '#FFFFFF', Icon: XCircle },
  no_show: { bg: '#DC2626', fg: '#FFFFFF', Icon: UserX },
};

export function StateChip({ state }: { state: AppointmentState }) {
  const style = STYLES[state];
  const label = STATE_LABEL_ES[state];
  const { Icon } = style;
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: style.bg,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 9999,
      }}
    >
      <Icon size={14} color={style.fg} />
      <Text style={{ color: style.fg, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}
