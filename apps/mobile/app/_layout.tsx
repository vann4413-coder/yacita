import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { useAuthStore } from '../store/auth';
import { useNotifications } from '../hooks/useNotifications';
import { colors } from '@yacita/ui';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function NotificationSetup() {
  useNotifications();
  return null;
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    Inter: require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
  });

  useEffect(() => {
    hydrate().then(() => {
      if (fontsLoaded) SplashScreen.hideAsync();
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationSetup />
      <StatusBar style="light" backgroundColor={colors.bgDark} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgDark },
          headerTintColor: colors.white,
          headerTitleStyle: { fontFamily: 'PlusJakartaSans-SemiBold' },
          contentStyle: { backgroundColor: colors.bgSoft },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="gap/[id]" options={{ title: 'Detalle del hueco' }} />
        <Stack.Screen name="gap/[id]/confirm" options={{ title: 'Confirmar reserva' }} />
        <Stack.Screen name="gap/confirmed" options={{ title: 'Reserva confirmada', headerLeft: () => null }} />
        <Stack.Screen name="auth/login" options={{ title: 'Iniciar sesión', headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ title: 'Crear cuenta', headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
