import { Expo, type ExpoPushMessage } from 'expo-server-sdk';
import type { PrismaClient } from '@prisma/client';

const expo = new Expo({ accessToken: process.env['EXPO_ACCESS_TOKEN'] });

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// ── Enviar a un único token ──────────────────────────────────────────────────
export async function sendPushToToken(
  token: string,
  payload: NotificationPayload,
): Promise<void> {
  if (!Expo.isExpoPushToken(token)) return;

  const message: ExpoPushMessage = {
    to: token,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
  };

  const chunks = expo.chunkPushNotifications([message]);
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }
}

// ── Enviar a varios tokens (fan-out) ─────────────────────────────────────────
export async function sendPushToTokens(
  tokens: string[],
  payload: NotificationPayload,
): Promise<void> {
  const valid = tokens.filter(Expo.isExpoPushToken);
  if (valid.length === 0) return;

  const messages: ExpoPushMessage[] = valid.map((to) => ({
    to,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
  }));

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }
}

// ── Persistir + enviar ───────────────────────────────────────────────────────
export async function sendAndPersist(
  prisma: PrismaClient,
  userId: string,
  token: string | null,
  payload: NotificationPayload,
): Promise<void> {
  await prisma.pushNotification.create({
    data: {
      userId,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      sent: !!token,
      sentAt: token ? new Date() : null,
    },
  });

  if (token) await sendPushToToken(token, payload);
}

// ── Notificaciones de dominio ────────────────────────────────────────────────

export async function notifyBookingConfirmedToPatient(
  prisma: PrismaClient,
  opts: {
    userId: string;
    pushToken: string | null;
    clinicName: string;
    service: string;
    datetime: Date;
    bookingId: string;
  },
): Promise<void> {
  const dateStr = opts.datetime.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });

  await sendAndPersist(prisma, opts.userId, opts.pushToken, {
    title: '¡Reserva confirmada! 🎉',
    body: `Tu cita de ${opts.service} en ${opts.clinicName} el ${dateStr} está confirmada.`,
    data: { type: 'BOOKING_CONFIRMED', bookingId: opts.bookingId },
  });
}

export async function notifyNewBookingToClinic(
  prisma: PrismaClient,
  opts: {
    ownerId: string;
    ownerPushToken: string | null;
    patientName: string;
    service: string;
    datetime: Date;
    bookingId: string;
  },
): Promise<void> {
  const dateStr = opts.datetime.toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  await sendAndPersist(prisma, opts.ownerId, opts.ownerPushToken, {
    title: 'Nueva reserva recibida 📅',
    body: `${opts.patientName} ha reservado ${opts.service} para el ${dateStr}.`,
    data: { type: 'NEW_BOOKING', bookingId: opts.bookingId },
  });
}

export async function notifyReminderToPatient(
  prisma: PrismaClient,
  opts: {
    userId: string;
    pushToken: string | null;
    clinicName: string;
    service: string;
    datetime: Date;
    bookingId: string;
  },
): Promise<void> {
  await sendAndPersist(prisma, opts.userId, opts.pushToken, {
    title: 'Tu cita es en 1 hora ⏰',
    body: `Recuerda: ${opts.service} en ${opts.clinicName}. El pago se realiza en el centro.`,
    data: { type: 'REMINDER_1H', bookingId: opts.bookingId },
  });
}

export async function notifyNewGapNearby(
  tokens: string[],
  opts: {
    clinicName: string;
    service: string;
    discountPrice: number;
    discountPct: number;
    gapId: string;
  },
): Promise<void> {
  await sendPushToTokens(tokens, {
    title: `Nuevo hueco cerca 📍 -${opts.discountPct}%`,
    body: `${opts.service} en ${opts.clinicName} por ${opts.discountPrice.toFixed(2).replace('.', ',')}€`,
    data: { type: 'NEW_GAP_NEARBY', gapId: opts.gapId },
  });
}
