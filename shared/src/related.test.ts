import { describe, expect, it } from 'vitest';
import { fullyLinkedProject } from './test/fixture.js';
import { getSystem, relatedTo } from './related.js';

const sorted = (r: ReturnType<typeof relatedTo>) => ({
  systemIds: [...r.systemIds].sort(),
  requirementIds: [...r.requirementIds].sort(),
  intentIds: [...r.intentIds].sort(),
  edgeIds: [...r.edgeIds].sort(),
});

describe('relatedTo', () => {
  const project = fullyLinkedProject();

  it('relatedTo(intent) includes systems, requirements, and edges it applies to and nothing else', () => {
    expect(sorted(relatedTo(project, 'int-a'))).toEqual({
      systemIds: ['sys-child', 'sys-parent'],
      requirementIds: ['req-a'],
      intentIds: [],
      edgeIds: ['edge-1'],
    });
  });

  it('relatedTo(system) includes its parent/children, edges, requirements, intents', () => {
    expect(sorted(relatedTo(project, 'sys-parent'))).toEqual({
      systemIds: ['sys-child'],
      requirementIds: ['req-a'],
      intentIds: ['int-a'],
      edgeIds: [],
    });
    expect(sorted(relatedTo(project, 'sys-child'))).toEqual({
      systemIds: ['sys-other', 'sys-parent'],
      requirementIds: [],
      intentIds: ['int-a'],
      edgeIds: ['edge-1'],
    });
  });

  it('relatedTo(requirement) includes its systems and intents', () => {
    expect(sorted(relatedTo(project, 'req-a'))).toEqual({
      systemIds: ['sys-parent'],
      requirementIds: [],
      intentIds: ['int-a'],
      edgeIds: [],
    });
  });

  it('relatedTo(system) includes the neighbour system at the other end of each edge', () => {
    expect(relatedTo(project, 'sys-child').systemIds).toContain('sys-other');
    expect(relatedTo(project, 'sys-other').systemIds).toContain('sys-child');
  });

  it('relatedTo(system) does not include edges between two of its neighbours', () => {
    const p = fullyLinkedProject();
    p.edges.push(
      { id: 'edge-2', from: 'sys-parent', to: 'sys-child', kind: 'calls' },
      { id: 'edge-3', from: 'sys-parent', to: 'sys-other', kind: 'calls' },
    );
    expect(relatedTo(p, 'sys-child').edgeIds.sort()).toEqual(['edge-1', 'edge-2']);
    expect(relatedTo(p, 'sys-child').systemIds.sort()).toEqual(['sys-other', 'sys-parent']);
  });

  it('relatedTo(requirement) includes edges between its systems, not edges leaving the set', () => {
    const p = fullyLinkedProject();
    p.requirements[0]!.systemIds = ['sys-child', 'sys-other'];
    expect(relatedTo(p, 'req-a').edgeIds).toEqual(['edge-1']);
    expect(relatedTo(project, 'req-b').edgeIds).toEqual([]);
  });

  it('relatedTo(intent) includes the systems of its requirements and the edges between them', () => {
    const p = fullyLinkedProject();
    p.intents[1]!.appliesTo = { systemIds: ['sys-other'], requirementIds: ['req-a'], edgeIds: [] };
    p.requirements[0]!.systemIds = ['sys-child'];
    expect(sorted(relatedTo(p, 'int-b'))).toEqual({
      systemIds: ['sys-child', 'sys-other'],
      requirementIds: ['req-a'],
      intentIds: [],
      edgeIds: ['edge-1'],
    });
  });

  it('relatedTo(edge) includes endpoints and intent', () => {
    expect(sorted(relatedTo(project, 'edge-1'))).toEqual({
      systemIds: ['sys-child', 'sys-other'],
      requirementIds: [],
      intentIds: ['int-a'],
      edgeIds: [],
    });
  });

  it('derives reverse links from the single stored direction', () => {
    // Nothing on sys-parent or req-a points at int-a; only int-a.appliesTo does.
    expect(relatedTo(project, 'sys-parent').intentIds).toEqual(['int-a']);
    expect(relatedTo(project, 'req-a').intentIds).toEqual(['int-a']);
    expect(relatedTo(project, 'sys-parent').requirementIds).toEqual(['req-a']);
  });

  it('never includes the entity itself and returns empty for unknown ids', () => {
    expect(relatedTo(project, 'sys-parent').systemIds).not.toContain('sys-parent');
    expect(relatedTo(project, 'nope')).toEqual({
      systemIds: [],
      requirementIds: [],
      intentIds: [],
      edgeIds: [],
    });
  });
});

describe('getSystem', () => {
  it('finds a system by id', () => {
    expect(getSystem(fullyLinkedProject(), 'sys-child')?.name).toBe('Child');
    expect(getSystem(fullyLinkedProject(), 'nope')).toBeUndefined();
  });
});
