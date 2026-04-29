import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import type Stripe from 'stripe';
import { z } from 'zod';
import { env } from '../env.js';

// ── Mapeo plan → priceId de Stripe ─────────────────────────────────────────
const PRICE_IDS = {
  BASIC: env.STRIPE_PRICE_BASIC,
  PRO:   env.STRIPE_PRICE_PRO,
} as const;

const checkoutSchema = z.object({
  plan: z.enum(['BASIC', 'PRO']),
});

const stripeRoutes: FastifyPluginAsync = async (fastify) => {
  // ────────────────────────────────────────────────────────────────────────
  // POST /stripe/checkout — crea sesión de suscripción en Stripe Checkout
  // ────────────────────────────────────────────────────────────────────────
  fastify.post(
    '/stripe/checkout',
    { preHandler: fastify.requireRole('CLINIC_OWNER') },
    async (req, reply) => {
      const body = checkoutSchema.safeParse(req.body);
      if (!body.success) {
        return reply.code(400).send({ error: 'Bad Request', message: body.error.flatten() });
      }

      const clinic = await fastify.prisma.clinic.findFirst({
        where: { ownerId: req.user.sub },
        include: { subscription: true },
      });
      if (!clinic) {
        return reply.code(404).send({ error: 'Not Found', message: 'Clínica no encontrada' });
      }

      // Si ya tiene suscripción activa → redirigir al portal
      if (clinic.subscription?.status === 'ACTIVE') {
        return reply.code(409).send({
          error: 'Conflict',
          message: 'Ya tienes una suscripción activa. Usa el portal para gestionarla.',
        });
      }

      // Obtener o crear customer en Stripe
      let customerId = clinic.subscription?.stripeCustomerId;
      if (!customerId) {
        const customer = await fastify.stripe.customers.create({
          email: req.user.email,
          name: req.user.name,
          metadata: { clinicId: clinic.id, userId: req.user.sub },
        });
        customerId = customer.id;
      }

      const session = await fastify.stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: PRICE_IDS[body.data.plan], quantity: 1 }],
        success_url: `${env.WEB_URL}/clinic/billing?success=1`,
        cancel_url:  `${env.WEB_URL}/clinic/billing?cancelled=1`,
        subscription_data: {
          metadata: { clinicId: clinic.id, plan: body.data.plan },
        },
        allow_promotion_codes: true,
        locale: 'es',
      });

      return reply.send({ data: { url: session.url } });
    },
  );

  // ────────────────────────────────────────────────────────────────────────
  // GET /stripe/portal — URL del Customer Portal de Stripe
  // ────────────────────────────────────────────────────────────────────────
  fastify.get(
    '/stripe/portal',
    { preHandler: fastify.requireRole('CLINIC_OWNER') },
    async (req, reply) => {
      const clinic = await fastify.prisma.clinic.findFirst({
        where: { ownerId: req.user.sub },
        include: { subscription: true },
      });

      if (!clinic?.subscription?.stripeCustomerId) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'No tienes ninguna suscripción. Contrata un plan primero.',
        });
      }

      const session = await fastify.stripe.billingPortal.sessions.create({
        customer: clinic.subscription.stripeCustomerId,
        return_url: `${env.WEB_URL}/clinic/billing`,
        locale: 'es',
      });

      return reply.send({ data: { url: session.url } });
    },
  );

  // ────────────────────────────────────────────────────────────────────────
  // POST /stripe/webhook — recibe eventos de Stripe (raw body)
  // ────────────────────────────────────────────────────────────────────────
  fastify.post(
    '/stripe/webhook',
    {
      config: { rawBody: true },
    },
    async (req: FastifyRequest & { rawBody?: Buffer }, reply) => {
      const sig = req.headers['stripe-signature'];
      if (!sig || !req.rawBody) {
        return reply.code(400).send({ error: 'Missing stripe-signature or body' });
      }

      let event: Stripe.Event;
      try {
        event = fastify.stripe.webhooks.constructEvent(
          req.rawBody,
          sig,
          env.STRIPE_WEBHOOK_SECRET,
        );
      } catch (err) {
        fastify.log.warn({ err }, 'Webhook signature verification failed');
        return reply.code(400).send({ error: 'Invalid signature' });
      }

      try {
        await handleStripeEvent(fastify, event);
      } catch (err) {
        fastify.log.error({ err, eventType: event.type }, 'Error processing webhook');
        return reply.code(500).send({ error: 'Webhook processing failed' });
      }

      return reply.send({ received: true });
    },
  );
};

// ── Handlers de eventos ─────────────────────────────────────────────────────

async function handleStripeEvent(
  fastify: { prisma: import('@prisma/client').PrismaClient; log: { info: (...a: unknown[]) => void } },
  event: Stripe.Event,
) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;

      const subId      = session.subscription as string;
      const customerId = session.customer    as string;

      const sub = await (fastify as { stripe: Stripe }).stripe.subscriptions.retrieve(subId);
      const clinicId = sub.metadata?.['clinicId'];
      const plan = (sub.metadata?.['plan'] as 'BASIC' | 'PRO') ?? 'BASIC';

      if (!clinicId) {
        fastify.log.info({ subId }, 'checkout.session.completed: no clinicId in metadata');
        break;
      }

      await fastify.prisma.subscription.upsert({
        where: { clinicId },
        create: {
          clinicId,
          stripeCustomerId: customerId,
          stripeSubId: subId,
          plan,
          status: 'ACTIVE',
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
        update: {
          stripeCustomerId: customerId,
          stripeSubId: subId,
          plan,
          status: 'ACTIVE',
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });

      fastify.log.info({ clinicId, plan }, 'Subscription activated');
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const plan = (sub.metadata?.['plan'] as 'BASIC' | 'PRO') ?? 'BASIC';

      const status = stripeStatusToLocal(sub.status);
      const cancelAtEnd = sub.cancel_at_period_end;

      await fastify.prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: {
          status,
          plan,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtEnd,
        },
      });

      fastify.log.info({ subId: sub.id, status, plan }, 'Subscription updated');
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;

      await fastify.prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: { status: 'CANCELLED' },
      });

      fastify.log.info({ subId: sub.id }, 'Subscription cancelled');
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = invoice.subscription as string | null;
      if (!subId) break;

      await fastify.prisma.subscription.updateMany({
        where: { stripeSubId: subId },
        data: { status: 'PAST_DUE' },
      });

      fastify.log.info({ subId }, 'Subscription past_due due to payment failure');
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = invoice.subscription as string | null;
      if (!subId) break;

      await fastify.prisma.subscription.updateMany({
        where: { stripeSubId: subId },
        data: { status: 'ACTIVE' },
      });
      break;
    }

    default:
      break;
  }
}

function stripeStatusToLocal(
  status: Stripe.Subscription.Status,
): 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' {
  if (status === 'active' || status === 'trialing') return 'ACTIVE';
  if (status === 'past_due' || status === 'unpaid')  return 'PAST_DUE';
  return 'CANCELLED';
}

export default stripeRoutes;
