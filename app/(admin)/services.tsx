import { useState } from 'react';
import { View, Text, FlatList, TextInput, Modal, Switch, Pressable } from 'react-native';
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
      {/* Cabecera editorial */}
      <View className="px-6 pt-4 pb-6 flex-row items-end justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-2">
            <View style={{ width: 6, height: 6, backgroundColor: '#C0342B' }} />
            <Text className="text-ink-subtle text-xs tracking-widest uppercase">
              CATÁLOGO
            </Text>
          </View>
          <Text
            className="text-ink font-display-black uppercase"
            style={{ fontSize: 44, lineHeight: 44, letterSpacing: 0.5 }}
          >
            Servicios
          </Text>
        </View>
        <Pressable
          onPress={() => setEditing('new')}
          accessibilityRole="button"
          accessibilityLabel="Nuevo servicio"
        >
          <View
            className="bg-pole-red px-4 py-3"
            style={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <Text
              className="font-display-black"
              style={{
                color: '#FFFFFF',
                fontSize: 12,
                letterSpacing: 1.4,
              }}
            >
              + NUEVO
            </Text>
          </View>
        </Pressable>
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
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: '#2D2826' }} />
          )}
          renderItem={({ item }) => (
            <PressableScale onPress={() => setEditing(item)}>
              <View
                className="flex-row items-center py-5 gap-4"
                style={{ opacity: item.active ? 1 : 0.45 }}
              >
                <View className="flex-1">
                  <Text
                    className="text-ink font-display uppercase"
                    style={{ fontSize: 20, lineHeight: 22, letterSpacing: 0.5 }}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-ink-muted text-xs tracking-widest uppercase mt-1">
                    {item.duration_min} MIN · {formatPrice(item.price_cents)}
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
                  trackColor={{ true: '#C0342B', false: '#2D2826' }}
                  thumbColor="#F4F2F0"
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
      <View className="flex-1 bg-black/80 items-center justify-center px-6">
        <View
          className="w-full bg-bg p-6"
          style={{
            maxWidth: 440,
            borderWidth: 1,
            borderColor: '#2D2826',
          }}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <View style={{ width: 4, height: 4, backgroundColor: '#C0342B' }} />
            <Text className="text-ink-subtle text-xs tracking-widest uppercase">
              {service ? 'EDITAR' : 'NUEVO'}
            </Text>
          </View>
          <Text
            className="text-ink font-display-black uppercase mb-6"
            style={{ fontSize: 28, lineHeight: 30, letterSpacing: 0.5 }}
          >
            Servicio
          </Text>

          <Field label="Nombre">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Corte clásico"
              placeholderTextColor="#6E6A66"
              className="bg-surface-1 px-4 py-3 text-ink"
              style={{ fontFamily: 'Archivo' }}
            />
          </Field>
          <Field label="Duración · min">
            <TextInput
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              className="bg-surface-1 px-4 py-3 text-ink"
              style={{ fontFamily: 'Archivo' }}
            />
          </Field>
          <Field label="Precio · €">
            <TextInput
              value={priceEur}
              onChangeText={setPriceEur}
              keyboardType="decimal-pad"
              className="bg-surface-1 px-4 py-3 text-ink"
              style={{ fontFamily: 'Archivo' }}
            />
          </Field>

          <View className="flex-row gap-3 mt-4">
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-2">{label}</Text>
      {children}
    </View>
  );
}
