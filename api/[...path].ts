import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp } from '../server/src/app.js';
import { loadConfig } from '../server/src/config.js';

/**
 * Vercel serverless entry for every `/api/*` request. Wraps the same Fastify app the dev server
 * runs, built once per lambda instance. The project file is resolved relative to this file (never
 * the cwd) so it works from the bundled function directory; `vercel.json` includes it.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const projectFile = path.resolve(here, '..', 'data', 'project.json');

const app = buildApp({ config: loadConfig({ ...process.env, PROJECT_FILE: projectFile }) });
const ready = app.ready();

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await ready;
  app.server.emit('request', req, res);
}
