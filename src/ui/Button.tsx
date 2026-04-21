import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const base = 'rounded-2xl px-6 py-5 items-center justify-center';
  const style = variant === 'primary' ? 'bg-ink' : 'bg-transparent border border-ink';
  const text =
    variant === 'primary'
      ? 'text-cream text-lg font-semibold'
      : 'text-ink text-lg font-semibold';
  return (
    <Pressable
      className={`${base} ${style} ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={text}>{label}</Text>
    </Pressable>
  );
}
