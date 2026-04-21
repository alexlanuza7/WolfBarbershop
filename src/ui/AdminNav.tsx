import { View, Text, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const TABS = [
  { label: 'Inicio', path: '/(admin)' },
  { label: 'Servicios', path: '/(admin)/services' },
  { label: 'Barberos', path: '/(admin)/barbers' },
  { label: 'Horarios', path: '/(admin)/schedules' },
] as const;

export function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <View className="flex-row border-t border-border bg-bg px-2 pt-2 pb-6">
      {TABS.map((t) => {
        const active =
          t.path === '/(admin)'
            ? pathname === '/' || pathname === '/(admin)' || pathname === ''
            : pathname.includes(t.path.split('/').pop()!);
        return (
          <Pressable
            key={t.path}
            onPress={() => router.replace(t.path as never)}
            className="flex-1 items-center py-2"
          >
            <Text
              className={`text-xs font-semibold ${active ? 'text-pole-red' : 'text-ink-muted'}`}
            >
              {t.label.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
