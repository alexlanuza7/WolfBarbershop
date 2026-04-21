import { Animated, Pressable, type PressableProps } from 'react-native';
import { useRef } from 'react';

type Props = PressableProps & { children: React.ReactNode; scale?: number };

export function PressableScale({ children, scale = 0.97, style, ...rest }: Props) {
  const anim = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        Animated.spring(anim, { toValue: scale, useNativeDriver: true, speed: 50 }).start();
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
        rest.onPressOut?.(e);
      }}
    >
      <Animated.View style={[{ transform: [{ scale: anim }] }, style as object]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
