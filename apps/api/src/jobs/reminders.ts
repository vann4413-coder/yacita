import type { PrismaClient } from '@prisma/client';
import { notifyReminderToPatient } from '../lib/notifications.js';

// Ejecutar cada minuto: busca citas que empiecen entre 59-61 min desde ahora
export async function runReminderJob(prisma: PrismaClient): Promise<void> {
  const now = new Date();
  const from = new Date(now.getTime() + 59 * 60_000);
  const to   = new Date(now.getTime() + 61 * 60_000);

  const bookings = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
      gap: {
        datetime: { gte: from, lte: to },
        status: { in: ['AVAILABLE', 'BOOKED'] },
      },
    },
    include: {
      user: { select: { id: true, pushToken: true } },
      gap: {
        include: {
          clinic: { select: { name: true } },
        },
      },
    },
  });

  for (const booking of bookings) {
    await notifyReminderToPatient(prisma, {
      userId: booking.user.id,
      pushToken: booking.user.pushToken ?? null,
      clinicName: booking.gap.clinic.name,
      service: booking.gap.service,
      datetime: booking.gap.datetime,
      bookingId: booking.id,
    });
  }
}
