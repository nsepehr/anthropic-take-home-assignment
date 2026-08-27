import type { Project, System } from './schema/index.js';

export interface Related {
  systemIds: string[];
  requirementIds: string[];
  intentIds: string[];
  edgeIds: string[];
}

export function getSystem(project: Project, id: string): System | undefined {
  return project.systems.find((s) => s.id === id);
}

/**
 * The closure the UI highlights when `id` is selected — everything one hop away:
 * - system → parent/children, its edges and the system at the other end of each, requirements
 *   listing it, intents applying to it;
 * - requirement → its systems, intents applying to it, edges between those systems;
 * - intent → everything in `appliesTo` plus the systems of its requirements, and edges between
 *   all those systems;
 * - edge → its two endpoints and its intent.
 * Links are stored once and followed both ways here. `id` itself is never included.
 */
export function relatedTo(project: Project, id: string): Related {
  const systems = new Set<string>();
  const requirements = new Set<string>();
  const intents = new Set<string>();
  const edges = new Set<string>();

  for (const s of project.systems) {
    if (s.id === id) {
      if (s.parentId) systems.add(s.parentId);
    } else if (s.parentId === id) {
      systems.add(s.id);
    }
  }

  for (const r of project.requirements) {
    if (r.id === id) {
      r.systemIds.forEach((s) => systems.add(s));
    } else if (r.systemIds.includes(id)) {
      requirements.add(r.id);
    }
  }

  for (const i of project.intents) {
    const { systemIds, requirementIds, edgeIds } = i.appliesTo;
    if (i.id === id) {
      systemIds.forEach((s) => systems.add(s));
      requirementIds.forEach((r) => requirements.add(r));
      edgeIds.forEach((e) => edges.add(e));
      for (const rid of requirementIds) {
        project.requirements.find((r) => r.id === rid)?.systemIds.forEach((s) => systems.add(s));
      }
    } else if (systemIds.includes(id) || requirementIds.includes(id) || edgeIds.includes(id)) {
      intents.add(i.id);
    }
  }

  // Only for non-system selections: `systems` is complete here, so edges between two of its
  // members light up. For a system, only its own edges count (neighbours are found below).
  const lightEdgesWithinSet = !getSystem(project, id);
  for (const e of project.edges) {
    if (e.id === id) {
      systems.add(e.from);
      systems.add(e.to);
      if (e.intentId) intents.add(e.intentId);
    } else if (e.from === id || e.to === id) {
      edges.add(e.id);
      systems.add(e.from === id ? e.to : e.from);
    } else if (
      e.intentId === id ||
      (lightEdgesWithinSet && systems.has(e.from) && systems.has(e.to))
    ) {
      edges.add(e.id);
    }
  }
  systems.delete(id);

  return {
    systemIds: [...systems],
    requirementIds: [...requirements],
    intentIds: [...intents],
    edgeIds: [...edges],
  };
}
