import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Modal, Alert, Pressable } from 'react-native';
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

const DAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
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
      <View className="px-6 pt-4 pb-6">
        <View className="flex-row items-center gap-2 mb-2">
          <View style={{ width: 6, height: 6, backgroundColor: '#C0342B' }} />
          <Text className="text-ink-subtle text-xs tracking-widest uppercase">
            CALENDARIO
          </Text>
        </View>
        <Text
          className="text-ink font-display-black uppercase"
          style={{ fontSize: 44, lineHeight: 44, letterSpacing: 0.5 }}
        >
          Horarios
        </Text>
      </View>

      {barbersQ.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <BarberPoleLoader />
        </View>
      ) : (
        <>
          {/* Selector barberos — chips planos sin pill */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 6 }}
          >
            {(barbersQ.data ?? []).map((b) => {
              const active = b.id === effectiveBarberId;
              return (
                <Pressable
                  key={b.id}
                  onPress={() => setBarberId(b.id)}
                  accessibilityRole="button"
                >
                  <View
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      backgroundColor: active ? '#C0342B' : '#171514',
                      borderWidth: 1,
                      borderColor: active ? '#C0342B' : '#2D2826',
                    }}
                  >
                    <Text
                      className="font-display-black uppercase"
                      style={{
                        color: active ? '#FFFFFF' : '#F4F2F0',
                        fontSize: 13,
                        letterSpacing: 1.2,
                      }}
                    >
                      {b.display_name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView className="flex-1 mt-6" contentContainerStyle={{ paddingBottom: 24 }}>
            {DAY_INDEX.map((weekday, idx) => {
              const dayBlocks =
                schedulesQ.data?.filter((s) => s.weekday === weekday) ?? [];
              return (
                <View
                  key={weekday}
                  className="px-6 py-4"
                  style={{ borderTopWidth: 1, borderColor: '#2D2826' }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                      <Text
                        className="text-ink font-display-black"
                        style={{ fontSize: 20, lineHeight: 20, letterSpacing: 0.5 }}
                      >
                        {DAYS[idx]}
                      </Text>
                      {dayBlocks.length === 0 && (
                        <Text className="text-ink-subtle text-xs tracking-widest uppercase">
                          CERRADO
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => setAdding(weekday)}
                      accessibilityRole="button"
                      accessibilityLabel={`Añadir tramo ${DAYS[idx]}`}
                    >
                      <Text
                        className="font-display-black"
                        style={{
                          color: '#C0342B',
                          fontSize: 11,
                          letterSpacing: 1.4,
                          textTransform: 'uppercase',
                        }}
                      >
                        + TRAMO
                      </Text>
                    </Pressable>
                  </View>
                  {dayBlocks.map((s) => (
                    <View
                      key={s.id}
                      className="flex-row items-center justify-between py-2"
                    >
                      <Text
                        className="text-ink font-display"
                        style={{ fontSize: 22, lineHeight: 22, letterSpacing: 0.5 }}
                      >
                        {s.start_time.slice(0, 5)}{'  '}—{'  '}{s.end_time.slice(0, 5)}
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
                        <Text
                          style={{
                            color: '#6E6A66',
                            fontFamily: 'Archivo-Bold',
                            fontSize: 11,
                            letterSpacing: 1.4,
                            textTransform: 'uppercase',
                          }}
                        >
                          ELIMINAR
                        </Text>
                      </PressableScale>
                    </View>
                  ))}
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
  onSave: (_start: string, _end: string) => void | Promise<void>;
}) {
  const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('14:00');
  const dayLabel = DAYS[DAY_INDEX.indexOf(weekday)];

  function valid(v: string) {
    return /^\d{2}:\d{2}$/.test(v);
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 items-center justify-center px-6">
        <View
          className="w-full bg-bg p-6"
          style={{ maxWidth: 440, borderWidth: 1, borderColor: '#2D2826' }}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <View style={{ width: 4, height: 4, backgroundColor: '#C0342B' }} />
            <Text className="text-ink-subtle text-xs tracking-widest uppercase">
              TRAMO · {dayLabel}
            </Text>
          </View>
          <Text
            className="text-ink font-display-black uppercase mb-6"
            style={{ fontSize: 28, lineHeight: 30, letterSpacing: 0.5 }}
          >
            Añadir
          </Text>
          <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-2">
            Inicio · HH:MM
          </Text>
          <TextInput
            value={start}
            onChangeText={setStart}
            placeholder="10:00"
            placeholderTextColor="#6E6A66"
            className="bg-surface-1 px-4 py-3 mb-4 text-ink"
            style={{ fontFamily: 'Archivo' }}
          />
          <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-2">
            Fin · HH:MM
          </Text>
          <TextInput
            value={end}
            onChangeText={setEnd}
            placeholder="14:00"
            placeholderTextColor="#6E6A66"
            className="bg-surface-1 px-4 py-3 mb-5 text-ink"
            style={{ fontFamily: 'Archivo' }}
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
