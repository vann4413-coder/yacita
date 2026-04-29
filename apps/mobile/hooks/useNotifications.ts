import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

// Comportamiento global: mostrar banner + badge + sonido incluso en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    if (!user) return;

    registerForPushNotifications().then((token) => {
      if (token) {
        // Guardar token en el servidor (PATCH /auth/me)
        api.patch('/auth/me', { pushToken: token }).catch(() => null);
      }
    });

    // Notificación recibida con app en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { type } = notification.request.content.data as Record<string, string>;
        // Se puede mostrar un banner in-app aquí si se quiere
        void type;
      },
    );

    // Usuario toca la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as Record<string, string>;
        handleNotificationTap(data, router);
      },
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user]);
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  // Permisos
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  // Canal Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Yacita',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1D9E75',
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return null;

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  return token;
}

function handleNotificationTap(
  data: Record<string, string>,
  router: ReturnType<typeof useRouter>,
) {
  switch (data['type']) {
    case 'BOOKING_CONFIRMED':
    case 'REMINDER_1H':
      if (data['bookingId']) router.push('/(tabs)/bookings');
      break;
    case 'NEW_BOOKING':
      // Solo llega a la clínica — no aplica en app paciente
      break;
    case 'NEW_GAP_NEARBY':
      if (data['gapId']) router.push(`/gap/${data['gapId']}`);
      break;
  }
}
