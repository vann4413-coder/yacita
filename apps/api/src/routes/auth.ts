import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { hashPassword, verifyPassword } from '../lib/password.js';

const registerPatientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(80),
});

const registerClinicSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(80),
  clinicName: z.string().min(2).max(120),
  address: z.string().min(5),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  services: z.array(z.string()).min(1),
  description: z.string().max(500).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /auth/register — paciente
  fastify.post('/auth/register', async (req, reply) => {
    const body = registerPatientSchema.safeParse(req.body);
    if (!body.success) {
      return reply.code(400).send({ error: 'Bad Request', message: body.error.flatten() });
    }

    const { email, password, name } = body.data;

    const existing = await fastify.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({ error: 'Conflict', message: 'El email ya está registrado' });
    }

    const user = await fastify.prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        name,
        role: 'PATIENT',
      },
    });

    const token = fastify.jwt.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return reply.code(201).send({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  });

  // POST /auth/clinic — registro de clínica + propietario
  fastify.post('/auth/clinic', async (req, reply) => {
    const body = registerClinicSchema.safeParse(req.body);
    if (!body.success) {
      return reply.code(400).send({ error: 'Bad Request', message: body.error.flatten() });
    }

    const { email, password, name, clinicName, address, lat, lng, services, description } =
      body.data;

    const existing = await fastify.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({ error: 'Conflict', message: 'El email ya está registrado' });
    }

    // Crear usuario owner + clínica en una sola transacción
    const { owner, clinic } = await fastify.prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          email,
          passwordHash: await hashPassword(password),
          name,
          role: 'CLINIC_OWNER',
          lat,
          lng,
        },
      });

      const clinic = await tx.clinic.create({
        data: {
          name: clinicName,
          address,
          lat,
          lng,
          services,
          description,
          photos: [],
          ownerId: owner.id,
        },
      });

      return { owner, clinic };
    });

    const token = fastify.jwt.sign({
      sub: owner.id,
      email: owner.email,
      name: owner.name,
      role: owner.role,
    });

    return reply.code(201).send({
      token,
      user: { id: owner.id, email: owner.email, name: owner.name, role: owner.role },
      clinicId: clinic.id,
    });
  });

  // POST /auth/login
  fastify.post('/auth/login', async (req, reply) => {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      return reply.code(400).send({ error: 'Bad Request', message: body.error.flatten() });
    }

    const { email, password } = body.data;

    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized', message: 'Credenciales incorrectas' });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return reply.code(401).send({ error: 'Unauthorized', message: 'Credenciales incorrectas' });
    }

    const token = fastify.jwt.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return reply.send({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  });

  // GET /auth/me — perfil propio (protegido)
  fastify.get(
    '/auth/me',
    { preHandler: fastify.authenticate },
    async (req, reply) => {
      const user = await fastify.prisma.user.findUnique({
        where: { id: req.user.sub },
        select: { id: true, email: true, name: true, avatar: true, role: true, lat: true, lng: true, createdAt: true },
      });
      if (!user) return reply.code(404).send({ error: 'Not Found' });
      return reply.send({ data: user });
    },
  );

  // PATCH /auth/me — actualizar perfil (pushToken, avatar, lat/lng)
  fastify.patch(
    '/auth/me',
    { preHandler: fastify.authenticate },
    async (req, reply) => {
      const schema = z.object({
        name: z.string().min(2).max(80).optional(),
        pushToken: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
      });

      const body = schema.safeParse(req.body);
      if (!body.success) {
        return reply.code(400).send({ error: 'Bad Request', message: body.error.flatten() });
      }

      const updated = await fastify.prisma.user.update({
        where: { id: req.user.sub },
        data: body.data,
        select: { id: true, email: true, name: true, avatar: true, role: true, lat: true, lng: true },
      });

      return reply.send({ data: updated });
    },
  );
};

export default authRoutes;
