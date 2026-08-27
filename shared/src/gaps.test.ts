import { describe, expect, it } from 'vitest';
import { fullyLinkedProject } from './test/fixture.js';
import { computeGaps } from './gaps.js';

describe('computeGaps', () => {
  it('fully linked project → all gap arrays empty', () => {
    expect(computeGaps(fullyLinkedProject())).toEqual({
      systemsWithoutIntent: [],
      requirementsWithoutSystem: [],
      edgesWithoutIntent: [],
      intentsWithoutTarget: [],
    });
  });

  it('system with no intent and intent with no target are reported', () => {
    const project = fullyLinkedProject();
    project.intents[1]!.appliesTo.systemIds = [];
    const gaps = computeGaps(project);
    expect(gaps.systemsWithoutIntent).toEqual(['sys-other']);
    expect(gaps.intentsWithoutTarget).toEqual(['int-b']);
  });

  it('an edge named in an intent.appliesTo counts as explained even without intentId', () => {
    const project = fullyLinkedProject();
    project.edges[0]!.intentId = undefined; // int-a still lists edge-1
    expect(computeGaps(project).edgesWithoutIntent).toEqual([]);
  });

  it('requirement with no system and edge with no intent are reported', () => {
    const project = fullyLinkedProject();
    project.requirements[1]!.systemIds = [];
    project.edges.push({ id: 'edge-2', from: 'sys-parent', to: 'sys-other', kind: 'depends' });
    const gaps = computeGaps(project);
    expect(gaps.requirementsWithoutSystem).toEqual(['req-b']);
    expect(gaps.edgesWithoutIntent).toEqual(['edge-2']);
  });

  it('non-current entries are ignored: a withdrawn system is not a gap, nor is it an explanation', () => {
    const project = fullyLinkedProject();
    const since = '2026-08-27T00:00:00Z';
    project.intents[1]!.lifecycle = { state: 'withdrawn', since, reason: 'code removed' }; // the only intent for sys-other
    project.systems[2]!.lifecycle = { state: 'withdrawn', since, reason: 'code removed' }; // sys-other itself
    const gaps = computeGaps(project);
    expect(gaps.systemsWithoutIntent).toEqual([]);
    expect(gaps.intentsWithoutTarget).toEqual([]);
    expect(gaps.edgesWithoutIntent).toEqual([]); // edge-1 ends at the withdrawn system
  });
});
