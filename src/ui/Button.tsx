import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
};

export function Button({ label, onPress, variant = 'primary' }: Props) {
  const base = 'rounded-2xl px-6 py-5 items-center justify-center';
  const style = variant === 'primary' ? 'bg-ink' : 'bg-transparent border border-ink';
  const text =
    variant === 'primary'
      ? 'text-cream text-lg font-semibold'
      : 'text-ink text-lg font-semibold';
  return (
    <Pressable className={`${base} ${style}`} onPress={onPress}>
      <Text className={text}>{label}</Text>
    </Pressable>
  );
}
