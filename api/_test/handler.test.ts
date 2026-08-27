import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import handler from '../[...path].js';

// Drives the Vercel handler through a real Node http server, as Vercel's runtime does.
let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => void handler(req, res));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('no port');
  base = `http://127.0.0.1:${address.port}`;
});
afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

describe('Vercel handler', () => {
  it('GET /api/project → 200 and the project name from data/project.json', async () => {
    const res = await fetch(`${base}/api/project`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ name: 'Codebase Map' });
  });

  it('GET /api/health → loaded:true', async () => {
    const res = await fetch(`${base}/api/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ project: { loaded: true, name: 'Codebase Map' } });
  });
});
