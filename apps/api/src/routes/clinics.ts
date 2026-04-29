import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const updateClinicSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  address: z.string().min(5).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  photos: z.array(z.string().url()).max(8).optional(),
  services: z.array(z.string()).min(1).optional(),
  description: z.string().max(500).optional(),
});

const clinicsRoutes: FastifyPluginAsync = async (fastify) => {
  // ────────────────────────────────────────────────────────────────────────
  // GET /clinic/me — perfil completo de la clínica del owner autenticado
  // ────────────────────────────────────────────────────────────────────────
  fastify.get(
    '/clinic/me',
    { preHandler: fastify.requireRole('CLINIC_OWNER') },
    async (req, reply) => {
      const clinic = await fastify.prisma.clinic.findFirst({
        where: { ownerId: req.user.sub },
        include: {
          subscription: true,
          _count: { select: { gaps: true } },
        },
      });

      if (!clinic) {
        return reply.code(404).send({ error: 'Not Found', message: 'Clínica no encontrada' });
      }

      return reply.send({ data: serializeClinic(clinic) });
    },
  );

  // ────────────────────────────────────────────────────────────────────────
  // PATCH /clinic/me — actualizar perfil de clínica
  // ────────────────────────────────────────────────────────────────────────
  fastify.patch(
    '/clinic/me',
    { preHandler: fastify.requireRole('CLINIC_OWNER') },
    async (req, reply) => {
      const body = updateClinicSchema.safeParse(req.body);
      if (!body.success) {
        return reply.code(400).send({ error: 'Bad Request', message: body.error.flatten() });
      }

      const clinic = await fastify.prisma.clinic.findFirst({
        where: { ownerId: req.user.sub },
      });
      if (!clinic) {
        return reply.code(404).send({ error: 'Not Found', message: 'Clínica no encontrada' });
      }

      const updated = await fastify.prisma.clinic.update({
        where: { id: clinic.id },
        data: body.data,
        include: { subscription: true, _count: { select: { gaps: true } } },
      });

      return reply.send({ data: serializeClinic(updated) });
    },
  );

  // ────────────────────────────────────────────────────────────────────────
  // GET /clinic/stats — métricas del dashboard
  // ────────────────────────────────────────────────────────────────────────
  fastify.get(
    '/clinic/stats',
    { preHandler: fastify.requireRole('CLINIC_OWNER') },
    async (req, reply) => {
      const clinic = await fastify.prisma.clinic.findFirst({
        where: { ownerId: req.user.sub },
      });
      if (!clinic) {
        return reply.code(404).send({ error: 'Not Found', message: 'Clínica no encontrada' });
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [totalGaps, activeGaps, totalBookings, confirmedBookings, monthlyBookings] =
        await Promise.all([
          fastify.prisma.gap.count({ where: { clinicId: clinic.id } }),
          fastify.prisma.gap.count({ where: { clinicId: clinic.id, status: 'AVAILABLE' } }),
          fastify.prisma.booking.count({ where: { gap: { clinicId: clinic.id } } }),
          fastify.prisma.booking.count({
            where: { gap: { clinicId: clinic.id }, status: 'CONFIRMED' },
          }),
          fastify.prisma.booking.count({
            where: {
              gap: { clinicId: clinic.id },
              status: 'CONFIRMED',
              createdAt: { gte: startOfMonth },
            },
          }),
        ]);

      // Revenue estimado: suma de discountPrice de reservas confirmadas del mes
      const revenueRows = await fastify.prisma.booking.findMany({
        where: {
          gap: { clinicId: clinic.id },
          status: 'CONFIRMED',
          createdAt: { gte: startOfMonth },
        },
        include: { gap: { select: { discountPrice: true } } },
      });
      const revenueThisMonth = revenueRows.reduce((sum, b) => sum + b.gap.discountPrice, 0);

      const occupancyRate =
        totalGaps > 0 ? Math.round((confirmedBookings / totalGaps) * 100) : 0;

      return reply.send({
        data: {
          totalGaps,
          activeGaps,
          totalBookings,
          confirmedBookings,
          monthlyBookings,
          revenueThisMonth: parseFloat(revenueThisMonth.toFixed(2)),
          occupancyRate,
        },
      });
    },
  );

  // ────────────────────────────────────────────────────────────────────────
  // GET /clinic/gaps — huecos publicados por la clínica
  // ────────────────────────────────────────────────────────────────────────
  fastify.get(
    '/clinic/gaps',
    { preHandler: fastify.requireRole('CLINIC_OWNER') },
    async (req, reply) => {
      const { page = '1', limit = '20', status } = req.query as Record<string, string>;
      const p = Math.max(1, parseInt(page));
      const l = Math.min(50, Math.max(1, parseInt(limit)));
      const offset = (p - 1) * l;

      const clinic = await fastify.prisma.clinic.findFirst({
        where: { ownerId: req.user.sub },
      });
      if (!clinic) return reply.code(404).send({ error: 'Not Found' });

      const where = {
        clinicId: clinic.id,
        ...(status ? { status: status as 'AVAILABLE' | 'BOOKED' | 'CANCELLED' | 'COMPLETED' } : {}),
      };

      const [gaps, total] = await Promise.all([
        fastify.prisma.gap.findMany({
          where,
          include: {
            _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
          },
          orderBy: { datetime: 'desc' },
          skip: offset,
          take: l,
        }),
        fastify.prisma.gap.count({ where }),
      ]);

      const data = gaps.map((g) => ({
        id: g.id,
        datetime: g.datetime.toISOString(),
        durationMins: g.durationMins,
        service: g.service,
        stdPrice: g.stdPrice,
        discountPrice: g.discountPrice,
        maxBookings: g.maxBookings,
        confirmedBookings: g._count.bookings,
        status: g.status,
        createdAt: g.createdAt.toISOString(),
        discountPct: Math.round(((g.stdPrice - g.discountPrice) / g.stdPrice) * 100),
      }));

      return reply.send({ data, total, page: p, limit: l, hasMore: offset + gaps.length < total });
    },
  );

  // ────────────────────────────────────────────────────────────────────────
  // GET /clinics/:id — perfil público de una clínica (para pacientes)
  // ────────────────────────────────────────────────────────────────────────
  fastify.get('/clinics/:id', async (req, reply) => {
    const { id } = req.params as { id: string };

    const clinic = await fastify.prisma.clinic.findUnique({
      where: { id },
      include: {
        gaps: {
          where: { status: 'AVAILABLE', datetime: { gt: new Date() } },
          orderBy: { datetime: 'asc' },
          take: 5,
        },
      },
    });

    if (!clinic) return reply.code(404).send({ error: 'Not Found', message: 'Clínica no encontrada' });

    return reply.send({
      data: {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        lat: clinic.lat,
        lng: clinic.lng,
        photos: clinic.photos,
        services: clinic.services,
        description: clinic.description,
        verified: clinic.verified,
        upcomingGaps: clinic.gaps.map((g) => ({
          ...g,
          datetime: g.datetime.toISOString(),
          discountPct: Math.round(((g.stdPrice - g.discountPrice) / g.stdPrice) * 100),
        })),
      },
    });
  });
};

function serializeClinic(clinic: {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  photos: string[];
  services: string[];
  description: string | null;
  ownerId: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: Date;
  } | null;
  _count?: { gaps: number };
}) {
  return {
    id: clinic.id,
    name: clinic.name,
    address: clinic.address,
    lat: clinic.lat,
    lng: clinic.lng,
    photos: clinic.photos,
    services: clinic.services,
    description: clinic.description,
    ownerId: clinic.ownerId,
    verified: clinic.verified,
    createdAt: clinic.createdAt.toISOString(),
    subscription: clinic.subscription
      ? {
          plan: clinic.subscription.plan,
          status: clinic.subscription.status,
          currentPeriodEnd: clinic.subscription.currentPeriodEnd.toISOString(),
        }
      : null,
    totalGaps: clinic._count?.gaps ?? 0,
  };
}

export default clinicsRoutes;
