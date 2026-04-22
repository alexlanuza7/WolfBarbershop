import { Pressable, Text, ActivityIndicator, View } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'md' | 'sm';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

const bgByVariant: Record<Variant, string> = {
  primary: 'bg-pole-red',
  secondary: 'bg-surface-2 border border-border',
  ghost: 'bg-transparent border border-border',
  destructive: 'bg-destructive',
};

const textByVariant: Record<Variant, string> = {
  primary: 'text-pole-white',
  secondary: 'text-ink',
  ghost: 'text-ink',
  destructive: 'text-pole-white',
};

const sizeClass: Record<Size, string> = {
  md: 'px-6 py-4',
  sm: 'px-4 py-3',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  accessibilityLabel,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      className={`rounded-none items-center justify-center ${bgByVariant[variant]} ${sizeClass[size]} ${isDisabled ? 'opacity-40' : ''}`}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <View className="flex-row items-center gap-3">
        {loading ? <ActivityIndicator color="#FFFFFF" /> : null}
        <Text
          className={`${textByVariant[variant]} text-sm font-bold tracking-widest uppercase`}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
