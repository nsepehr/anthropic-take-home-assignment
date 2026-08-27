import { describe, expect, it } from 'vitest';
import type { Project, System } from '@app/shared';
import { seedProject } from '../test/seed';
import { categoryOf, laneBounds, laneIndex, laneOrder, LANE_PADDING } from './lanes';

describe('categoryOf', () => {
  it('returns a top-level system’s own category', () => {
    expect(categoryOf(seedProject, 'sys-client-app')).toBe('Client');
  });

  it('gives a nested system its ancestor’s category', () => {
    expect(categoryOf(seedProject, 'sys-client-layout')).toBe('Client');
    expect(categoryOf(seedProject, 'sys-worktree-scripts')).toBe('Workflow');
  });

  it('is undefined for unknown ids', () => {
    expect(categoryOf(seedProject, 'nope')).toBeUndefined();
  });
});

describe('laneOrder', () => {
  it('lists categories by first appearance without duplicates', () => {
    expect(laneOrder(seedProject)).toEqual(['Model', 'Server', 'Client', 'Workflow']);
  });

  it('ignores categories that only nested systems carry (they cannot form a lane)', () => {
    const base = seedProject.systems[0]!;
    const system = (id: string, extra: Partial<System>): System => ({
      ...base,
      id,
      parentId: undefined,
      ...extra,
    });
    const project: Project = {
      ...seedProject,
      systems: [
        system('a', { category: 'Top' }),
        system('a-child', { parentId: 'a', category: 'Stray' }),
      ],
    };
    expect(laneOrder(project)).toEqual(['Top']);
  });
});

describe('laneBounds', () => {
  const nodes = [
    { id: 'a', position: { x: 10, y: 20 }, width: 100, height: 50 },
    { id: 'b', position: { x: 30, y: 200 }, width: 120, height: 40 },
    { id: 'a-child', parentId: 'a', position: { x: 5, y: 5 }, width: 20, height: 20 },
    { id: 'c', position: { x: 400, y: 0 }, width: 80, height: 30 },
  ];
  const categoryById = new Map([
    ['a', 'One'],
    ['a-child', 'One'],
    ['b', 'One'],
    ['c', 'Two'],
  ]);

  it('encloses every top-level node of the category with padding, in the given order', () => {
    const lanes = laneBounds(nodes, { order: ['One', 'Two'], categoryById });
    expect(lanes.map((l) => l.category)).toEqual(['One', 'Two']);
    const one = lanes[0]!;
    expect(one).toEqual({
      category: 'One',
      x: 10 - LANE_PADDING.side,
      y: 20 - LANE_PADDING.top,
      width: 150 - 10 + LANE_PADDING.side * 2,
      height: 240 - 20 + LANE_PADDING.top + LANE_PADDING.side,
    });
    for (const n of nodes.filter((n) => !n.parentId && categoryById.get(n.id) === 'One')) {
      expect(n.position.x).toBeGreaterThanOrEqual(one.x);
      expect(n.position.y).toBeGreaterThanOrEqual(one.y);
      expect(n.position.x + n.width).toBeLessThanOrEqual(one.x + one.width);
      expect(n.position.y + n.height).toBeLessThanOrEqual(one.y + one.height);
    }
  });

  it('omits categories that have no positioned nodes', () => {
    const lanes = laneBounds(nodes, { order: ['Two', 'Empty'], categoryById });
    expect(lanes.map((l) => l.category)).toEqual(['Two']);
  });

  it('works end to end with laneIndex on the seed', () => {
    const index = laneIndex(seedProject);
    const placed = seedProject.systems.map((s, i) => ({
      id: s.id,
      parentId: s.parentId,
      position: { x: i * 10, y: 0 },
      width: 5,
      height: 5,
    }));
    expect(laneBounds(placed, index).map((l) => l.category)).toEqual(index.order);
  });
});
