import type { Project } from './schema/index.js';

/** Computed, never stored: what the model cannot explain. */
export interface Gaps {
  systemsWithoutIntent: string[];
  requirementsWithoutSystem: string[];
  edgesWithoutIntent: string[];
  intentsWithoutTarget: string[];
}

/** Reports what the model leaves unexplained. Honest by design: gaps are surfaced, not hidden. */
export function computeGaps(project: Project): Gaps {
  const intentTargets = new Set<string>();
  for (const intent of project.intents) {
    for (const id of intent.appliesTo.systemIds) intentTargets.add(id);
    for (const id of intent.appliesTo.edgeIds) intentTargets.add(id);
  }

  return {
    systemsWithoutIntent: project.systems
      .filter((s) => s.intentIds.length === 0 && !intentTargets.has(s.id))
      .map((s) => s.id),
    requirementsWithoutSystem: project.requirements
      .filter((r) => r.systemIds.length === 0)
      .map((r) => r.id),
    edgesWithoutIntent: project.edges
      .filter((e) => !e.intentId && !intentTargets.has(e.id))
      .map((e) => e.id),
    intentsWithoutTarget: project.intents
      .filter((i) => Object.values(i.appliesTo).every((ids) => ids.length === 0))
      .map((i) => i.id),
  };
}
