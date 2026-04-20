import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Wolf Barbershop',
  slug: 'wolf-barbershop',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'wolfbarbershop',
  userInterfaceStyle: 'automatic',
  experiments: { typedRoutes: true },
  plugins: ['expo-router'],
  ios: { bundleIdentifier: 'com.wolfbarbershop.app', supportsTablet: true },
  android: { package: 'com.wolfbarbershop.app' },
  web: { bundler: 'metro' },
};

export default config;
