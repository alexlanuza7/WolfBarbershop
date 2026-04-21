import { useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/data/session';
import { useCurrentTenantId } from '@/data/tenant';
import { useTenantDayAppointments } from '@/data/appointments';
import { useServices } from '@/data/services';
import { useRealtimeAppointments } from '@/data/useRealtimeAppointments';
import { StateChip } from '@/ui/StateChip';
import { BarberPoleLoader } from '@/ui/BarberPoleLoader';
import { EmptyState } from '@/ui/EmptyState';

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminHome() {
  const day = todayIso();
  const { session } = useSession();
  const tenantQ = useCurrentTenantId(session?.user.id);
  const apptsQ = useTenantDayAppointments(day);
  const servicesQ = useServices();

  useRealtimeAppointments({
    scope: 'tenant',
    tenantId: tenantQ.data ?? undefined,
    invalidate: [['appointments', 'tenant', day]],
  });

  const priceByService = useMemo(() => {
    const map = new Map<string, number>();
    (servicesQ.data ?? []).forEach((s) => map.set(s.id, s.price_cents));
    return map;
  }, [servicesQ.data]);

  const appts = apptsQ.data ?? [];
  const kpiTotal = appts.filter((a) => a.state !== 'cancelled').length;
  const kpiActive = appts.filter((a) => a.state === 'in_chair' || a.state === 'in_service').length;
  const kpiRevenueCents = appts
    .filter((a) => a.state === 'paid')
    .reduce((acc, a) => acc + (priceByService.get(a.service_id) ?? 0), 0);

  const loading = apptsQ.isLoading || servicesQ.isLoading;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-ink font-display text-3xl">WOLF BARBERSHOP</Text>
        <Text className="text-ink-muted mt-1">{day}</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <BarberPoleLoader />
        </View>
      ) : (
        <>
          <View className="px-6 pt-4 flex-row gap-3">
            <Kpi title="Citas hoy" value={String(kpiTotal)} />
            <Kpi title="En curso" value={String(kpiActive)} />
            <Kpi title="Ingresos" value={`${(kpiRevenueCents / 100).toFixed(0)}€`} />
          </View>

          <Text className="text-ink-muted text-xs uppercase tracking-wide px-6 pt-6 pb-2">
            Actividad del día
          </Text>

          <FlatList
            data={appts}
            keyExtractor={(a) => a.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 10 }}
            refreshControl={
              <RefreshControl
                refreshing={apptsQ.isRefetching}
                onRefresh={() => apptsQ.refetch()}
                tintColor="#C0342B"
              />
            }
            ListEmptyComponent={
              <View className="mt-8">
                <EmptyState icon="calendar" title="Sin citas hoy" />
              </View>
            }
            renderItem={({ item }) => (
              <View className="bg-surface-1 border border-border rounded-md p-4 flex-row items-center justify-between">
                <Text className="text-ink text-base font-semibold">{formatTime(item.starts_at)}</Text>
                <StateChip state={item.state} />
              </View>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <View className="flex-1 bg-surface-1 border border-border rounded-md p-4">
      <Text className="text-ink-muted text-xs uppercase tracking-wide">{title}</Text>
      <Text className="text-ink font-display text-3xl mt-2" style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}
