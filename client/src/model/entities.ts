import {
  getSystem,
  relatedTo,
  type Intent,
  type Project,
  type Requirement,
  type System,
} from '@app/shared';

/** A first-class entity found by id, tagged with which kind it is. */
export type FoundEntity =
  | { type: 'system'; entity: System }
  | { type: 'requirement'; entity: Requirement }
  | { type: 'intent'; entity: Intent };

export function findEntity(project: Project, id: string): FoundEntity | null {
  const system = getSystem(project, id);
  if (system) return { type: 'system', entity: system };
  const requirement = project.requirements.find((r) => r.id === id);
  if (requirement) return { type: 'requirement', entity: requirement };
  const intent = project.intents.find((i) => i.id === id);
  if (intent) return { type: 'intent', entity: intent };
  return null;
}

/** Requirements linked to `id` (a system's requirements, an intent's `appliesTo.requirementIds`). */
export function requirementsFor(project: Project, id: string): Requirement[] {
  const ids = new Set(relatedTo(project, id).requirementIds);
  return project.requirements.filter((r) => ids.has(r.id));
}

/** Intents linked to `id` (those whose `appliesTo` names the system or requirement). */
export function intentsFor(project: Project, id: string): Intent[] {
  const ids = new Set(relatedTo(project, id).intentIds);
  return project.intents.filter((i) => ids.has(i.id));
}

/**
 * Everything to offer as a navigation chip from `id`: the systems, requirements and intents in its
 * `relatedTo` closure (deduped there, never including `id` itself).
 */
export function connectionsFor(project: Project, id: string): FoundEntity[] {
  const related = relatedTo(project, id);
  const ids = [...related.systemIds, ...related.requirementIds, ...related.intentIds];
  const found: FoundEntity[] = [];
  for (const target of ids) {
    const hit = findEntity(project, target);
    if (hit) found.push(hit);
  }
  return found;
}

/** The human-readable label of any entity: name, title or statement. */
export function entityLabel(found: FoundEntity): string {
  switch (found.type) {
    case 'system':
      return found.entity.name;
    case 'requirement':
      return found.entity.title;
    case 'intent':
      return found.entity.statement;
  }
}

/**
 * Requirements with features first, the rest in their original order — a stable sort, so a list
 * still reads in seed order inside each group.
 */
export function featuresFirst(requirements: Requirement[]): Requirement[] {
  return [...requirements].sort(
    (a, b) => Number(b.kind === 'feature') - Number(a.kind === 'feature'),
  );
}
