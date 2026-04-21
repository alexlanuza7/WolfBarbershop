import { useState } from 'react';
import { View, Text, FlatList, TextInput, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/data/session';
import { useCurrentTenantId } from '@/data/tenant';
import {
  useBarbers,
  useCreateBarber,
  useUpdateBarber,
  useToggleBarberActive,
} from '@/data/barbers';
import { BarberPoleLoader } from '@/ui/BarberPoleLoader';
import { Button } from '@/ui/Button';
import { PressableScale } from '@/ui/PressableScale';
import { EmptyState } from '@/ui/EmptyState';
import { AdminNav } from '@/ui/AdminNav';
import { useToast } from '@/ui/ToastProvider';
import type { Barber } from '@/domain/barber';

export default function BarbersAdmin() {
  const { session } = useSession();
  const tenantQ = useCurrentTenantId(session?.user.id);
  const barbersQ = useBarbers({ includeInactive: true });
  const toggle = useToggleBarberActive();
  const toast = useToast();
  const [editing, setEditing] = useState<Barber | 'new' | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-ink font-display text-3xl">BARBEROS</Text>
        <PressableScale onPress={() => setEditing('new')}>
          <View className="bg-pole-red rounded-md px-3 py-2">
            <Text className="text-pole-white font-semibold">+ Nuevo</Text>
          </View>
        </PressableScale>
      </View>

      {barbersQ.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <BarberPoleLoader />
        </View>
      ) : (barbersQ.data ?? []).length === 0 ? (
        <EmptyState icon="scissors" title="Sin barberos" subtitle="Añade al primero." />
      ) : (
        <FlatList
          data={barbersQ.data}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 10 }}
          renderItem={({ item }) => (
            <PressableScale onPress={() => setEditing(item)}>
              <View
                className={`rounded-md border p-4 flex-row items-center gap-4 ${item.active ? 'border-border bg-surface-1' : 'border-border bg-surface-1 opacity-50'}`}
              >
                <View className="w-12 h-12 rounded-full bg-surface-2 items-center justify-center">
                  <Text className="text-ink font-display text-lg">
                    {item.display_name.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-ink font-semibold text-base flex-1">
                  {item.display_name}
                </Text>
                <Switch
                  value={item.active}
                  onValueChange={(v) =>
                    toggle.mutate(
                      { id: item.id, active: v },
                      {
                        onError: (e) =>
                          toast.show({
                            variant: 'destructive',
                            message: e instanceof Error ? e.message : 'Error',
                          }),
                      },
                    )
                  }
                  trackColor={{ true: '#C0342B', false: '#2A2A2E' }}
                />
              </View>
            </PressableScale>
          )}
        />
      )}

      <AdminNav />

      {editing && tenantQ.data && (
        <BarberEditor
          tenantId={tenantQ.data}
          barber={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </SafeAreaView>
  );
}

function BarberEditor({
  tenantId,
  barber,
  onClose,
}: {
  tenantId: string;
  barber: Barber | null;
  onClose: () => void;
}) {
  const create = useCreateBarber();
  const update = useUpdateBarber();
  const toast = useToast();
  const [name, setName] = useState(barber?.display_name ?? '');
  const pending = create.isPending || update.isPending;

  async function submit() {
    if (!name.trim()) {
      toast.show({ variant: 'warning', message: 'Nombre requerido' });
      return;
    }
    try {
      if (barber) {
        await update.mutateAsync({ id: barber.id, display_name: name.trim() });
        toast.show({ variant: 'success', message: 'Actualizado' });
      } else {
        await create.mutateAsync({ tenant_id: tenantId, display_name: name.trim() });
        toast.show({ variant: 'success', message: 'Creado' });
      }
      onClose();
    } catch (e) {
      toast.show({
        variant: 'destructive',
        message: e instanceof Error ? e.message : 'Error',
      });
    }
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 items-center justify-center px-6">
        <View className="w-full max-w-[440px] bg-surface-1 border border-border rounded-md p-6">
          <Text className="text-ink font-display text-2xl mb-4">
            {barber ? 'Editar barbero' : 'Nuevo barbero'}
          </Text>
          <Text className="text-ink-muted text-xs uppercase mb-1">Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Alex"
            placeholderTextColor="#6C6C68"
            className="border border-border bg-surface-2 rounded-md px-3 py-2 mb-5 text-ink"
          />
          <View className="flex-row gap-3">
            <View style={{ flex: 1 }}>
              <Button label="Cancelar" variant="secondary" onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Guardar" onPress={submit} loading={pending} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
