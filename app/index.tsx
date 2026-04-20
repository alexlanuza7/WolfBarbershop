import { View, Text } from 'react-native';
import { Button } from '@/ui/Button';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-cream gap-6 p-6">
      <Text className="text-ink text-2xl font-bold">Wolf Barbershop OS</Text>
      <Button label="Siguiente" onPress={() => {}} />
    </View>
  );
}
