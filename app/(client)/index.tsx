import { View, Text } from 'react-native';

export default function ClientHome() {
  return (
    <View className="flex-1 bg-bg items-center justify-center p-6">
      <Text className="text-ink text-4xl font-display">CLIENTE</Text>
      <Text className="text-ink-muted mt-2">Próximamente: reservar turno</Text>
    </View>
  );
}
