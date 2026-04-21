import { View, Text } from 'react-native';

export default function AdminHome() {
  return (
    <View className="flex-1 bg-cream items-center justify-center p-6">
      <Text className="text-ink text-2xl font-bold">Admin</Text>
      <Text className="text-ink/70 mt-2">Próximamente: dashboard del local</Text>
    </View>
  );
}
