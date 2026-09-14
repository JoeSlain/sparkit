import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { Providers } from '../src/providers';
import { getNativeObservability } from '../src/integrations';

function RootLayout() {
  return (
    <SafeAreaProvider>
      <Providers>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </Providers>
    </SafeAreaProvider>
  );
}

export default getNativeObservability().enabled ? Sentry.wrap(RootLayout) : RootLayout;
