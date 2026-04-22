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
import { AdminNav } from '@/ui/AdminNav';

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDayLong(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).toUpperCase();
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
      {/* Cabecera editorial */}
      <View className="px-6 pt-4 pb-6">
        <View className="flex-row items-center gap-2 mb-2">
          <View style={{ width: 6, height: 6, backgroundColor: '#C0342B' }} />
          <Text className="text-ink-subtle text-xs tracking-widest uppercase">
            PANEL · {formatDayLong(day)}
          </Text>
        </View>
        <Text
          className="text-ink font-display-black uppercase"
          style={{ fontSize: 48, lineHeight: 48, letterSpacing: 0.5 }}
        >
          Hoy
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <BarberPoleLoader />
        </View>
      ) : (
        <>
          {/* KPIs tipo tablón — bloque de 3 columnas separadas por reglas */}
          <View
            className="flex-row mx-6"
            style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#2D2826' }}
          >
            <Kpi title="CITAS" value={String(kpiTotal)} />
            <Divider />
            <Kpi title="EN CURSO" value={String(kpiActive)} accent={kpiActive > 0} />
            <Divider />
            <Kpi title="INGRESOS" value={`${(kpiRevenueCents / 100).toFixed(0)}€`} />
          </View>

          <View className="px-6 pt-8 pb-3 flex-row items-center gap-2">
            <View style={{ width: 4, height: 4, backgroundColor: '#6E6A66' }} />
            <Text className="text-ink-subtle text-xs tracking-widest uppercase">
              Actividad
            </Text>
          </View>

          <FlatList
            data={appts}
            keyExtractor={(a) => a.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: '#2D2826' }} />
            )}
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
              <View className="flex-row items-center py-4">
                <Text
                  className="text-ink font-display-black"
                  style={{ fontSize: 22, lineHeight: 22, minWidth: 68 }}
                >
                  {formatTime(item.starts_at)}
                </Text>
                <View style={{ flex: 1 }} />
                <StateChip state={item.state} />
              </View>
            )}
          />
        </>
      )}
      <AdminNav />
    </SafeAreaView>
  );
}

function Kpi({ title, value, accent }: { title: string; value: string; accent?: boolean }) {
  return (
    <View className="flex-1 py-5 items-start" style={{ paddingHorizontal: 4 }}>
      <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-2">{title}</Text>
      <Text
        className="font-display-black"
        style={{
          color: accent ? '#C0342B' : '#F4F2F0',
          fontSize: 38,
          lineHeight: 38,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={{ width: 1, backgroundColor: '#2D2826' }} />;
}
