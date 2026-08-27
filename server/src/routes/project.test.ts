import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { createStaticStore } from '../../test/staticStore.js';
import { loadConfig } from '../config.js';
import { loadFixture } from '../../test/fixtures/load.js';

const fixture = loadFixture('valid-project.json');
const app = buildApp({
  config: loadConfig({ NODE_ENV: 'test' }),
  store: createStaticStore(fixture),
});
const get = (url: string) => app.inject({ method: 'GET', url });
afterAll(() => app.close());

describe('project routes', () => {
  it('GET /api/project returns the whole validated project in one payload', async () => {
    const res = await get('/api/project');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(fixture.project);
  });

  it('GET /api/health reports the loaded project name', async () => {
    expect((await get('/api/health')).json()).toMatchObject({
      status: 'ok',
      project: { loaded: true, name: 'Fixture project' },
    });
  });
});
