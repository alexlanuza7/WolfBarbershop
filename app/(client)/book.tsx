import { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSession } from '@/data/session';
import { useServices } from '@/data/services';
import { useBarbers } from '@/data/barbers';
import { useAvailableSlots, type Slot } from '@/data/slots';
import { useCreateAppointment } from '@/data/appointments';
import { useCurrentTenantId } from '@/data/tenant';
import { Button } from '@/ui/Button';
import { BarberPoleLoader } from '@/ui/BarberPoleLoader';
import type { Service } from '@/domain/service';
import type { Barber } from '@/domain/barber';

type Step = 1 | 2 | 3;

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatPrice(cents: number) {
  return `${(cents / 100).toFixed(2)} €`;
}

function formatSlot(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function BookScreen() {
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user.id;

  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<Service | null>(null);
  const [barber, setBarber] = useState<Barber | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const day = todayIso();

  const tenantQ = useCurrentTenantId(userId);
  const servicesQ = useServices();
  const barbersQ = useBarbers();
  const slotsQ = useAvailableSlots(barber?.id, service?.duration_min, day);
  const create = useCreateAppointment();

  const title = useMemo(() => {
    if (step === 1) return 'Elige tu servicio';
    if (step === 2) return 'Elige tu barbero';
    return 'Elige un hueco';
  }, [step]);

  function back() {
    if (step === 1) router.back();
    else setStep((step - 1) as Step);
  }

  async function confirm() {
    if (!service || !barber || !slot || !userId || !tenantQ.data) return;
    try {
      await create.mutateAsync({
        tenant_id: tenantQ.data,
        client_id: userId,
        barber_id: barber.id,
        service_id: service.id,
        starts_at: slot.starts_at,
        ends_at: slot.ends_at,
      });
      router.replace('/(client)' as never);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error inesperado';
      Alert.alert('No se pudo reservar', msg);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Volver">
          <Text className="text-ink-muted text-base">← Volver</Text>
        </Pressable>
        <Text className="text-ink-muted">{step} / 3</Text>
      </View>

      <View className="px-6 pb-4">
        <Text className="text-ink font-display text-3xl">{title}</Text>
      </View>

      {step === 1 && (
        <ServiceList
          loading={servicesQ.isLoading}
          items={servicesQ.data ?? []}
          selectedId={service?.id}
          onSelect={(s) => setService(s)}
        />
      )}

      {step === 2 && (
        <BarberList
          loading={barbersQ.isLoading}
          items={barbersQ.data ?? []}
          selectedId={barber?.id}
          onSelect={(b) => setBarber(b)}
        />
      )}

      {step === 3 && (
        <SlotGrid
          loading={slotsQ.isLoading}
          items={slotsQ.data ?? []}
          selectedStart={slot?.starts_at}
          onSelect={(s) => setSlot(s)}
        />
      )}

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-bg border-t border-border">
        {step === 1 && (
          <Button
            label="Siguiente"
            onPress={() => setStep(2)}
            disabled={!service}
          />
        )}
        {step === 2 && (
          <Button
            label="Siguiente"
            onPress={() => setStep(3)}
            disabled={!barber}
          />
        )}
        {step === 3 && (
          <Button
            label="Confirmar reserva"
            onPress={confirm}
            disabled={!slot || create.isPending}
            loading={create.isPending}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function ServiceList({
  loading,
  items,
  selectedId,
  onSelect,
}: {
  loading: boolean;
  items: Service[];
  selectedId?: string;
  onSelect: (s: Service) => void;
}) {
  if (loading) return <Centered><BarberPoleLoader /></Centered>;
  return (
    <FlatList
      data={items}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140, gap: 10 }}
      renderItem={({ item }) => {
        const active = item.id === selectedId;
        return (
          <Pressable
            onPress={() => onSelect(item)}
            className={`rounded-md border p-4 ${active ? 'border-pole-red bg-surface-2' : 'border-border bg-surface-1'}`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-ink font-semibold text-base">{item.name}</Text>
                <Text className="text-ink-muted mt-1">{item.duration_min} min</Text>
              </View>
              <Text className="text-ink font-semibold">{formatPrice(item.price_cents)}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

function BarberList({
  loading,
  items,
  selectedId,
  onSelect,
}: {
  loading: boolean;
  items: Barber[];
  selectedId?: string;
  onSelect: (b: Barber) => void;
}) {
  if (loading) return <Centered><BarberPoleLoader /></Centered>;
  return (
    <FlatList
      data={items}
      keyExtractor={(b) => b.id}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140, gap: 10 }}
      renderItem={({ item }) => {
        const active = item.id === selectedId;
        return (
          <Pressable
            onPress={() => onSelect(item)}
            className={`rounded-md border p-4 flex-row items-center gap-4 ${active ? 'border-pole-red bg-surface-2' : 'border-border bg-surface-1'}`}
          >
            <View className="w-12 h-12 rounded-full bg-surface-2 items-center justify-center">
              <Text className="text-ink font-display text-lg">
                {item.display_name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <Text className="text-ink font-semibold text-base">{item.display_name}</Text>
          </Pressable>
        );
      }}
    />
  );
}

function SlotGrid({
  loading,
  items,
  selectedStart,
  onSelect,
}: {
  loading: boolean;
  items: Slot[];
  selectedStart?: string;
  onSelect: (s: Slot) => void;
}) {
  if (loading) return <Centered><BarberPoleLoader /></Centered>;
  if (items.length === 0) {
    return (
      <Centered>
        <Text className="text-ink-muted text-center px-6">
          No hay huecos disponibles hoy para este barbero.
        </Text>
      </Centered>
    );
  }
  return (
    <FlatList
      data={items}
      keyExtractor={(s) => s.starts_at}
      numColumns={3}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
      columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
      renderItem={({ item }) => {
        const active = item.starts_at === selectedStart;
        return (
          <Pressable
            onPress={() => onSelect(item)}
            className={`flex-1 rounded-md border py-3 items-center ${active ? 'border-pole-red bg-pole-red' : 'border-border bg-surface-1'}`}
          >
            <Text className={`font-semibold ${active ? 'text-pole-white' : 'text-ink'}`}>
              {formatSlot(item.starts_at)}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View className="flex-1 items-center justify-center">{children}</View>;
}
