import { View, Text } from 'react-native';

export default function ClientHome() {
  return (
    <View className="flex-1 bg-cream items-center justify-center p-6">
      <Text className="text-ink text-2xl font-bold">Cliente</Text>
      <Text className="text-ink/70 mt-2">Próximamente: reservar turno</Text>
    </View>
  );
}
