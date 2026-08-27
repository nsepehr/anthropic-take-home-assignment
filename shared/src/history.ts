import type { Intent, Lifecycle, Project, Requirement } from './schema/index.js';

/** A requirement or intent that once applied to a system and no longer does. */
export interface HistoryEntry {
  entity: Requirement | Intent;
  kind: 'requirement' | 'intent';
  state: Lifecycle['state'];
  /** When it stopped being current. */
  since: string;
  /** Why it was withdrawn, or why it was replaced when the author gave a reason. */
  reason?: string;
  /** The entry that replaced it, when `state` is 'superseded' and the id resolves. */
  replacedBy?: Requirement | Intent;
}

/**
 * The history of one system: every requirement and intent attached to it that is superseded or
 * withdrawn, newest first. This is the one view that deliberately reads past `currentOnly` —
 * non-current entries appear nowhere else — so pass the **full** project; a filtered one has
 * nothing left to report.
 */
export function historyFor(project: Project, systemId: string): HistoryEntry[] {
  const byId = new Map<string, Requirement | Intent>(
    [...project.requirements, ...project.intents].map((e) => [e.id, e]),
  );
  const entries = [
    ...project.requirements
      .filter((r) => r.systemIds.includes(systemId))
      .map((entity) => toEntry(entity, 'requirement', byId)),
    ...project.intents
      .filter((i) => i.appliesTo.systemIds.includes(systemId))
      .map((entity) => toEntry(entity, 'intent', byId)),
  ].filter((entry): entry is HistoryEntry => entry !== null);

  return entries.sort((a, b) => b.since.localeCompare(a.since));
}

function toEntry(
  entity: Requirement | Intent,
  kind: HistoryEntry['kind'],
  byId: Map<string, Requirement | Intent>,
): HistoryEntry | null {
  const { lifecycle } = entity;
  if (!lifecycle) return null; // absent block means current, and current is not history
  return {
    entity,
    kind,
    state: lifecycle.state,
    since: lifecycle.since,
    reason: lifecycle.reason,
    replacedBy: lifecycle.supersededBy ? byId.get(lifecycle.supersededBy) : undefined,
  };
}
