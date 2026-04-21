import { Stack } from 'expo-router';

export default function ClientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0B' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="book" />
    </Stack>
  );
}
