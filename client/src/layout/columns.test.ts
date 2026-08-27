import { describe, expect, it } from 'vitest';
import type { Edge, Project, System } from '@app/shared';
import { laneOrder } from '../model/lanes';
import { seedProject } from '../test/seed';
import { columnLayout, COLUMN } from './columns';

const order = laneOrder(seedProject);
const seedLayout = columnLayout(seedProject, { order });

const template = seedProject.systems[0]!;
const system = (id: string, extra: Partial<System>): System => ({ ...template, id, ...extra });
const edge = (from: string, to: string): Edge => ({
  ...seedProject.edges[0]!,
  id: `${from}->${to}`,
  from,
  to,
});
const project = (systems: System[], edges: Edge[]): Project => ({ ...seedProject, systems, edges });

/** `columnLayout` positions and sizes; this is the rectangle it produced for one system. */
const rectOf = (
  layout: { nodes: { id: string; position: { x: number; y: number } }[] },
  id: string,
) => layout.nodes.find((n) => n.id === id)!.position;

describe('columnLayout on the seed', () => {
  it('puts every top-level system in exactly one column, in flow order', () => {
    expect(order).toEqual(['Workflow', 'Client UI', 'Client core', 'Server', 'Model']);
    const topLevel = seedProject.systems.filter((s) => !s.parentId);
    expect(seedLayout.nodes).toHaveLength(topLevel.length);
    expect(new Set(seedLayout.nodes.map((n) => n.id)).size).toBe(topLevel.length);
    for (const s of topLevel) {
      expect(seedLayout.columns.get(s.id)).toBe(order.indexOf(s.category!));
    }
  });

  it('stacks each column vertically with no overlaps and no gaps in the rows', () => {
    const byColumn = new Map<number, number[]>();
    for (const node of seedLayout.nodes) {
      const column = seedLayout.columns.get(node.id)!;
      expect(node.position.x).toBe(column * COLUMN.pitch + (COLUMN.width - COLUMN.card.width) / 2);
      byColumn.set(column, [...(byColumn.get(column) ?? []), seedLayout.rows.get(node.id)!]);
    }
    for (const rows of byColumn.values()) {
      expect([...rows].sort((a, b) => a - b)).toEqual(rows.map((_, i) => i));
    }
  });

  it('gives every column a lane that hugs its stack, in order', () => {
    expect(seedLayout.lanes.map((l) => l.category)).toEqual(order);
    for (const lane of seedLayout.lanes) {
      const cards = seedLayout.nodes.filter(
        (n) => seedLayout.columns.get(n.id) === order.indexOf(lane.category),
      );
      const bottom = Math.max(...cards.map((c) => c.position.y + c.height));
      expect(lane.width).toBe(COLUMN.width);
      expect(lane.y).toBe(-COLUMN.labelBand);
      expect(lane.height).toBe(COLUMN.labelBand + bottom + COLUMN.padBottom);
    }
  });

  it('lines a system up with its neighbours in the column to its left', () => {
    // `sys-client-shell` is the only Client system a Workflow system points at, so it leads.
    expect(seedLayout.rows.get('sys-client-shell')).toBe(0);
  });

  it('is deterministic — the same project lays out identically', () => {
    expect(columnLayout(seedProject, { order }).nodes).toEqual(seedLayout.nodes);
  });
});

describe('columnLayout stability', () => {
  it('does not move any existing card when an unconnected system is added', () => {
    const grown = project(
      [...seedProject.systems, system('sys-new', { category: 'Client', parentId: undefined })],
      seedProject.edges,
    );
    const after = columnLayout(grown, { order: laneOrder(grown) });
    for (const node of seedLayout.nodes) {
      expect(rectOf(after, node.id)).toEqual(node.position);
    }
    expect(after.rows.get('sys-new')).toBe(
      seedProject.systems.filter((s) => s.category === 'Client').length,
    );
  });

  it('keeps the relative order of the others when a connected system is added', () => {
    const grown = project(
      [...seedProject.systems, system('sys-new', { category: 'Client', parentId: undefined })],
      [...seedProject.edges, edge('sys-agent-rules', 'sys-new')],
    );
    const after = columnLayout(grown, { order: laneOrder(grown) });
    const clientRows = (layout: typeof seedLayout, ids: string[]) =>
      ids.sort((a, b) => layout.rows.get(a)! - layout.rows.get(b)!);
    const ids = seedProject.systems.filter((s) => s.category === 'Client').map((s) => s.id);
    expect(clientRows(after, [...ids])).toEqual(clientRows(seedLayout, [...ids]));
  });
});

describe('columnLayout locks', () => {
  // Two stages: `a`, `b` feed `x`, `y`. Reversing which one `x` follows would swap the column.
  const before = project(
    [
      system('a', { category: 'L', parentId: undefined }),
      system('b', { category: 'L', parentId: undefined }),
      system('x', { category: 'R', parentId: undefined }),
      system('y', { category: 'R', parentId: undefined }),
    ],
    [edge('a', 'y'), edge('b', 'x')],
  );
  const after = project(before.systems, [edge('a', 'x'), edge('b', 'y')]);

  it('re-flows an unlocked column when the graph changes', () => {
    expect(columnLayout(before, { order: ['L', 'R'] }).rows.get('x')).toBe(1);
    expect(columnLayout(after, { order: ['L', 'R'] }).rows.get('x')).toBe(0);
  });

  it('holds a locked system at the row it had, and lays the rest out around it', () => {
    const previous = columnLayout(before, { order: ['L', 'R'] }).rows;
    const held = columnLayout(after, {
      order: ['L', 'R'],
      lockedIds: new Set(['x']),
      previous,
    });
    expect(held.rows.get('x')).toBe(previous.get('x'));
    expect(held.rows.get('y')).toBe(0);
    expect(held.columns.get('x')).toBe(1);
  });
});

describe('columnLayout edge cases', () => {
  it('leaves nested systems unplaced — they belong to their parent’s focus view', () => {
    const nested = project(
      [
        system('parent', { category: 'L', parentId: undefined }),
        system('child', { category: undefined, parentId: 'parent' }),
      ],
      [],
    );
    const layout = columnLayout(nested, { order: ['L'] });
    expect(layout.nodes.map((n) => n.id)).toEqual(['parent']);
  });

  it('skips systems whose category is not a column, and columns with no systems', () => {
    const odd = project([system('lonely', { category: 'Absent', parentId: undefined })], []);
    const layout = columnLayout(odd, { order: ['L'] });
    expect(layout.nodes).toEqual([]);
    expect(layout.lanes).toEqual([]);
  });
});
