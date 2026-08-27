import { afterEach, describe, expect, it, vi } from 'vitest';
import seed from '../../../data/project.json';
import { fetchProject } from './project';

function mockFetch(body: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json(body, { status })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('fetchProject', () => {
  it('returns the validated project for a valid payload', async () => {
    mockFetch(seed);
    const result = await fetchProject();
    expect(result.ok && result.data.name).toBe(seed.name);
  });

  it('returns an error value (does not throw) for an invalid payload', async () => {
    mockFetch({ name: 'broken' });
    const result = await fetchProject();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/invalid project payload/);
  });

  it('surfaces server errors and network failures as values', async () => {
    mockFetch({ error: 'seed invalid' }, 500);
    expect(await fetchProject()).toEqual({ ok: false, error: '/api/project: 500 seed invalid' });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error('down'))),
    );
    const result = await fetchProject();
    expect(result.ok).toBe(false);
  });
});
