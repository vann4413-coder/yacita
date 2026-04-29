import './env.js'; // valida variables al arrancar

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import rawBody from 'fastify-raw-body';

import { env } from './env.js';
import { registerErrorHandler } from './lib/errors.js';

// Plugins de infraestructura
import prismaPlugin from './plugins/prisma.js';
import supabasePlugin from './plugins/supabase.js';
import jwtPlugin from './plugins/jwt.js';
import stripePlugin from './plugins/stripe.js';

// Rutas
import authRoutes from './routes/auth.js';
import gapsRoutes from './routes/gaps.js';
import bookingsRoutes from './routes/bookings.js';
import clinicsRoutes from './routes/clinics.js';
import stripeRoutes from './routes/stripe.js';
import { runReminderJob } from './jobs/reminders.js';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'warn' : 'info',
    ...(env.NODE_ENV === 'development'
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : {}),
  },
});

async function buildServer() {
  // ── CORS ────────────────────────────────────────────────────────────
  await fastify.register(cors, {
    origin: [env.WEB_URL, /^exp:\/\//, /localhost/],
    credentials: true,
  });

  // ── Rate limit ───────────────────────────────────────────────────────
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // ── Swagger (solo dev) ───────────────────────────────────────────────
  if (env.NODE_ENV !== 'production') {
    await fastify.register(swagger, {
      openapi: {
        info: { title: 'Yacita API', version: '1.0.0', description: 'API del marketplace Yacita' },
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
        },
      },
    });
    await fastify.register(swaggerUi, { routePrefix: '/docs' });
  }

  // ── Raw body (necesario para verificar firma Stripe) ────────────────
  await fastify.register(rawBody, {
    field: 'rawBody',
    global: false,       // solo en rutas que lo activen con config: { rawBody: true }
    encoding: false,
    runFirst: true,
  });

  // ── Infraestructura ──────────────────────────────────────────────────
  await fastify.register(prismaPlugin);
  await fastify.register(supabasePlugin);
  await fastify.register(jwtPlugin);
  await fastify.register(stripePlugin);

  // ── Error handler ────────────────────────────────────────────────────
  registerErrorHandler(fastify);

  // ── Health check ─────────────────────────────────────────────────────
  fastify.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
    env: env.NODE_ENV,
  }));

  // ── Rutas ────────────────────────────────────────────────────────────
  await fastify.register(authRoutes);
  await fastify.register(gapsRoutes);
  await fastify.register(bookingsRoutes);
  await fastify.register(clinicsRoutes);
  await fastify.register(stripeRoutes);

  return fastify;
}

async function start() {
  const server = await buildServer();

  // ── onClose debe registrarse ANTES de listen ─────────────────────────
  let reminderInterval: ReturnType<typeof setInterval> | undefined;
  server.addHook('onClose', () => {
    if (reminderInterval) clearInterval(reminderInterval);
  });

  try {
    await server.listen({ port: env.PORT, host: '0.0.0.0' });
    server.log.info(`API corriendo en ${env.API_URL}`);
    if (env.NODE_ENV !== 'production') {
      server.log.info(`Docs disponibles en ${env.API_URL}/docs`);
    }

    // ── Cron: recordatorios 1h antes — cada 60 segundos ─────────────────
    reminderInterval = setInterval(async () => {
      try {
        await runReminderJob(server.prisma);
      } catch (err) {
        server.log.error({ err }, 'Error en reminder job');
      }
    }, 60_000);

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    await fastify.close();
    process.exit(0);
  });
});

start();
