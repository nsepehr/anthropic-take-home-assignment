import type { FastifyPluginAsync } from 'fastify';
import type { HealthStatus } from '@app/shared';
import type { ProjectStore } from '../projectStore.js';

export const healthRoutes: FastifyPluginAsync<{ store: ProjectStore }> = async (app, { store }) => {
  app.get('/api/health', async (): Promise<HealthStatus> => {
    const state = store.current();
    return {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      project: state.ok ? { loaded: true, name: state.project.name } : { loaded: false },
    };
  });
};
