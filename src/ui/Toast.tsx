import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import type { ToastEntry } from './ToastProvider';

export type ToastVariant = 'info' | 'success' | 'destructive' | 'warning';

// Toast editorial: bloque rectangular plano con cuadrado de estado a la izquierda
// (mismo lenguaje que StateChip) + tipografía cóndensa mayúscula.
// Sin border-left de acento (patrón vetado). El borde siempre es de 1px uniforme,
// tintado al color del estado para mensajes críticos.
const ACCENT: Record<ToastVariant, string> = {
  info: '#6E6A66',
  success: '#3DA55C',
  destructive: '#C0342B',
  warning: '#D98A2B',
};

export function Toast({ entry, onDismiss }: { entry: ToastEntry; onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(-16)).current;
  const variant: ToastVariant = entry.variant ?? 'info';
  const duration = entry.durationMs ?? 3000;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [opacity, translate, duration, onDismiss]);

  const borderColor = variant === 'destructive' ? ACCENT.destructive : '#2D2826';

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY: translate }],
        backgroundColor: '#171514',
        borderWidth: 1,
        borderColor,
        marginBottom: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
      accessibilityRole="alert"
    >
      {/* Punto cuadrado — señal de estado (igual al lenguaje de StateChip) */}
      <View
        style={{
          width: 8,
          height: 8,
          backgroundColor: ACCENT[variant],
        }}
      />
      <Text
        style={{
          color: '#F4F2F0',
          flex: 1,
          fontFamily: 'Archivo-Medium',
          fontSize: 14,
          lineHeight: 18,
        }}
      >
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
          <Text
            style={{
              color: ACCENT[variant],
              fontFamily: 'Archivo-Bold',
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            {entry.action.label}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
