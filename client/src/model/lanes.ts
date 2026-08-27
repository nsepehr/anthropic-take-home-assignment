import type { Project } from '@app/shared';
import { orderLanesByFlow } from './laneOrder';

/** A lane's rectangle in graph coordinates, enclosing every top-level node of its category. */
export interface LaneBounds {
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Space reserved above the nodes for the lane label, and on the other sides. */
export const LANE_PADDING = { top: 40, side: 16 } as const;

export interface LaneIndex {
  /** Categories in lane order: along the edge flow, ties by first appearance in `project.systems`. */
  order: string[];
  /** Effective category per system id: its own, or the nearest ancestor's. */
  categoryById: Map<string, string>;
}

/**
 * One pass over the project resolving every system's lane. Category is a classification of
 * top-level systems; nested systems inherit it, so they always land inside their parent's lane.
 */
export function laneIndex(project: Project): LaneIndex {
  const byId = new Map(project.systems.map((s) => [s.id, s]));
  const categoryById = new Map<string, string>();
  const resolve = (id: string): string | undefined => {
    const known = categoryById.get(id);
    if (known) return known;
    let system = byId.get(id);
    for (let hops = 0; system && hops < byId.size; hops++) {
      if (system.category) {
        categoryById.set(id, system.category);
        return system.category;
      }
      system = system.parentId ? byId.get(system.parentId) : undefined;
    }
    return undefined;
  };
  const seedOrder: string[] = [];
  for (const s of project.systems) {
    const category = resolve(s.id);
    if (category && !s.parentId && !seedOrder.includes(category)) seedOrder.push(category);
  }
  return { order: orderLanesByFlow(project, categoryById, seedOrder), categoryById };
}

export function categoryOf(project: Project, systemId: string): string | undefined {
  return laneIndex(project).categoryById.get(systemId);
}

export function laneOrder(project: Project): string[] {
  return laneIndex(project).order;
}

/** Maps a node id to its lane's index in `order` (a left-to-right layout partition), if any. */
export function lanePartition({ order, categoryById }: LaneIndex) {
  return (id: string): number | undefined => {
    const category = categoryById.get(id);
    return category === undefined ? undefined : order.indexOf(category);
  };
}

/** A node after layout; positions of top-level nodes are absolute. */
export interface PositionedNode {
  id: string;
  parentId?: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
}

/** The lane a positioned node belongs to: only top-level nodes form lanes. */
export function laneOf(node: PositionedNode, categoryById: Map<string, string>) {
  return node.parentId ? undefined : categoryById.get(node.id);
}

type Extent = { x0: number; y0: number; x1: number; y1: number };
const EMPTY_EXTENT: Extent = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };

/**
 * Lane rectangles from positioned top-level nodes, padded; ordered as `order`. With
 * `uniformHeight`, every lane is as tall as the tallest so the band reads as one row.
 */
export function laneBounds(
  nodes: PositionedNode[],
  { order, categoryById }: LaneIndex,
  uniformHeight = false,
) {
  const extents = new Map<string, Extent>();
  for (const n of nodes) {
    const category = laneOf(n, categoryById);
    if (!category) continue;
    const e = extents.get(category) ?? EMPTY_EXTENT;
    const { x, y } = n.position;
    extents.set(category, {
      x0: Math.min(e.x0, x),
      y0: Math.min(e.y0, y),
      x1: Math.max(e.x1, x + (n.width ?? 0)),
      y1: Math.max(e.y1, y + (n.height ?? 0)),
    });
  }
  const { top, side } = LANE_PADDING;
  const lanes = order.flatMap<LaneBounds>((category) => {
    const e = extents.get(category);
    if (!e) return [];
    return {
      category,
      x: e.x0 - side,
      y: e.y0 - top,
      width: e.x1 - e.x0 + side * 2,
      height: e.y1 - e.y0 + top + side,
    };
  });
  if (!uniformHeight) return lanes;
  const height = Math.max(...lanes.map((l) => l.height));
  return lanes.map((l) => ({ ...l, height }));
}
