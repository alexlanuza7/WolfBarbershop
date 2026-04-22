import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMyAppointments } from '@/data/appointments';
import { StateChip } from '@/ui/StateChip';
import { Button } from '@/ui/Button';
import { BarberPoleLoader } from '@/ui/BarberPoleLoader';
import { EmptyState } from '@/ui/EmptyState';
import { PressableScale } from '@/ui/PressableScale';

function dateParts(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
  const weekday = d.toLocaleString('es-ES', { weekday: 'short' }).toUpperCase().replace('.', '');
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return { day, month, weekday, time };
}

export default function ClientHome() {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useMyAppointments();
  const upcoming = (data ?? []).filter(
    (a) => a.state !== 'cancelled' && a.state !== 'paid' && a.state !== 'no_show',
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Cabecera editorial — número de sección + título signage */}
      <View className="px-6 pt-4 pb-6">
        <View className="flex-row items-center gap-2 mb-2">
          <View style={{ width: 6, height: 6, backgroundColor: '#C0342B' }} />
          <Text className="text-ink-subtle text-xs tracking-widest uppercase">
            SECCIÓN 01
          </Text>
        </View>
        <Text
          className="text-ink font-display-black uppercase"
          style={{ fontSize: 56, lineHeight: 56, letterSpacing: 0.5 }}
        >
          Mis{'\n'}Turnos
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <BarberPoleLoader />
        </View>
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Sin turnos"
          subtitle="Reserva tu próximo corte."
        />
      ) : (
        <FlatList
          data={upcoming}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: '#2D2826' }} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor="#C0342B"
            />
          }
          renderItem={({ item }) => {
            const { day, month, weekday, time } = dateParts(item.starts_at);
            return (
              <PressableScale>
                <View className="flex-row items-center py-5 gap-5">
                  {/* Bloque fecha tipo calendario rasgado */}
                  <View className="items-center" style={{ minWidth: 56 }}>
                    <Text
                      className="text-ink font-display-black"
                      style={{ fontSize: 34, lineHeight: 34 }}
                    >
                      {day}
                    </Text>
                    <Text className="text-ink-muted text-xs tracking-widest">
                      {month}
                    </Text>
                  </View>
                  {/* Regla vertical */}
                  <View style={{ width: 1, height: 40, backgroundColor: '#2D2826' }} />
                  {/* Info del turno */}
                  <View className="flex-1">
                    <Text className="text-ink-subtle text-xs tracking-widest uppercase mb-1">
                      {weekday}
                    </Text>
                    <Text
                      className="text-ink font-display uppercase"
                      style={{ fontSize: 22, lineHeight: 22 }}
                    >
                      {time}h
                    </Text>
                  </View>
                  <StateChip state={item.state} />
                </View>
              </PressableScale>
            );
          }}
        />
      )}

      <View
        className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-bg"
        style={{ borderTopWidth: 1, borderTopColor: '#2D2826' }}
      >
        <Button
          label="Reservar turno"
          onPress={() => router.push('/(client)/book' as never)}
        />
      </View>
    </SafeAreaView>
  );
}
