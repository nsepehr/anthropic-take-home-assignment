import { describe, expect, it } from 'vitest';
import { currentOnly, historyOf, isCurrent } from './lifecycle.js';
import { fullyLinkedProject } from './test/fixture.js';

const SINCE = '2026-08-27T00:00:00Z';

describe('isCurrent', () => {
  it('an entry with no lifecycle block is current — there is no "current" state to write', () => {
    expect(isCurrent({})).toBe(true);
  });

  it('superseded and withdrawn are not current', () => {
    expect(
      isCurrent({ lifecycle: { state: 'withdrawn', since: SINCE, reason: 'code removed' } }),
    ).toBe(false);
    expect(isCurrent({ lifecycle: { state: 'superseded', supersededBy: 'x', since: SINCE } })).toBe(
      false,
    );
  });
});

describe('currentOnly', () => {
  it('an untouched project is returned whole', () => {
    const project = fullyLinkedProject();
    expect(currentOnly(project)).toEqual(project);
  });

  it('drops non-current entries from every array', () => {
    const project = fullyLinkedProject();
    project.requirements[1]!.lifecycle = {
      state: 'withdrawn',
      since: SINCE,
      reason: 'code removed',
    };
    project.intents[1]!.lifecycle = { state: 'superseded', supersededBy: 'int-a', since: SINCE };
    const current = currentOnly(project);
    expect(current.requirements.map((r) => r.id)).toEqual(['req-a']);
    expect(current.intents.map((i) => i.id)).toEqual(['int-a']);
  });

  it('an edge whose endpoint was withdrawn is dropped even though the edge itself is current', () => {
    const project = fullyLinkedProject();
    project.systems[2]!.lifecycle = { state: 'withdrawn', since: SINCE, reason: 'code removed' };
    const current = currentOnly(project);
    expect(current.systems.map((s) => s.id)).toEqual(['sys-parent', 'sys-child']);
    expect(current.edges).toEqual([]);
  });

  it('leaves references from current entries alone, so nothing is silently rewritten', () => {
    const project = fullyLinkedProject();
    project.systems[2]!.lifecycle = { state: 'withdrawn', since: SINCE, reason: 'code removed' };
    expect(currentOnly(project).requirements[1]!.systemIds).toEqual(['sys-other']);
  });
});

describe('historyOf', () => {
  it('returns what an entry replaced, most recent first and oldest last', () => {
    const project = fullyLinkedProject();
    const [first] = project.intents;
    project.intents.push(
      {
        ...first!,
        id: 'int-old',
        lifecycle: { state: 'superseded', supersededBy: 'int-b', since: SINCE },
      },
      {
        ...first!,
        id: 'int-older',
        lifecycle: { state: 'superseded', supersededBy: 'int-old', since: SINCE },
      },
    );
    expect(historyOf(project, 'int-b').map((e) => e.id)).toEqual(['int-old', 'int-older']);
  });

  it('an entry that replaced nothing has no history, and never includes itself', () => {
    expect(historyOf(fullyLinkedProject(), 'int-a')).toEqual([]);
  });

  it('terminates on a malformed cycle instead of hanging', () => {
    const project = fullyLinkedProject();
    project.intents[0]!.lifecycle = { state: 'superseded', supersededBy: 'int-b', since: SINCE };
    project.intents[1]!.lifecycle = { state: 'superseded', supersededBy: 'int-a', since: SINCE };
    expect(historyOf(project, 'int-a').map((e) => e.id)).toEqual(['int-b']);
  });
});
