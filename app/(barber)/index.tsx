import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActionSheetIOS,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/data/session';
import { useCurrentBarberId } from '@/data/barbers';
import { useBarberQueue, useTransitionState } from '@/data/appointments';
import { useRealtimeAppointments } from '@/data/useRealtimeAppointments';
import { StateChip } from '@/ui/StateChip';
import { BarberPoleLoader } from '@/ui/BarberPoleLoader';
import { EmptyState } from '@/ui/EmptyState';
import { SwipeableRow } from '@/ui/SwipeableRow';
import { useToast } from '@/ui/ToastProvider';
import { nextStates, canTransition } from '@/domain/stateMachine';
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

function formatDayLong(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d
    .toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })
    .toUpperCase();
}

const ACTIVE: AppointmentState[] = ['in_chair', 'in_service'];
const DIMMED: AppointmentState[] = ['paid', 'cancelled', 'no_show'];

export default function BarberHome() {
  const { session } = useSession();
  const barberQ = useCurrentBarberId(session?.user.id);
  const day = todayIso();
  const barberId = barberQ.data ?? undefined;
  const queueQ = useBarberQueue(barberId, day);
  const transition = useTransitionState();
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  useRealtimeAppointments({
    scope: 'barber',
    barberId,
    invalidate: [['appointments', 'barber', barberId, day]],
  });

  const items = (queueQ.data ?? []).slice().sort((a, b) => {
    const aActive = ACTIVE.includes(a.state) ? 0 : DIMMED.includes(a.state) ? 2 : 1;
    const bActive = ACTIVE.includes(b.state) ? 0 : DIMMED.includes(b.state) ? 2 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return a.starts_at.localeCompare(b.starts_at);
  });

  const activeCount = items.filter((i) => ACTIVE.includes(i.state)).length;

  function runTransition(appt: Appointment, target: AppointmentState, withUndo = false) {
    const prev = appt.state;
    setBusyId(appt.id);
    transition
      .mutateAsync({ id: appt.id, next: target })
      .then(() => {
        if (withUndo && canTransition(target, prev)) {
          toast.show({
            variant: 'info',
            message: `Movido a ${STATE_LABEL_ES[target]}`,
            action: {
              label: 'Deshacer',
              onPress: () => transition.mutate({ id: appt.id, next: prev }),
            },
          });
        } else {
          toast.show({ variant: 'success', message: `${STATE_LABEL_ES[target]}` });
        }
      })
      .catch((e) =>
        toast.show({
          variant: 'destructive',
          message: e instanceof Error ? e.message : 'No se pudo actualizar',
        }),
      )
      .finally(() => setBusyId(null));
  }

  function openActions(appt: Appointment) {
    const next = nextStates(appt.state);
    if (next.length === 0) return;
    const labels = next.map((s) => STATE_LABEL_ES[s]);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...labels, 'Cancelar'], cancelButtonIndex: labels.length },
        (idx) => {
          if (idx < labels.length) runTransition(appt, next[idx]!);
        },
      );
    } else {
      Alert.alert(STATE_LABEL_ES[appt.state], 'Cambiar estado a:', [
        ...next.map((s) => ({ text: STATE_LABEL_ES[s], onPress: () => runTransition(appt, s) })),
        { text: 'Cancelar', style: 'cancel' as const },
      ]);
    }
  }

  const loading = queueQ.isLoading || barberQ.isLoading;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-bg">
        {/* Cabecera signage — tamaño grande para lectura a distancia (iPad 60-90cm) */}
        <View className="px-6 pt-4 pb-5">
          <View className="flex-row items-center gap-2 mb-2">
            <View style={{ width: 6, height: 6, backgroundColor: '#C0342B' }} />
            <Text className="text-ink-subtle text-xs tracking-widest uppercase">
              {formatDayLong(day)}
            </Text>
          </View>
          <Text
            className="text-ink font-display-black uppercase"
            style={{ fontSize: 56, lineHeight: 56, letterSpacing: 0.5 }}
          >
            Cola
          </Text>
        </View>

        {/* Contador editorial — 2 columnas, separador vertical */}
        <View
          className="flex-row mx-6"
          style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#2D2826' }}
        >
          <View className="flex-1 py-4">
            <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-1">
              TOTAL
            </Text>
            <Text
              className="text-ink font-display-black"
              style={{ fontSize: 32, lineHeight: 32, fontVariant: ['tabular-nums'] }}
            >
              {items.length}
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#2D2826' }} />
          <View className="flex-1 py-4 pl-4">
            <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-1">
              EN SILLA
            </Text>
            <Text
              className="font-display-black"
              style={{
                color: activeCount > 0 ? '#C0342B' : '#F4F2F0',
                fontSize: 32,
                lineHeight: 32,
                fontVariant: ['tabular-nums'],
              }}
            >
              {activeCount}
            </Text>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <BarberPoleLoader />
          </View>
        ) : items.length === 0 ? (
          <EmptyState icon="scissors" title="Cola vacía" subtitle="No hay citas para hoy." />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(a) => a.id}
            contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 8, paddingBottom: 32 }}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: '#2D2826' }} />
            )}
            refreshControl={
              <RefreshControl
                refreshing={queueQ.isRefetching}
                onRefresh={() => queueQ.refetch()}
                tintColor="#C0342B"
              />
            }
            renderItem={({ item }) => {
              const isActive = ACTIVE.includes(item.state);
              const isDimmed = DIMMED.includes(item.state);
              const isBusy = busyId === item.id;
              const next = nextStates(item.state);
              const canSwipe = next.length > 0 && !isDimmed;
              const row = (
                <Pressable
                  onPress={() => openActions(item)}
                  accessibilityRole="button"
                  style={{
                    backgroundColor: isActive ? '#221E1D' : 'transparent',
                    opacity: isDimmed ? 0.45 : isBusy ? 0.6 : 1,
                  }}
                >
                  <View className="flex-row items-center py-5 px-6 gap-5">
                    {/* Número de posición / hora — signage grande */}
                    <Text
                      className="font-display-black"
                      style={{
                        color: isActive ? '#C0342B' : '#F4F2F0',
                        fontSize: 36,
                        lineHeight: 36,
                        minWidth: 96,
                        fontVariant: ['tabular-nums'],
                        letterSpacing: 0.5,
                      }}
                    >
                      {formatTime(item.starts_at)}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-1">
                        REF · {item.id.slice(0, 6).toUpperCase()}
                      </Text>
                      <StateChip state={item.state} />
                    </View>
                  </View>
                </Pressable>
              );
              return (
                <SwipeableRow
                  enabled={canSwipe}
                  onSwipe={() => runTransition(item, next[0]!, true)}
                  actionLabel={`→ ${STATE_LABEL_ES[next[0] ?? item.state]}`}
                >
                  {row}
                </SwipeableRow>
              );
            }}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
