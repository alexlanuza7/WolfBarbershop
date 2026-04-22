import { useFonts } from 'expo-font';
import {
  BigShouldersDisplay_700Bold,
  BigShouldersDisplay_900Black,
} from '@expo-google-fonts/big-shoulders-display';
import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
} from '@expo-google-fonts/archivo';

export function useAppFonts() {
  const [loaded] = useFonts({
    'BigShoulders-Bold': BigShouldersDisplay_700Bold,
    'BigShoulders-Black': BigShouldersDisplay_900Black,
    Archivo: Archivo_400Regular,
    'Archivo-Medium': Archivo_500Medium,
    'Archivo-SemiBold': Archivo_600SemiBold,
    'Archivo-Bold': Archivo_700Bold,
  });
  return loaded;
}
