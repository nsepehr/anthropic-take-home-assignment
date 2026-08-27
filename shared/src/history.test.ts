import { describe, expect, it } from 'vitest';
import { historyFor } from './history.js';
import { currentOnly } from './lifecycle.js';
import { fullyLinkedProject } from './test/fixture.js';

const OLD = '2026-01-01T00:00:00Z';
const NEWER = '2026-06-01T00:00:00Z';

describe('historyFor', () => {
  it('a system whose entries are all current has no history', () => {
    expect(historyFor(fullyLinkedProject(), 'sys-parent')).toEqual([]);
  });

  it('collects the superseded and withdrawn requirements and intents of one system', () => {
    const project = fullyLinkedProject();
    project.requirements[0]!.lifecycle = { state: 'withdrawn', since: OLD, reason: 'not wanted' };
    project.intents[0]!.lifecycle = { state: 'superseded', supersededBy: 'int-b', since: NEWER };

    const history = historyFor(project, 'sys-parent');
    expect(history.map((e) => [e.kind, e.entity.id, e.state])).toEqual([
      ['intent', 'int-a', 'superseded'], // newest first
      ['requirement', 'req-a', 'withdrawn'],
    ]);
    expect(history[0]!.replacedBy?.id).toBe('int-b');
    expect(history[1]!.reason).toBe('not wanted');
  });

  it('ignores entries attached to another system', () => {
    const project = fullyLinkedProject();
    project.intents[1]!.lifecycle = { state: 'withdrawn', since: OLD, reason: 'gone' }; // sys-other
    expect(historyFor(project, 'sys-parent')).toEqual([]);
    expect(historyFor(project, 'sys-other').map((e) => e.entity.id)).toEqual(['int-b']);
  });

  it('reports nothing when handed a filtered project, which is why it takes the full one', () => {
    const project = fullyLinkedProject();
    project.intents[0]!.lifecycle = { state: 'superseded', supersededBy: 'int-b', since: NEWER };
    expect(historyFor(currentOnly(project), 'sys-parent')).toEqual([]);
  });
});
