import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import type { ToastEntry } from './ToastProvider';

export type ToastVariant = 'info' | 'success' | 'destructive' | 'warning';

const BG: Record<ToastVariant, string> = {
  info: '#1E1E21',
  success: '#10B981',
  destructive: '#DC2626',
  warning: '#F59E0B',
};
const FG: Record<ToastVariant, string> = {
  info: '#F5F5F2',
  success: '#0A0A0B',
  destructive: '#FFFFFF',
  warning: '#0A0A0B',
};

export function Toast({ entry, onDismiss }: { entry: ToastEntry; onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(-20)).current;
  const variant: ToastVariant = entry.variant ?? 'info';
  const duration = entry.durationMs ?? 3000;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [opacity, translate, duration, onDismiss]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY: translate }],
        backgroundColor: BG[variant],
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
      accessibilityRole="alert"
    >
      <Text style={{ color: FG[variant], flex: 1, fontSize: 14, fontWeight: '500' }}>
        {entry.message}
      </Text>
      {entry.action ? (
        <Pressable
          onPress={() => {
            entry.action?.onPress();
            onDismiss();
          }}
          accessibilityRole="button"
        >
          <Text style={{ color: FG[variant], fontWeight: '700', textDecorationLine: 'underline' }}>
            {entry.action.label}
          </Text>
        </Pressable>
      ) : (
        <View />
      )}
    </Animated.View>
  );
}
