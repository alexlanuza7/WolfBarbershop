import { Redirect, type Href } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useSession } from '@/data/session';
import { useCurrentRole } from '@/data/currentRole';

export default function Index() {
  const { session } = useSession();
  const { data: role, isLoading } = useCurrentRole(session?.user.id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (role === 'barber') return <Redirect href={'/(barber)' as Href} />;
  if (role === 'admin' || role === 'owner') return <Redirect href={'/(admin)' as Href} />;
  return <Redirect href={'/(client)' as Href} />;
}
