import { useEffect, useRef } from 'react';
import { Animated, Easing, View, AccessibilityInfo } from 'react-native';

type Props = {
  size?: number;
  accessibilityLabel?: string;
};

export function BarberPoleLoader({ size = 48, accessibilityLabel = 'Cargando' }: Props) {
  const translate = useRef(new Animated.Value(0)).current;
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      reducedMotionRef.current = reduced;
      if (reduced) return;
      Animated.loop(
        Animated.timing(translate, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    });
    return () => {
      cancelled = true;
      translate.stopAnimation();
    };
  }, [translate]);

  const stripeHeight = size;
  const stripeWidth = size;
  const travel = translate.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -stripeWidth],
  });

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={{
        width: size,
        height: stripeHeight * 1.4,
        overflow: 'hidden',
        backgroundColor: '#0B0A0A',
        borderWidth: 1,
        borderColor: '#2D2826',
      }}
    >
      <Animated.View
        style={{
          flexDirection: 'row',
          height: '100%',
          width: stripeWidth * 3,
          transform: [{ translateX: travel }, { rotate: '20deg' }],
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const color = ['#C0342B', '#F4F2F0', '#1F3A8A'][i % 3];
          return (
            <View
              key={i}
              style={{ flex: 1, backgroundColor: color, height: '160%', marginTop: -6 }}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}
