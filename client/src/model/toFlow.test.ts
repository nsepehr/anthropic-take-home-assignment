import type { System } from '@app/shared';
import { describe, expect, it } from 'vitest';
import { seedProject } from '../test/seed';
import { toFlowElements } from './toFlow';

const project = seedProject;
const { nodes, edges } = toFlowElements(project);

/** The seed has no containers any more; nesting is pinned on a tiny fixture. */
const parent: System = {
  ...project.systems[0]!,
  id: 'parent',
  name: 'Parent',
  parentId: undefined,
};
const child: System = {
  ...parent,
  id: 'child',
  name: 'Child',
  parentId: 'parent',
  category: undefined,
};
const nested = toFlowElements({ ...project, systems: [child, parent], edges: [] });

describe('toFlowElements', () => {
  it('orders every parent before its children', () => {
    const index = new Map(nested.nodes.map((n, i) => [n.id, i]));
    for (const node of nested.nodes) {
      if (node.parentId) expect(index.get(node.parentId)!).toBeLessThan(index.get(node.id)!);
    }
    expect(nested.nodes.some((n) => n.parentId)).toBe(true);
  });

  it('sets parentId and a parent-relative starting position for nested systems', () => {
    const node = nested.nodes.find((n) => n.id === 'child')!;
    expect(node.parentId).toBe('parent');
    expect(node.extent).toBe('parent');
    expect(node.position).toEqual({ x: 0, y: 0 });
  });

  it('counts the requirements and intents attached to each system', () => {
    const byId = new Map(nodes.map((n) => [n.id, n.data]));
    const shared = byId.get('sys-shared-model')!;
    expect(shared.requirementCount).toBe(
      project.requirements.filter((r) => r.systemIds.includes('sys-shared-model')).length,
    );
    expect(shared.intentCount).toBe(
      project.intents.filter((i) => i.appliesTo.systemIds.includes('sys-shared-model')).length,
    );
    expect(shared.label).toBe(shared.system.name);
  });

  it('maps every model edge to a flow edge carrying the model edge', () => {
    expect(edges).toHaveLength(project.edges.length);
    const e = edges.find((x) => x.id === 'edge-client-calls-server')!;
    expect(e.source).toBe('sys-client-api');
    expect(e.target).toBe('sys-server-api');
    expect(e.data?.edge.kind).toBe('calls');
  });
});
