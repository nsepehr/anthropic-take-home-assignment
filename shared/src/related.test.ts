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
      systemIds: ['sys-parent'],
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
