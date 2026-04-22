import { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useToast } from '@/ui/ToastProvider';
import { useSession } from '@/data/session';
import { useServices } from '@/data/services';
import { useBarbers } from '@/data/barbers';
import { useAvailableSlots, type Slot } from '@/data/slots';
import { useCreateAppointment } from '@/data/appointments';
import { useCurrentTenantId } from '@/data/tenant';
import { Button } from '@/ui/Button';
import { BarberPoleLoader } from '@/ui/BarberPoleLoader';
import { PressableScale } from '@/ui/PressableScale';
import { EmptyState } from '@/ui/EmptyState';
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
  const toast = useToast();
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
      router.replace({
        pathname: '/(client)/confirmed',
        params: {
          starts_at: slot.starts_at,
          barber: barber.display_name,
          service: service.name,
        },
      } as never);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error inesperado';
      toast.show({ variant: 'destructive', message: msg });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Volver">
          <Text className="text-ink-muted text-sm tracking-widest uppercase">← Volver</Text>
        </Pressable>
        <Text className="text-ink-subtle text-xs tracking-widest uppercase">
          PASO {step} / 3
        </Text>
      </View>

      {/* Barra de progreso signage — 3 bloques */}
      <View className="flex-row px-6 gap-1 pt-2 pb-6">
        {[1, 2, 3].map((n) => (
          <View
            key={n}
            style={{
              flex: 1,
              height: 3,
              backgroundColor: n <= step ? '#C0342B' : '#2D2826',
            }}
          />
        ))}
      </View>

      <View className="px-6 pb-6">
        <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-2">
          {step === 1 ? 'Servicio' : step === 2 ? 'Barbero' : 'Hueco'}
        </Text>
        <Text
          className="text-ink font-display-black uppercase"
          style={{ fontSize: 40, lineHeight: 40 }}
        >
          {title}
        </Text>
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
  onSelect: (_service: Service) => void;
}) {
  if (loading) return <Centered><BarberPoleLoader /></Centered>;
  return (
    <FlatList
      data={items}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
      ItemSeparatorComponent={() => (
        <View style={{ height: 1, backgroundColor: '#2D2826' }} />
      )}
      renderItem={({ item }) => {
        const active = item.id === selectedId;
        return (
          <PressableScale onPress={() => onSelect(item)}>
            <View
              className={`flex-row items-center gap-4 py-5 pr-2`}
              style={{ backgroundColor: active ? '#221E1D' : 'transparent' }}
            >
              {/* Marcador activo — barra vertical pole-red solo en seleccionado */}
              <View
                style={{
                  width: 3,
                  alignSelf: 'stretch',
                  backgroundColor: active ? '#C0342B' : 'transparent',
                }}
              />
              <View className="flex-1">
                <Text
                  className="text-ink font-display uppercase"
                  style={{ fontSize: 22, lineHeight: 24, letterSpacing: 0.5 }}
                >
                  {item.name}
                </Text>
                <Text className="text-ink-muted text-sm mt-1 tracking-wide">
                  {item.duration_min} MIN
                </Text>
              </View>
              <Text
                className="text-ink font-display-black"
                style={{ fontSize: 24, lineHeight: 24 }}
              >
                {formatPrice(item.price_cents)}
              </Text>
            </View>
          </PressableScale>
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
  onSelect: (_barber: Barber) => void;
}) {
  if (loading) return <Centered><BarberPoleLoader /></Centered>;
  return (
    <FlatList
      data={items}
      keyExtractor={(b) => b.id}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
      ItemSeparatorComponent={() => (
        <View style={{ height: 1, backgroundColor: '#2D2826' }} />
      )}
      renderItem={({ item }) => {
        const active = item.id === selectedId;
        const initial = item.display_name.slice(0, 1).toUpperCase();
        return (
          <PressableScale onPress={() => onSelect(item)}>
            <View
              className="flex-row items-center gap-4 py-5 pr-2"
              style={{ backgroundColor: active ? '#221E1D' : 'transparent' }}
            >
              <View
                style={{
                  width: 3,
                  alignSelf: 'stretch',
                  backgroundColor: active ? '#C0342B' : 'transparent',
                }}
              />
              {/* Avatar monogramado — cuadrado, sin redondeados */}
              <View
                style={{
                  width: 52,
                  height: 52,
                  backgroundColor: active ? '#C0342B' : '#171514',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  className="font-display-black"
                  style={{
                    color: active ? '#FFFFFF' : '#F4F2F0',
                    fontSize: 28,
                    lineHeight: 28,
                  }}
                >
                  {initial}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-ink font-display uppercase"
                  style={{ fontSize: 22, lineHeight: 24, letterSpacing: 0.5 }}
                >
                  {item.display_name}
                </Text>
                <Text className="text-ink-subtle text-xs tracking-widest uppercase mt-1">
                  BARBERO
                </Text>
              </View>
            </View>
          </PressableScale>
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
  onSelect: (_slot: Slot) => void;
}) {
  if (loading) return <Centered><BarberPoleLoader /></Centered>;
  if (items.length === 0) {
    return (
      <EmptyState
        icon="clock"
        title="Sin huecos"
        subtitle="No hay disponibilidad hoy para este barbero."
      />
    );
  }
  return (
    <FlatList
      data={items}
      keyExtractor={(s) => s.starts_at}
      numColumns={3}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
      columnWrapperStyle={{ gap: 6, marginBottom: 6 }}
      renderItem={({ item }) => {
        const active = item.starts_at === selectedStart;
        return (
          <View style={{ flex: 1 }}>
            <PressableScale onPress={() => onSelect(item)}>
              <View
                style={{
                  paddingVertical: 18,
                  alignItems: 'center',
                  backgroundColor: active ? '#C0342B' : '#171514',
                  borderWidth: 1,
                  borderColor: active ? '#C0342B' : '#2D2826',
                }}
              >
                <Text
                  className="font-display-black"
                  style={{
                    color: active ? '#FFFFFF' : '#F4F2F0',
                    fontSize: 22,
                    lineHeight: 22,
                    letterSpacing: 0.5,
                  }}
                >
                  {formatSlot(item.starts_at)}
                </Text>
              </View>
            </PressableScale>
          </View>
        );
      }}
    />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View className="flex-1 items-center justify-center">{children}</View>;
}
