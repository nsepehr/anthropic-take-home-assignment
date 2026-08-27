import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { relatedTo, type ValidateResult } from '@app/shared';
import { isSlug, SLUG } from '../lib/slug.js';
import type { ProjectStore } from '../projectStore.js';
import { findEntity } from '../services/entities.js';

export interface ProjectRoutesOptions {
  store: ProjectStore;
  /** `POST /api/project/reload` is registered only when true (never in production). */
  allowReload: boolean;
}

type IdParams = { Params: { id: string } };

export const projectRoutes: FastifyPluginAsync<ProjectRoutesOptions> = async (app, opts) => {
  const { store } = opts;

  /** Resolves the loaded state or sends a 500 with the readable validation errors. */
  const requireLoaded = (
    reply: FastifyReply,
  ): Extract<ValidateResult, { ok: true }> | undefined => {
    const state = store.current();
    if (state.ok) return state;
    reply.code(500).send({ error: 'project file is invalid', errors: state.errors });
    return undefined;
  };

  /** Validates `:id` as a slug (400) and checks it exists (404); returns the project on success. */
  const requireEntity = (id: string, reply: FastifyReply) => {
    if (!isSlug(id)) {
      reply.code(400).send({ error: `invalid id "${id}": expected ${SLUG}` });
      return undefined;
    }
    const loaded = requireLoaded(reply);
    if (!loaded) return undefined;
    const found = findEntity(loaded.project, id);
    if (!found) {
      reply.code(404).send({ error: `unknown id "${id}"` });
      return undefined;
    }
    return { project: loaded.project, ...found };
  };

  app.get('/api/project', async (_req, reply) => requireLoaded(reply)?.project);

  app.get('/api/project/gaps', async (_req, reply) => requireLoaded(reply)?.gaps);

  app.get<IdParams>('/api/project/related/:id', async (req, reply) => {
    const hit = requireEntity(req.params.id, reply);
    return hit && relatedTo(hit.project, req.params.id);
  });

  app.get<IdParams>('/api/project/entities/:id', async (req, reply) => {
    const hit = requireEntity(req.params.id, reply);
    return hit && { type: hit.type, entity: hit.entity };
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
