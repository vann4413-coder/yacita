import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  notifyBookingConfirmedToPatient,
  notifyNewBookingToClinic,
} from '../lib/notifications.js';

const createBookingSchema = z.object({
  gapId: z.string().min(1),
  note: z.string().max(500).optional(),
});

const updateBookingSchema = z.object({
  status: z.enum(['CANCELLED', 'COMPLETED']),
});

const bookingsRoutes: FastifyPluginAsync = async (fastify) => {
  // ────────────────────────────────────────────────────────────────────────
  // POST /bookings — paciente reserva un hueco
  // ────────────────────────────────────────────────────────────────────────
  fastify.post(
    '/bookings',
    { preHandler: fastify.authenticate },
    async (req, reply) => {
      const body = createBookingSchema.safeParse(req.body);
      if (!body.success) {
        return reply.code(400).send({ error: 'Bad Request', message: body.error.flatten() });
      }

      const { gapId, note } = body.data;
      const userId = req.user.sub;

      const gap = await fastify.prisma.gap.findUnique({
        where: { id: gapId },
        include: {
          _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
          clinic: { select: { id: true, name: true, ownerId: true } },
        },
      });

      if (!gap) {
        return reply.code(404).send({ error: 'Not Found', message: 'Hueco no encontrado' });
      }
      if (gap.status !== 'AVAILABLE') {
        return reply.code(409).send({ error: 'Conflict', message: 'Este hueco ya no está disponible' });
      }
      if (gap.datetime < new Date()) {
        return reply.code(409).send({ error: 'Conflict', message: 'Este hueco ya ha pasado' });
      }
      if (gap._count.bookings >= gap.maxBookings) {
        return reply.code(409).send({ error: 'Conflict', message: 'No quedan plazas en este hueco' });
      }

      // Evitar doble reserva del mismo usuario en el mismo hueco
      const existing = await fastify.prisma.booking.findUnique({
        where: { gapId_userId: { gapId, userId } },
      });
      if (existing) {
        return reply.code(409).send({ error: 'Conflict', message: 'Ya tienes una reserva en este hueco' });
      }

      const booking = await fastify.prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: { gapId, userId, note, status: 'CONFIRMED' },
          include: {
            gap: {
              include: {
                clinic: { select: { id: true, name: true, address: true, photos: true } },
              },
            },
            user: { select: { id: true, name: true, email: true } },
          },
        });

        // Si el hueco ya no tiene plazas → marcar como BOOKED
        const confirmedCount = gap._count.bookings + 1;
        if (confirmedCount >= gap.maxBookings) {
          await tx.gap.update({ where: { id: gapId }, data: { status: 'BOOKED' } });
        }

        return booking;
      });

      // Notificaciones en background (no bloquean la respuesta)
      const clinicOwner = await fastify.prisma.user.findUnique({
        where: { id: gap.clinic.ownerId },
        select: { id: true, pushToken: true },
      });
      const patient = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: { pushToken: true },
      });

      void notifyBookingConfirmedToPatient(fastify.prisma, {
        userId,
        pushToken: patient?.pushToken ?? null,
        clinicName: gap.clinic.name,
        service: gap.service,
        datetime: gap.datetime,
        bookingId: booking.id,
      });

      void notifyNewBookingToClinic(fastify.prisma, {
        ownerId: gap.clinic.ownerId,
        ownerPushToken: clinicOwner?.pushToken ?? null,
        patientName: booking.user.name,
        service: gap.service,
        datetime: gap.datetime,
        bookingId: booking.id,
      });

      return reply.code(201).send({ data: serializeBooking(booking) });
    },
  );

  // ────────────────────────────────────────────────────────────────────────
  // GET /bookings/me — reservas del paciente autenticado
  // ────────────────────────────────────────────────────────────────────────
  fastify.get(
    '/bookings/me',
    { preHandler: fastify.authenticate },
    async (req, reply) => {
      const { page = '1', limit = '20' } = req.query as Record<string, string>;
      const p = Math.max(1, parseInt(page));
      const l = Math.min(50, Math.max(1, parseInt(limit)));
      const offset = (p - 1) * l;

      const [bookings, total] = await Promise.all([
        fastify.prisma.booking.findMany({
          where: { userId: req.user.sub },
          include: {
            gap: {
              include: {
                clinic: { select: { id: true, name: true, address: true, photos: true } },
              },
            },
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: l,
        }),
        fastify.prisma.booking.count({ where: { userId: req.user.sub } }),
      ]);

      return reply.send({
        data: bookings.map(serializeBooking),
        total,
        page: p,
        limit: l,
        hasMore: offset + bookings.length < total,
      });
    },
  );

  // ────────────────────────────────────────────────────────────────────────
  // GET /clinic/bookings — reservas recibidas por la clínica
  // ────────────────────────────────────────────────────────────────────────
  fastify.get(
    '/clinic/bookings',
    { preHandler: fastify.requireRole('CLINIC_OWNER') },
    async (req, reply) => {
      const { page = '1', limit = '20', status } = req.query as Record<string, string>;
      const p = Math.max(1, parseInt(page));
      const l = Math.min(50, Math.max(1, parseInt(limit)));
      const offset = (p - 1) * l;

      const clinic = await fastify.prisma.clinic.findFirst({
        where: { ownerId: req.user.sub },
      });
      if (!clinic) return reply.code(404).send({ error: 'Not Found', message: 'Clínica no encontrada' });

      const where = {
        gap: { clinicId: clinic.id },
        ...(status ? { status: status as 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' } : {}),
      };

      const [bookings, total] = await Promise.all([
        fastify.prisma.booking.findMany({
          where,
          include: {
            gap: {
              include: {
                clinic: { select: { id: true, name: true, address: true, photos: true } },
              },
            },
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: l,
        }),
        fastify.prisma.booking.count({ where }),
      ]);

      return reply.send({
        data: bookings.map(serializeBooking),
        total,
        page: p,
        limit: l,
        hasMore: offset + bookings.length < total,
      });
    },
  );

  // ────────────────────────────────────────────────────────────────────────
  // PATCH /bookings/:id — cambiar estado (paciente cancela, clínica completa)
  // ────────────────────────────────────────────────────────────────────────
  fastify.patch(
    '/bookings/:id',
    { preHandler: fastify.authenticate },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const body = updateBookingSchema.safeParse(req.body);
      if (!body.success) {
        return reply.code(400).send({ error: 'Bad Request', message: body.error.flatten() });
      }

      const booking = await fastify.prisma.booking.findUnique({
        where: { id },
        include: {
          gap: { include: { clinic: { select: { ownerId: true } } } },
        },
      });

      if (!booking) return reply.code(404).send({ error: 'Not Found', message: 'Reserva no encontrada' });

      const isPatient = booking.userId === req.user.sub;
      const isClinicOwner = booking.gap.clinic.ownerId === req.user.sub;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isPatient && !isClinicOwner && !isAdmin) {
        return reply.code(403).send({ error: 'Forbidden', message: 'Sin permisos sobre esta reserva' });
      }

      // Paciente solo puede cancelar
      if (isPatient && !isClinicOwner && body.data.status !== 'CANCELLED') {
        return reply.code(403).send({ error: 'Forbidden', message: 'Los pacientes solo pueden cancelar reservas' });
      }

      const updated = await fastify.prisma.$transaction(async (tx) => {
        const updated = await tx.booking.update({
          where: { id },
          data: { status: body.data.status },
          include: {
            gap: { include: { clinic: { select: { id: true, name: true, address: true, photos: true } } } },
            user: { select: { id: true, name: true, email: true } },
          },
        });

        // Si se cancela una reserva confirmada → liberar plaza en el gap
        if (body.data.status === 'CANCELLED' && booking.status === 'CONFIRMED') {
          const confirmedCount = await tx.booking.count({
            where: { gapId: booking.gapId, status: 'CONFIRMED' },
          });
          if (confirmedCount < booking.gap.maxBookings) {
            await tx.gap.update({
              where: { id: booking.gapId },
              data: { status: 'AVAILABLE' },
            });
          }
        }

        return updated;
      });

      return reply.send({ data: serializeBooking(updated) });
    },
  );
};

// ── Serializar fechas ────────────────────────────────────────────────────────
function serializeBooking(b: {
  id: string;
  gapId: string;
  userId: string;
  status: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  gap: {
    id?: string;
    datetime?: Date;
    durationMins?: number;
    service?: string;
    discountPrice?: number;
    clinic: { id: string; name: string; address: string; photos: string[] };
  };
  user: { id: string; name: string; email: string };
}) {
  return {
    id: b.id,
    gapId: b.gapId,
    userId: b.userId,
    status: b.status,
    note: b.note,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    gap: {
      ...b.gap,
      datetime: b.gap.datetime?.toISOString(),
    },
    user: b.user,
  };
}

export default bookingsRoutes;
