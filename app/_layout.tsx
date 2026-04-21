import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useSession } from '@/data/session';
import { BarberPoleLoader } from '@/ui/BarberPoleLoader';
import { ToastProvider } from '@/ui/ToastProvider';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function SessionGate() {
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const first = segments[0];
    const inAuth = first === 'login' || first === 'verify';
    if (!session && !inAuth) router.replace('/login');
    else if (session && inAuth) router.replace('/');
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <BarberPoleLoader />
      </View>
    );
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SessionGate />
      </ToastProvider>
    </QueryClientProvider>
  );
}
