import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { useAuthStore } from '../store/auth';
import { colors } from '@yacita/ui';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// Error boundary que MUESTRA el error en pantalla en vez de crashear
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch() {
    SplashScreen.hideAsync().catch(() => {});
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 80 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#c00', marginBottom: 12 }}>
            Error detectado:
          </Text>
          <Text style={{ fontSize: 14, color: '#000' }}>
            {this.state.error.message}
          </Text>
          <Text style={{ fontSize: 11, color: '#666', marginTop: 20 }}>
            {this.state.error.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
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
      try { await hydrate(); } catch (e) { console.warn(e); }
      finally { setReady(true); }
    }
    prepare();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, ready]);

  if ((!fontsLoaded && !fontError) || !ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors?.bgDark ?? '#1B4332' }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Cargando Yacita...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor={colors?.bgDark ?? '#1B4332'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors?.bgDark ?? '#1B4332' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: 'PlusJakartaSans-SemiBold' },
          contentStyle: { backgroundColor: colors?.bgSoft ?? '#F7F7F7' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="gap/[id]" options={{ title: 'Detalle del hueco' }} />
        <Stack.Screen name="gap/[id]/confirm" options={{ title: 'Confirmar reserva' }} />
        <Stack.Screen name="gap/confirmed" options={{ title: 'Reserva confirmada', headerLeft: () => null }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
