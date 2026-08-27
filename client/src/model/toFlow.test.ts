import { describe, expect, it } from 'vitest';
import { seedProject } from '../test/seed';
import { toFlowElements } from './toFlow';

const project = seedProject;
const { nodes, edges } = toFlowElements(project);

describe('toFlowElements', () => {
  it('orders every parent before its children', () => {
    const index = new Map(nodes.map((n, i) => [n.id, i]));
    for (const node of nodes) {
      if (node.parentId) expect(index.get(node.parentId)!).toBeLessThan(index.get(node.id)!);
    }
    expect(nodes.some((n) => n.parentId)).toBe(true);
  });

  it('sets parentId and a parent-relative starting position for nested systems', () => {
    const child = nodes.find((n) => n.id === 'sys-worktree-scripts')!;
    expect(child.parentId).toBe('sys-agent-workflow');
    expect(child.extent).toBe('parent');
    expect(child.position).toEqual({ x: 0, y: 0 });
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
