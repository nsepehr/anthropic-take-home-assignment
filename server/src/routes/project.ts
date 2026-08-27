import type { FastifyPluginAsync } from 'fastify';
import type { ProjectStore } from '../stores/projectStore.js';

export interface ProjectRoutesOptions {
  store: ProjectStore;
  /** `POST /api/project/reload` is registered only when true (never in production). */
  allowReload: boolean;
}

/**
 * The API is one payload: `GET /api/project` returns the whole validated model (or 500 with the
 * readable validation errors). The client derives selection, highlighting and gaps locally.
 */
export const projectRoutes: FastifyPluginAsync<ProjectRoutesOptions> = async (app, opts) => {
  const { store } = opts;

  app.get('/api/project', async (_req, reply) => {
    const state = store.current();
    if (state.ok) return state.project;
    return reply.code(500).send({ error: 'project file is invalid', errors: state.errors });
  });

  if (opts.allowReload) {
    app.post('/api/project/reload', async () => {
      const state = store.reload();
      return state.ok
        ? { ok: true, name: state.project.name }
        : { ok: false, errors: state.errors };
    });
  }
};
