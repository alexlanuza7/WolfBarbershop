import { Platform, View } from 'react-native';

export function WebFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center' }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 480,
          backgroundColor: '#0A0A0B',
          shadowColor: '#000',
          shadowOpacity: 0.5,
          shadowRadius: 20,
        }}
      >
        {children}
      </View>
    </View>
  );
}
