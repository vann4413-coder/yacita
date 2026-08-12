import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

import { useAuthStore } from '../store/auth';

const GREEN = '#1B4332';
const BGSOFT = '#F7F7F7';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

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
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 80 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#c00', marginBottom: 12 }}>
            Error:
          </Text>
          <Text style={{ fontSize: 14, color: '#000' }}>{this.state.error.message}</Text>
          <Text style={{ fontSize: 11, color: '#666', marginTop: 20 }}>{this.state.error.stack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try { await hydrate(); } catch (e) { console.warn(e); }
      finally { setReady(true); }
    }
    prepare();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Cargando Yacita...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor={GREEN} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: GREEN },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: BGSOFT },
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
