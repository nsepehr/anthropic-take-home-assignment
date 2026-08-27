import { mkdtempSync, copyFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { loadConfig } from '../config.js';
import { createProjectStore } from './projectStore.js';
import { fixturePath } from '../../test/fixtures/load.js';

const testConfig = (projectFile: string) =>
  loadConfig({ NODE_ENV: 'test', PROJECT_FILE: projectFile });

describe('projectStore', () => {
  it('invalid file → store reports errors, app still boots', async () => {
    const store = createProjectStore(fixturePath('invalid-project.json'));
    const state = store.current();
    expect(state.ok).toBe(false);
    if (!state.ok) expect(state.errors[0]?.path).toBe('requirements.0.systemIds.0');

    const app = buildApp({ config: testConfig(fixturePath('invalid-project.json')) });
    const project = await app.inject({ method: 'GET', url: '/api/project' });
    expect(project.statusCode).toBe(500);
    expect(project.json().errors).toHaveLength(1);
    const health = await app.inject({ method: 'GET', url: '/api/health' });
    expect(health.json()).toMatchObject({ status: 'ok', project: { loaded: false } });
    await app.close();
  });

  it('missing or unparsable file → error, not a crash', () => {
    expect(createProjectStore('/nonexistent/project.json').current().ok).toBe(false);
  });

  it('reload picks up file changes', async () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), 'project-')), 'project.json');
    copyFileSync(fixturePath('valid-project.json'), file);
    const app = buildApp({ config: testConfig(file) });
    expect((await app.inject({ method: 'GET', url: '/api/project' })).json().name).toBe(
      'Fixture project',
    );

    writeFileSync(file, '{ not json');
    const reload = await app.inject({ method: 'POST', url: '/api/project/reload' });
    expect(reload.json().ok).toBe(false);
    expect((await app.inject({ method: 'GET', url: '/api/project' })).statusCode).toBe(500);
    await app.close();
  });

  it('reload route is disabled in production', async () => {
    const app = buildApp({
      config: { ...testConfig(fixturePath('valid-project.json')), isProduction: true },
    });
    const res = await app.inject({ method: 'POST', url: '/api/project/reload' });
    expect(res.statusCode).toBe(404);
    await app.close();
  });
});
