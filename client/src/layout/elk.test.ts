import { describe, expect, it } from 'vitest';
import { seedProject } from '../test/seed';
import { toFlowElements } from '../model/toFlow';
import { layoutWithElk } from './elk';

const { nodes, edges } = toFlowElements(seedProject);

describe('layoutWithElk', () => {
  it('positions every node and sizes parents to contain their children', async () => {
    const placed = await layoutWithElk(nodes, edges);
    expect(placed.map((n) => n.id)).toEqual(nodes.map((n) => n.id));

    const byId = new Map(placed.map((n) => [n.id, n]));
    for (const n of placed) {
      expect(n.width).toBeGreaterThan(0);
      expect(n.height).toBeGreaterThan(0);
      if (!n.parentId) continue;
      const parent = byId.get(n.parentId)!;
      expect(n.position.x).toBeGreaterThanOrEqual(0);
      expect(n.position.y).toBeGreaterThanOrEqual(0);
      expect(n.position.x + n.width!).toBeLessThanOrEqual(parent.width!);
      expect(n.position.y + n.height!).toBeLessThanOrEqual(parent.height!);
    }

    const topLevel = placed.filter((n) => !n.parentId);
    const moved = topLevel.filter((n) => n.position.x !== 0 || n.position.y !== 0);
    expect(moved.length).toBeGreaterThan(0);
  });

  it('with partitionOf, nodes of partition 0 sit left of nodes of partition 1', async () => {
    const topLevel = nodes.filter((n) => !n.parentId).map((n) => n.id);
    const partition = new Map(topLevel.map((id, i) => [id, i % 2]));
    const placed = await layoutWithElk(nodes, edges, {}, (id) => partition.get(id));

    const right = (id: string) => {
      const n = placed.find((p) => p.id === id)!;
      return n.position.x + n.width!;
    };
    const left = (id: string) => placed.find((p) => p.id === id)!.position.x;
    const p0 = topLevel.filter((id) => partition.get(id) === 0);
    const p1 = topLevel.filter((id) => partition.get(id) === 1);
    expect(p0.length).toBeGreaterThan(0);
    expect(p1.length).toBeGreaterThan(0);
    expect(Math.max(...p0.map(right))).toBeLessThan(Math.min(...p1.map(left)));
  });
});
