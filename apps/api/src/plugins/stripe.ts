import Stripe from 'stripe';
import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { env } from '../env.js';

declare module 'fastify' {
  interface FastifyInstance {
    stripe: Stripe;
  }
}

const stripePlugin: FastifyPluginAsync = fp(async (fastify) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
    typescript: true,
  });

  fastify.decorate('stripe', stripe);
});

export default stripePlugin;
