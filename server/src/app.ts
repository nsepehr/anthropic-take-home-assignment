import Fastify from 'fastify';
import type { HealthStatus } from '@app/shared';

/** Builds the Fastify app without listening, so tests can use `app.inject`. */
export function buildApp() {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

  app.get('/api/health', async (): Promise<HealthStatus> => ({
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
  }));

  return app;
}
