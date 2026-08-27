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
});
