import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { useAuthStore } from '../store/auth';
import { colors } from '@yacita/ui';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    Inter: require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await hydrate();
      } catch (e) {
        // Si falla la hidratación, continuamos igualmente
        console.warn('hydrate failed', e);
      } finally {
        setReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, ready]);

  // Esperamos a fuentes Y a que termine la hidratación
  if ((!fontsLoaded && !fontError) || !ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
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
