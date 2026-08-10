import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/auth';

// Notificaciones deshabilitadas temporalmente en este build.
// Se reactivarán cuando se configure Firebase (google-services.json).
export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    // No-op: las notificaciones push se activarán en una próxima versión.
    void user;
    void router;
  }, [user, router]);
}
