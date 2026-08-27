import { describe, expect, it } from 'vitest';
import { normalizeLegacyStatus } from './legacyStatus.js';
import { fullyLinkedProject } from './test/fixture.js';

describe('normalizeLegacyStatus', () => {
  it('a file already on lifecycle is untouched and reports nothing', () => {
    const project = fullyLinkedProject();
    expect(normalizeLegacyStatus(project)).toEqual({ project, notices: [] });
  });

  it('maps status "superseded" onto a lifecycle block dated from the record', () => {
    const project = fullyLinkedProject();
    project.intents[0]!.status = 'superseded';
    project.intents[0]!.supersededBy = 'int-b';
    const result = normalizeLegacyStatus(project);
    const [intent] = result.project.intents;
    expect(intent!.lifecycle).toEqual({
      state: 'superseded',
      supersededBy: 'int-b',
      since: intent!.provenance.capturedAt,
    });
    expect(intent!.status).toBeUndefined();
    expect(result.notices[0]?.path).toBe('intents.0');
    expect(result.notices[0]?.message).toMatch(/deprecated/);
  });

  it('status "active" drops away without inventing a lifecycle block', () => {
    const project = fullyLinkedProject();
    project.intents[0]!.status = 'active';
    const result = normalizeLegacyStatus(project);
    expect(result.project.intents[0]!.lifecycle).toBeUndefined();
    expect(result.notices).toHaveLength(1);
  });

  it('a hand-written lifecycle wins over the deprecated pair', () => {
    const project = fullyLinkedProject();
    project.intents[0]!.status = 'superseded';
    project.intents[0]!.supersededBy = 'int-b';
    project.intents[0]!.lifecycle = {
      state: 'withdrawn',
      since: '2026-01-01T00:00:00Z',
      reason: 'kept',
    };
    const intent = normalizeLegacyStatus(project).project.intents[0]!;
    expect(intent.lifecycle).toEqual({
      state: 'withdrawn',
      since: '2026-01-01T00:00:00Z',
      reason: 'kept',
    });
    expect(intent.supersededBy).toBeUndefined();
  });
});
