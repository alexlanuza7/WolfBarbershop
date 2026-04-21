import { Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

type Props = {
  children: React.ReactNode;
  onSwipe: () => void;
  actionLabel?: string;
  enabled?: boolean;
};

export function SwipeableRow({ children, onSwipe, actionLabel = 'Siguiente →', enabled = true }: Props) {
  if (!enabled) return <>{children}</>;
  return (
    <Swipeable
      friction={2}
      rightThreshold={80}
      onSwipeableOpen={(dir) => {
        if (dir === 'right') onSwipe();
      }}
      renderRightActions={() => (
        <View
          style={{
            backgroundColor: '#C0342B',
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingHorizontal: 20,
            borderRadius: 6,
            marginLeft: 8,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{actionLabel}</Text>
        </View>
      )}
    >
      {children}
    </Swipeable>
  );
}
