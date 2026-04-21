import { useState } from 'react';
import { View, Text, FlatList, Pressable, ActionSheetIOS, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/data/session';
import { useCurrentBarberId } from '@/data/barbers';
import { useBarberQueue, useTransitionState } from '@/data/appointments';
import { StateChip } from '@/ui/StateChip';
import { BarberPoleLoader } from '@/ui/BarberPoleLoader';
import { nextStates } from '@/domain/stateMachine';
import type { Appointment } from '@/domain/appointment';
import type { AppointmentState } from '@/domain/appointmentState';
import { STATE_LABEL_ES } from '@/domain/appointmentState';

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

const ACTIVE: AppointmentState[] = ['in_chair', 'in_service'];
const DIMMED: AppointmentState[] = ['paid', 'cancelled', 'no_show'];

export default function BarberHome() {
  const { session } = useSession();
  const barberQ = useCurrentBarberId(session?.user.id);
  const day = todayIso();
  const queueQ = useBarberQueue(barberQ.data ?? undefined, day);
  const transition = useTransitionState();
  const [busyId, setBusyId] = useState<string | null>(null);

  const items = (queueQ.data ?? []).slice().sort((a, b) => {
    const aActive = ACTIVE.includes(a.state) ? 0 : DIMMED.includes(a.state) ? 2 : 1;
    const bActive = ACTIVE.includes(b.state) ? 0 : DIMMED.includes(b.state) ? 2 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return a.starts_at.localeCompare(b.starts_at);
  });

  function openActions(appt: Appointment) {
    const next = nextStates(appt.state);
    if (next.length === 0) return;
    const labels = next.map((s) => STATE_LABEL_ES[s]);
    const run = (target: AppointmentState) => {
      setBusyId(appt.id);
      transition
        .mutateAsync({ id: appt.id, next: target })
        .catch((e) => Alert.alert('No se pudo actualizar', e instanceof Error ? e.message : 'Error'))
        .finally(() => setBusyId(null));
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...labels, 'Cancelar'], cancelButtonIndex: labels.length },
        (idx) => {
          if (idx < labels.length) run(next[idx]!);
        },
      );
    } else {
      Alert.alert(
        'Cambiar estado',
        STATE_LABEL_ES[appt.state],
        [...next.map((s) => ({ text: STATE_LABEL_ES[s], onPress: () => run(s) })), { text: 'Cancelar', style: 'cancel' as const }],
      );
    }
  }

  const loading = queueQ.isLoading || barberQ.isLoading;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-ink font-display text-4xl">COLA HOY</Text>
        <Text className="text-ink-muted mt-1">
          {items.length} {items.length === 1 ? 'cita' : 'citas'} · {day}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <BarberPoleLoader />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-ink-muted text-center">Sin citas para hoy</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 10 }}
          renderItem={({ item }) => {
            const isActive = ACTIVE.includes(item.state);
            const isDimmed = DIMMED.includes(item.state);
            const isBusy = busyId === item.id;
            return (
              <Pressable
                onPress={() => openActions(item)}
                className={`rounded-md border flex-row items-stretch ${isActive ? 'border-pole-red bg-surface-2' : 'border-border bg-surface-1'}`}
                style={{ opacity: isDimmed ? 0.5 : isBusy ? 0.6 : 1 }}
              >
                {isActive && <View className="w-1 bg-pole-red rounded-l-md" />}
                <View className="flex-1 p-4 flex-row items-center justify-between">
                  <View>
                    <Text className="text-ink text-lg font-semibold">{formatTime(item.starts_at)}</Text>
                    <Text className="text-ink-muted text-sm mt-1">{item.id.slice(0, 8)}</Text>
                  </View>
                  <StateChip state={item.state} />
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
