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
    <View
      className="flex-row bg-bg px-2 pt-3 pb-6"
      style={{ borderTopWidth: 1, borderTopColor: '#2D2826' }}
    >
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
            accessibilityRole="button"
            accessibilityLabel={t.label}
          >
            {/* Indicador superior — barra pole-red solo activa */}
            <View
              style={{
                height: 2,
                width: 28,
                backgroundColor: active ? '#C0342B' : 'transparent',
                marginBottom: 8,
              }}
            />
            <Text
              style={{
                color: active ? '#F4F2F0' : '#6E6A66',
                fontFamily: 'Archivo-Bold',
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
