import type { Project, System } from './schema.js';

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
 * Everything directly linked to `id` in either direction: the closure the UI highlights when one
 * thing is selected. Links are followed both ways so a one-sided reference still counts.
 * The entity itself is never included in the result.
 */
export function relatedTo(project: Project, id: string): Related {
  const systems = new Set<string>();
  const requirements = new Set<string>();
  const intents = new Set<string>();
  const edges = new Set<string>();

  for (const s of project.systems) {
    if (s.id === id) {
      if (s.parentId) systems.add(s.parentId);
      s.requirementIds.forEach((r) => requirements.add(r));
      s.intentIds.forEach((i) => intents.add(i));
    } else if (s.parentId === id || s.requirementIds.includes(id) || s.intentIds.includes(id)) {
      systems.add(s.id);
    }
  }

  for (const r of project.requirements) {
    if (r.id === id) {
      r.systemIds.forEach((s) => systems.add(s));
      r.intentIds.forEach((i) => intents.add(i));
    } else if (r.systemIds.includes(id) || r.intentIds.includes(id)) {
      requirements.add(r.id);
    }
  }

  for (const i of project.intents) {
    const { systemIds, requirementIds, edgeIds } = i.appliesTo;
    if (i.id === id) {
      systemIds.forEach((s) => systems.add(s));
      requirementIds.forEach((r) => requirements.add(r));
      edgeIds.forEach((e) => edges.add(e));
    } else if (systemIds.includes(id) || requirementIds.includes(id) || edgeIds.includes(id)) {
      intents.add(i.id);
    }
  }

  for (const e of project.edges) {
    if (e.id === id) {
      systems.add(e.from);
      systems.add(e.to);
      if (e.intentId) intents.add(e.intentId);
    } else if (e.from === id || e.to === id || e.intentId === id) {
      edges.add(e.id);
    }
  }

  return {
    systemIds: [...systems],
    requirementIds: [...requirements],
    intentIds: [...intents],
    edgeIds: [...edges],
  };
}
