import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/data/session';
import { useCurrentTenantId } from '@/data/tenant';
import { useBarbers } from '@/data/barbers';
import {
  useBarberSchedules,
  useCreateSchedule,
  useDeleteSchedule,
} from '@/data/schedules';
import { BarberPoleLoader } from '@/ui/BarberPoleLoader';
import { Button } from '@/ui/Button';
import { PressableScale } from '@/ui/PressableScale';
import { AdminNav } from '@/ui/AdminNav';
import { useToast } from '@/ui/ToastProvider';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_INDEX = [1, 2, 3, 4, 5, 6, 0]; // display order → weekday value

export default function SchedulesAdmin() {
  const { session } = useSession();
  const tenantQ = useCurrentTenantId(session?.user.id);
  const barbersQ = useBarbers({ includeInactive: false });
  const [barberId, setBarberId] = useState<string | null>(null);
  const effectiveBarberId = barberId ?? barbersQ.data?.[0]?.id ?? null;
  const schedulesQ = useBarberSchedules(effectiveBarberId ?? undefined);
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const toast = useToast();
  const [adding, setAdding] = useState<number | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-ink font-display text-3xl">HORARIOS</Text>
      </View>

      {barbersQ.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <BarberPoleLoader />
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          >
            {(barbersQ.data ?? []).map((b) => {
              const active = b.id === effectiveBarberId;
              return (
                <PressableScale key={b.id} onPress={() => setBarberId(b.id)}>
                  <View
                    className={`rounded-md border px-4 py-2 ${active ? 'border-pole-red bg-pole-red' : 'border-border bg-surface-1'}`}
                  >
                    <Text
                      className={`font-semibold ${active ? 'text-pole-white' : 'text-ink'}`}
                    >
                      {b.display_name}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </ScrollView>

          <ScrollView className="flex-1 mt-4" contentContainerStyle={{ paddingBottom: 24 }}>
            {DAY_INDEX.map((weekday, idx) => {
              const dayBlocks =
                schedulesQ.data?.filter((s) => s.weekday === weekday) ?? [];
              return (
                <View key={weekday} className="px-6 py-3 border-b border-border">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-ink font-display text-lg">{DAYS[idx]}</Text>
                    <PressableScale onPress={() => setAdding(weekday)}>
                      <Text className="text-pole-red font-semibold">+ Añadir tramo</Text>
                    </PressableScale>
                  </View>
                  {dayBlocks.length === 0 ? (
                    <Text className="text-ink-subtle">Cerrado</Text>
                  ) : (
                    dayBlocks.map((s) => (
                      <View
                        key={s.id}
                        className="flex-row items-center justify-between py-1"
                      >
                        <Text className="text-ink">
                          {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                        </Text>
                        <PressableScale
                          onPress={() => {
                            Alert.alert('Eliminar tramo', '¿Seguro?', [
                              { text: 'Cancelar', style: 'cancel' },
                              {
                                text: 'Eliminar',
                                style: 'destructive',
                                onPress: () =>
                                  deleteSchedule.mutate(
                                    { id: s.id, barber_id: s.barber_id },
                                    {
                                      onError: (e) =>
                                        toast.show({
                                          variant: 'destructive',
                                          message: e instanceof Error ? e.message : 'Error',
                                        }),
                                    },
                                  ),
                              },
                            ]);
                          }}
                        >
                          <Text className="text-destructive">Eliminar</Text>
                        </PressableScale>
                      </View>
                    ))
                  )}
                </View>
              );
            })}
          </ScrollView>
        </>
      )}

      <AdminNav />

      {adding !== null && tenantQ.data && effectiveBarberId && (
        <AddSlotModal
          weekday={adding}
          tenantId={tenantQ.data}
          barberId={effectiveBarberId}
          onClose={() => setAdding(null)}
          onSave={async (start, end) => {
            try {
              await createSchedule.mutateAsync({
                tenant_id: tenantQ.data!,
                barber_id: effectiveBarberId,
                weekday: adding!,
                start_time: start,
                end_time: end,
              });
              toast.show({ variant: 'success', message: 'Tramo añadido' });
              setAdding(null);
            } catch (e) {
              toast.show({
                variant: 'destructive',
                message: e instanceof Error ? e.message : 'Error',
              });
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

function AddSlotModal({
  weekday,
  onClose,
  onSave,
}: {
  weekday: number;
  tenantId: string;
  barberId: string;
  onClose: () => void;
  onSave: (start: string, end: string) => void | Promise<void>;
}) {
  const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('14:00');
  const dayLabel = DAYS[DAY_INDEX.indexOf(weekday)];

  function valid(v: string) {
    return /^\d{2}:\d{2}$/.test(v);
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 items-center justify-center px-6">
        <View className="w-full max-w-[440px] bg-surface-1 border border-border rounded-md p-6">
          <Text className="text-ink font-display text-2xl mb-4">
            Tramo · {dayLabel}
          </Text>
          <Text className="text-ink-muted text-xs uppercase mb-1">Inicio (HH:MM)</Text>
          <TextInput
            value={start}
            onChangeText={setStart}
            placeholder="10:00"
            placeholderTextColor="#6C6C68"
            className="border border-border bg-surface-2 rounded-md px-3 py-2 mb-3 text-ink"
          />
          <Text className="text-ink-muted text-xs uppercase mb-1">Fin (HH:MM)</Text>
          <TextInput
            value={end}
            onChangeText={setEnd}
            placeholder="14:00"
            placeholderTextColor="#6C6C68"
            className="border border-border bg-surface-2 rounded-md px-3 py-2 mb-5 text-ink"
          />
          <View className="flex-row gap-3">
            <View style={{ flex: 1 }}>
              <Button label="Cancelar" variant="secondary" onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Guardar"
                onPress={() => {
                  if (!valid(start) || !valid(end) || start >= end) return;
                  void onSave(`${start}:00`, `${end}:00`);
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
