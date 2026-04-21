import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMyAppointments } from '@/data/appointments';
import { StateChip } from '@/ui/StateChip';
import { Button } from '@/ui/Button';
import { BarberPoleLoader } from '@/ui/BarberPoleLoader';

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ClientHome() {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useMyAppointments();
  const upcoming = (data ?? []).filter(
    (a) => a.state !== 'cancelled' && a.state !== 'paid' && a.state !== 'no_show',
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-ink font-display text-4xl">MIS TURNOS</Text>
        <Text className="text-ink-muted mt-1">Próximas reservas</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <BarberPoleLoader />
        </View>
      ) : upcoming.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-ink-muted text-center">
            No tienes turnos. Reserva tu próximo corte.
          </Text>
        </View>
      ) : (
        <FlatList
          data={upcoming}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#C0342B" />
          }
          renderItem={({ item }) => (
            <Pressable className="bg-surface-1 border border-border rounded-md p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-ink font-semibold text-base">{formatWhen(item.starts_at)}</Text>
                <StateChip state={item.state} />
              </View>
            </Pressable>
          )}
        />
      )}

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-bg border-t border-border">
        <Button label="Reservar turno" onPress={() => router.push('/(client)/book' as never)} />
      </View>
    </SafeAreaView>
  );
}
