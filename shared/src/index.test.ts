import { describe, expect, it } from 'vitest';
import type { HealthStatus } from './index';

describe('@app/shared', () => {
  it('exposes the HealthStatus contract', () => {
    const h: HealthStatus = { status: 'ok', uptimeSeconds: 1 };
    expect(h.status).toBe('ok');
  });
});
