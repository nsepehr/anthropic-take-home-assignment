import { afterAll, describe, expect, it } from 'vitest';
import { relatedTo } from '@app/shared';
import { buildApp } from '../app.js';
import { createStaticStore } from '../../test/staticStore.js';
import { loadConfig } from '../config.js';
import { loadFixture } from '../../test/fixtures/load.js';

const fixture = loadFixture('valid-project.json');
const app = buildApp({
  config: loadConfig({ NODE_ENV: 'test' }),
  store: createStaticStore({ ok: true, ...fixture }),
});
const get = (url: string) => app.inject({ method: 'GET', url });
afterAll(() => app.close());

describe('project routes', () => {
  it('GET /api/project returns the validated project', async () => {
    const res = await get('/api/project');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(fixture.project);
  });

  it('GET /api/project/gaps returns the gaps report', async () => {
    expect((await get('/api/project/gaps')).json()).toEqual(fixture.gaps);
  });

  it('GET /api/health reports the loaded project name', async () => {
    expect((await get('/api/health')).json()).toMatchObject({
      status: 'ok',
      project: { loaded: true, name: 'Fixture project' },
    });
  });

  it('related/:id returns the closure for a known id', async () => {
    const res = await get('/api/project/related/int-a');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(relatedTo(fixture.project, 'int-a'));
    expect(res.json().systemIds).toContain('sys-a');
  });

  it('related/:id → 404 for unknown, 400 for malformed', async () => {
    const unknown = await get('/api/project/related/sys-nope');
    expect(unknown.statusCode).toBe(404);
    expect(unknown.json()).toEqual({ error: expect.stringContaining('sys-nope') });
    const malformed = await get('/api/project/related/Not%20A%20Slug');
    expect(malformed.statusCode).toBe(400);
    expect(malformed.json().error).toMatch(/invalid id/);
  });

  it('entities/:id returns the entity with its type', async () => {
    expect((await get('/api/project/entities/req-a')).json()).toEqual({
      type: 'requirement',
      entity: fixture.project.requirements[0],
    });
    expect((await get('/api/project/entities/edge-a')).json().type).toBe('edge');
    expect((await get('/api/project/entities/nope')).statusCode).toBe(404);
  });
});
