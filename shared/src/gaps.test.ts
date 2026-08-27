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
    project.systems[2]!.intentIds = [];
    project.intents[1]!.appliesTo.systemIds = [];
    const gaps = computeGaps(project);
    expect(gaps.systemsWithoutIntent).toEqual(['sys-other']);
    expect(gaps.intentsWithoutTarget).toEqual(['int-b']);
  });

  it('a one-sided link still counts as explained', () => {
    const project = fullyLinkedProject();
    project.systems[1]!.intentIds = []; // int-a still lists sys-child in appliesTo
    project.edges[0]!.intentId = undefined; // int-a still lists edge-1
    const gaps = computeGaps(project);
    expect(gaps.systemsWithoutIntent).toEqual([]);
    expect(gaps.edgesWithoutIntent).toEqual([]);
  });

  it('requirement with no system and edge with no intent are reported', () => {
    const project = fullyLinkedProject();
    project.requirements[1]!.systemIds = [];
    project.edges.push({ id: 'edge-2', from: 'sys-parent', to: 'sys-other', kind: 'depends' });
    const gaps = computeGaps(project);
    expect(gaps.requirementsWithoutSystem).toEqual(['req-b']);
    expect(gaps.edgesWithoutIntent).toEqual(['edge-2']);
  });
});
