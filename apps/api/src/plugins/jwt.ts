import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import type { UserRole } from '@yacita/types';

import { env } from '../env.js';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (role: UserRole) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const jwtPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  fastify.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      reply.code(401).send({ error: 'Unauthorized', message: 'Token inválido o expirado' });
    }
  });

  fastify.decorate(
    'requireRole',
    (role: UserRole) => async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        await req.jwtVerify();
      } catch {
        reply.code(401).send({ error: 'Unauthorized', message: 'Token inválido o expirado' });
        return;
      }
      if (req.user.role !== role && req.user.role !== 'ADMIN') {
        reply.code(403).send({ error: 'Forbidden', message: 'Sin permisos suficientes' });
      }
    },
  );
});

export default jwtPlugin;
