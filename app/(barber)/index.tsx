import { View, Text } from 'react-native';

export default function BarberHome() {
  return (
    <View className="flex-1 bg-bg items-center justify-center p-6">
      <Text className="text-ink text-4xl font-display">BARBERO</Text>
      <Text className="text-ink-muted mt-2">Próximamente: cola de hoy</Text>
    </View>
  );
}
