import Fastify from 'fastify';
import { loadConfig, type Config } from './config.js';
import { createProjectStore, type ProjectStore } from './projectStore.js';
import { healthRoutes } from './routes/health.js';
import { projectRoutes } from './routes/project.js';

export interface BuildAppOptions {
  config?: Config;
  store?: ProjectStore;
}

/** Composition root. Builds the Fastify app without listening, so tests can use `app.inject`. */
export function buildApp(options: BuildAppOptions = {}) {
  const config = options.config ?? loadConfig();
  const store = options.store ?? createProjectStore(config.projectFile);
  const app = Fastify({ logger: !config.isTest });

  app.register(healthRoutes, { store });
  app.register(projectRoutes, { store, allowReload: !config.isProduction });

  return app;
}
