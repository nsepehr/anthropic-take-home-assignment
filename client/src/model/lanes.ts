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
