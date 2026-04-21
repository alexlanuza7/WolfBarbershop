import { useState } from 'react';
import { View, Text, FlatList, TextInput, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/data/session';
import { useCurrentTenantId } from '@/data/tenant';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useToggleServiceActive,
} from '@/data/services';
import { BarberPoleLoader } from '@/ui/BarberPoleLoader';
import { Button } from '@/ui/Button';
import { PressableScale } from '@/ui/PressableScale';
import { EmptyState } from '@/ui/EmptyState';
import { AdminNav } from '@/ui/AdminNav';
import { useToast } from '@/ui/ToastProvider';
import type { Service } from '@/domain/service';

function formatPrice(cents: number) {
  return `${(cents / 100).toFixed(2)} €`;
}

export default function ServicesAdmin() {
  const { session } = useSession();
  const tenantQ = useCurrentTenantId(session?.user.id);
  const servicesQ = useServices({ includeInactive: true });
  const toggle = useToggleServiceActive();
  const toast = useToast();
  const [editing, setEditing] = useState<Service | 'new' | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-ink font-display text-3xl">SERVICIOS</Text>
        <PressableScale onPress={() => setEditing('new')}>
          <View className="bg-pole-red rounded-md px-3 py-2">
            <Text className="text-pole-white font-semibold">+ Nuevo</Text>
          </View>
        </PressableScale>
      </View>

      {servicesQ.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <BarberPoleLoader />
        </View>
      ) : (servicesQ.data ?? []).length === 0 ? (
        <EmptyState icon="scissors" title="Sin servicios" subtitle="Crea el primero." />
      ) : (
        <FlatList
          data={servicesQ.data}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 10 }}
          renderItem={({ item }) => (
            <PressableScale onPress={() => setEditing(item)}>
              <View
                className={`rounded-md border p-4 flex-row items-center justify-between ${item.active ? 'border-border bg-surface-1' : 'border-border bg-surface-1 opacity-50'}`}
              >
                <View className="flex-1">
                  <Text className="text-ink font-semibold text-base">{item.name}</Text>
                  <Text className="text-ink-muted mt-1">
                    {item.duration_min} min · {formatPrice(item.price_cents)}
                  </Text>
                </View>
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
        <ServiceEditor
          tenantId={tenantQ.data}
          service={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </SafeAreaView>
  );
}

function ServiceEditor({
  tenantId,
  service,
  onClose,
}: {
  tenantId: string;
  service: Service | null;
  onClose: () => void;
}) {
  const create = useCreateService();
  const update = useUpdateService();
  const toast = useToast();
  const [name, setName] = useState(service?.name ?? '');
  const [duration, setDuration] = useState(String(service?.duration_min ?? 30));
  const [priceEur, setPriceEur] = useState(
    service ? (service.price_cents / 100).toFixed(2) : '10.00',
  );

  const pending = create.isPending || update.isPending;

  async function submit() {
    const dm = parseInt(duration, 10);
    const pc = Math.round(parseFloat(priceEur.replace(',', '.')) * 100);
    if (!name.trim() || !Number.isFinite(dm) || dm <= 0 || !Number.isFinite(pc) || pc < 0) {
      toast.show({ variant: 'warning', message: 'Datos inválidos' });
      return;
    }
    try {
      if (service) {
        await update.mutateAsync({
          id: service.id,
          name: name.trim(),
          duration_min: dm,
          price_cents: pc,
        });
        toast.show({ variant: 'success', message: 'Actualizado' });
      } else {
        await create.mutateAsync({
          tenant_id: tenantId,
          name: name.trim(),
          duration_min: dm,
          price_cents: pc,
        });
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
            {service ? 'Editar servicio' : 'Nuevo servicio'}
          </Text>
          <Text className="text-ink-muted text-xs uppercase mb-1">Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Corte clásico"
            placeholderTextColor="#6C6C68"
            className="border border-border bg-surface-2 rounded-md px-3 py-2 mb-3 text-ink"
          />
          <Text className="text-ink-muted text-xs uppercase mb-1">Duración (min)</Text>
          <TextInput
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            className="border border-border bg-surface-2 rounded-md px-3 py-2 mb-3 text-ink"
          />
          <Text className="text-ink-muted text-xs uppercase mb-1">Precio (€)</Text>
          <TextInput
            value={priceEur}
            onChangeText={setPriceEur}
            keyboardType="decimal-pad"
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
