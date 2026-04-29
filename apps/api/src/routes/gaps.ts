import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { notifyNewGapNearby } from '../lib/notifications.js';

// ── Schemas de validación ────────────────────────────────────────────────────

const listQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().max(50).default(10),
  type: z.enum(['FISIO', 'MASAJE', 'QUIRO', 'OSTEO']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

const createGapSchema = z.object({
  datetime: z.string().datetime(),
  durationMins: z.number().int().min(15).max(480),
  service: z.enum(['FISIO', 'MASAJE', 'QUIRO', 'OSTEO']),
  stdPrice: z.number().positive(),
  discountPrice: z.number().positive(),
  maxBookings: z.number().int().positive().default(1),
});

const updateGapSchema = z.object({
  datetime: z.string().datetime().optional(),
  durationMins: z.number().int().min(15).max(480).optional(),
  stdPrice: z.number().positive().optional(),
  discountPrice: z.number().positive().optional(),
  status: z.enum(['AVAILABLE', 'CANCELLED']).optional(),
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function calcDiscountPct(std: number, disc: number): number {
  return Math.round(((std - disc) / std) * 100);
}

// ── Plugin ───────────────────────────────────────────────────────────────────

const gapsRoutes: FastifyPluginAsync = async (fastify) => {
  // ────────────────────────────────────────────────────────────────────────
  // GET /gaps — lista paginada, ordenada por distancia (Haversine via SQL)
  // ────────────────────────────────────────────────────────────────────────
  fastify.get('/gaps', async (req, reply) => {
    const q = listQuerySchema.safeParse(req.query);
    if (!q.success) {
      return reply.code(400).send({ error: 'Bad Request', message: q.error.flatten() });
    }

    const { lat, lng, radius, type, date, page, limit } = q.data;
    const offset = (page - 1) * limit;

    // Si hay coordenadas → usamos la función Haversine en Postgres
    if (lat !== undefined && lng !== undefined) {
      type GapsNearRow = {
        gap_id: string;
        clinic_id: string;
        clinic_name: string;
        clinic_address: string;
        clinic_lat: number;
        clinic_lng: number;
        clinic_photos: string[];
        clinic_verified: boolean;
        datetime: Date;
        duration_mins: number;
        service: string;
        std_price: number;
        discount_price: number;
        max_bookings: number;
        status: string;
        distance_km: number;
        discount_pct: number;
      };

      const rows = await fastify.prisma.$queryRaw<GapsNearRow[]>`
        SELECT * FROM gaps_near(
          ${lat}::double precision,
          ${lng}::double precision,
          ${radius}::double precision,
          ${type ?? null}::text,
          ${date ?? null}::date
        )
        LIMIT  ${limit}::int
        OFFSET ${offset}::int
      `;

      const countRows = await fastify.prisma.$queryRaw<[{ total: bigint }]>`
        SELECT COUNT(*) AS total FROM gaps_near(
          ${lat}::double precision,
          ${lng}::double precision,
          ${radius}::double precision,
          ${type ?? null}::text,
          ${date ?? null}::date
        )
      `;

      const total = Number(countRows[0]?.total ?? 0);

      const data = rows.map((r) => ({
        id: r.gap_id,
        datetime: r.datetime.toISOString(),
        durationMins: r.duration_mins,
        service: r.service,
        stdPrice: r.std_price,
        discountPrice: r.discount_price,
        maxBookings: r.max_bookings,
        status: r.status,
        discountPct: Number(r.discount_pct),
        distanceKm: Math.round(Number(r.distance_km) * 10) / 10,
        clinic: {
          id: r.clinic_id,
          name: r.clinic_name,
          address: r.clinic_address,
          lat: r.clinic_lat,
          lng: r.clinic_lng,
          photos: r.clinic_photos,
          verified: r.clinic_verified,
        },
      }));

      return reply.send({ data, total, page, limit, hasMore: offset + rows.length < total });
    }

    // Sin coordenadas → lista simple sin distancia
    const where = {
      status: 'AVAILABLE' as const,
      datetime: { gt: new Date() },
      ...(type ? { service: type } : {}),
      ...(date ? { datetime: { gte: new Date(date), lt: new Date(new Date(date).getTime() + 86_400_000) } } : {}),
    };

    const [gaps, total] = await Promise.all([
      fastify.prisma.gap.findMany({
        where,
        include: {
          clinic: { select: { id: true, name: true, address: true, lat: true, lng: true, photos: true, verified: true } },
        },
        orderBy: { datetime: 'asc' },
        skip: offset,
        take: limit,
      }),
      fastify.prisma.gap.count({ where }),
    ]);

    const data = gaps.map((g) => ({
      ...g,
      datetime: g.datetime.toISOString(),
      discountPct: calcDiscountPct(g.stdPrice, g.discountPrice),
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    }));

    return reply.send({ data, total, page, limit, hasMore: offset + gaps.length < total });
  });

  // ────────────────────────────────────────────────────────────────────────
  // GET /gaps/:id — detalle completo
  // ────────────────────────────────────────────────────────────────────────
  fastify.get('/gaps/:id', async (req, reply) => {
    const { id } = req.params as { id: string };

    const gap = await fastify.prisma.gap.findUnique({
      where: { id },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            address: true,
            lat: true,
            lng: true,
            photos: true,
            services: true,
            description: true,
            verified: true,
          },
        },
        _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
      },
    });

    if (!gap) return reply.code(404).send({ error: 'Not Found', message: 'Hueco no encontrado' });

    const spotsLeft = gap.maxBookings - gap._count.bookings;

    return reply.send({
      data: {
        ...gap,
        datetime: gap.datetime.toISOString(),
        createdAt: gap.createdAt.toISOString(),
        updatedAt: gap.updatedAt.toISOString(),
        discountPct: calcDiscountPct(gap.stdPrice, gap.discountPrice),
        savings: parseFloat((gap.stdPrice - gap.discountPrice).toFixed(2)),
        spotsLeft,
      },
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // POST /gaps — crear hueco (solo CLINIC_OWNER)
  // ────────────────────────────────────────────────────────────────────────
  fastify.post(
    '/gaps',
    { preHandler: fastify.requireRole('CLINIC_OWNER') },
    async (req, reply) => {
      const body = createGapSchema.safeParse(req.body);
      if (!body.success) {
        return reply.code(400).send({ error: 'Bad Request', message: body.error.flatten() });
      }

      // Verificar que la clínica del owner existe y la suscripción está activa
      const clinic = await fastify.prisma.clinic.findFirst({
        where: { ownerId: req.user.sub },
        include: { subscription: true },
      });

      if (!clinic) {
        return reply.code(404).send({ error: 'Not Found', message: 'No tienes una clínica registrada' });
      }

      if (!clinic.subscription || clinic.subscription.status !== 'ACTIVE') {
        return reply.code(402).send({ error: 'Payment Required', message: 'Necesitas una suscripción activa para publicar huecos' });
      }

      // Plan BASIC: máximo 10 huecos activos por mes
      if (clinic.subscription.plan === 'BASIC') {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyCount = await fastify.prisma.gap.count({
          where: {
            clinicId: clinic.id,
            createdAt: { gte: startOfMonth },
            status: { not: 'CANCELLED' },
          },
        });

        if (monthlyCount >= 10) {
          return reply.code(403).send({
            error: 'Forbidden',
            message: 'Has alcanzado el límite de 10 huecos/mes del Plan Básico. Actualiza a Pro.',
          });
        }
      }

      if (body.data.discountPrice >= body.data.stdPrice) {
        return reply.code(400).send({ error: 'Bad Request', message: 'El precio con descuento debe ser menor al precio estándar' });
      }

      const gap = await fastify.prisma.gap.create({
        data: {
          clinicId: clinic.id,
          datetime: new Date(body.data.datetime),
          durationMins: body.data.durationMins,
          service: body.data.service,
          stdPrice: body.data.stdPrice,
          discountPrice: body.data.discountPrice,
          maxBookings: body.data.maxBookings,
        },
      });

      // Fan-out: notificar a pacientes cercanos (radio 10 km) en background
      void (async () => {
        try {
          const discountPct = Math.round(
            ((body.data.stdPrice - body.data.discountPrice) / body.data.stdPrice) * 100,
          );
          // Buscar pacientes con pushToken dentro del radio usando Haversine
          const nearbyUsers = await fastify.prisma.$queryRaw<{ push_token: string }[]>`
            SELECT u."pushToken" AS push_token
            FROM "users" u
            WHERE u."pushToken" IS NOT NULL
              AND u."role" = 'PATIENT'
              AND u."lat" IS NOT NULL
              AND u."lng" IS NOT NULL
              AND 6371 * 2 * ASIN(
                SQRT(
                  POWER(SIN(RADIANS(u."lat" - ${clinic.lat}::double precision) / 2), 2) +
                  COS(RADIANS(${clinic.lat}::double precision)) * COS(RADIANS(u."lat")) *
                  POWER(SIN(RADIANS(u."lng" - ${clinic.lng}::double precision) / 2), 2)
                )
              ) <= 10
          `;
          const tokens = nearbyUsers.map((r) => r.push_token).filter(Boolean);
          if (tokens.length > 0) {
            await notifyNewGapNearby(tokens, {
              clinicName: clinic.name,
              service: gap.service,
              discountPrice: gap.discountPrice,
              discountPct,
              gapId: gap.id,
            });
          }
        } catch (err) {
          fastify.log.warn({ err }, 'Error sending nearby gap notifications');
        }
      })();

      return reply.code(201).send({ data: { ...gap, datetime: gap.datetime.toISOString() } });
    },
  );

  // ────────────────────────────────────────────────────────────────────────
  // PATCH /gaps/:id — editar hueco (solo owner del hueco)
  // ────────────────────────────────────────────────────────────────────────
  fastify.patch(
    '/gaps/:id',
    { preHandler: fastify.requireRole('CLINIC_OWNER') },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const body = updateGapSchema.safeParse(req.body);
      if (!body.success) {
        return reply.code(400).send({ error: 'Bad Request', message: body.error.flatten() });
      }

      const gap = await fastify.prisma.gap.findUnique({
        where: { id },
        include: { clinic: { select: { ownerId: true } } },
      });

      if (!gap) return reply.code(404).send({ error: 'Not Found', message: 'Hueco no encontrado' });
      if (gap.clinic.ownerId !== req.user.sub && req.user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden', message: 'No tienes permisos sobre este hueco' });
      }

      if (gap.status === 'BOOKED') {
        return reply.code(409).send({ error: 'Conflict', message: 'No puedes editar un hueco ya reservado' });
      }

      const updateData: Record<string, unknown> = { ...body.data };
      if (body.data.datetime) updateData['datetime'] = new Date(body.data.datetime);

      const updated = await fastify.prisma.gap.update({ where: { id }, data: updateData });

      return reply.send({ data: { ...updated, datetime: updated.datetime.toISOString() } });
    },
  );

  // ────────────────────────────────────────────────────────────────────────
  // DELETE /gaps/:id — cancelar hueco (owner o admin)
  // ────────────────────────────────────────────────────────────────────────
  fastify.delete(
    '/gaps/:id',
    { preHandler: fastify.requireRole('CLINIC_OWNER') },
    async (req, reply) => {
      const { id } = req.params as { id: string };

      const gap = await fastify.prisma.gap.findUnique({
        where: { id },
        include: { clinic: { select: { ownerId: true } } },
      });

      if (!gap) return reply.code(404).send({ error: 'Not Found', message: 'Hueco no encontrado' });
      if (gap.clinic.ownerId !== req.user.sub && req.user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden', message: 'No tienes permisos sobre este hueco' });
      }

      // Soft-delete: marcar como CANCELLED en vez de borrar
      await fastify.prisma.$transaction(async (tx) => {
        await tx.gap.update({ where: { id }, data: { status: 'CANCELLED' } });
        // Cancelar reservas activas del hueco
        await tx.booking.updateMany({
          where: { gapId: id, status: 'CONFIRMED' },
          data: { status: 'CANCELLED' },
        });
      });

      return reply.code(204).send();
    },
  );
};

export default gapsRoutes;
