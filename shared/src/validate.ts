import { computeGaps, type Gaps } from './gaps.js';
import { normalizeLegacyStatus } from './legacyStatus.js';
import { checkLifecycle } from './lifecycleChecks.js';
import { ProjectSchema, type Project } from './schema/index.js';
import { COLLECTIONS, singular, type Collection, type ValidationError } from './validationTypes.js';

export type { ValidationError };

export type ValidateResult =
  | {
      ok: true;
      project: Project;
      gaps: Gaps;
      /** Non-fatal notes — deprecated fields that were migrated. The file is still valid. */
      notices: ValidationError[];
    }
  | { ok: false; errors: ValidationError[] };

/**
 * Shape-checks with Zod, migrates deprecated fields, then checks referential integrity: unique
 * ids, references resolving to the right entity type, edge endpoints existing, no `parentId`
 * cycles, well-formed lifecycle chains, and — when the project lists `categories` — every
 * `System.category` naming one of them. Gaps are computed on the current entries only.
 */
export function validateProject(input: unknown): ValidateResult {
  const parsed = ProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    };
  }
  const { project, notices } = normalizeLegacyStatus(parsed.data);
  const { ids, errors: duplicates } = indexIds(project);
  const errors = [
    ...duplicates,
    ...checkReferences(project, ids),
    ...checkParentCycles(project),
    ...checkLifecycle(project),
    ...checkCategories(project, ids),
  ];
  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, project, gaps: computeGaps(project), notices };
}

type IdIndex = Record<Collection, Set<string>>;

/** Collects ids per collection, reporting any id used twice (across all entity types). */
function indexIds(project: Project): { ids: IdIndex; errors: ValidationError[] } {
  const ids: IdIndex = {
    systems: new Set(),
    requirements: new Set(),
    intents: new Set(),
    edges: new Set(),
    categories: new Set(),
  };
  const seen = new Map<string, string>();
  const errors: ValidationError[] = [];
  for (const collection of COLLECTIONS) {
    (project[collection] ?? []).forEach((entity, index) => {
      const path = `${collection}.${index}.id`;
      const first = seen.get(entity.id);
      if (first)
        errors.push({ path, message: `duplicate id "${entity.id}" (first seen at ${first})` });
      else seen.set(entity.id, path);
      ids[collection].add(entity.id);
    });
  }
  return { ids, errors };
}

function checkReferences(project: Project, ids: IdIndex): ValidationError[] {
  const errors: ValidationError[] = [];
  const ref = (path: string, id: string, expected: Collection) => {
    if (!ids[expected].has(id)) {
      errors.push({ path, message: `references unknown ${singular(expected)} "${id}"` });
    }
  };
  const refs = (path: string, list: string[], expected: Collection) =>
    list.forEach((id, i) => ref(`${path}.${i}`, id, expected));

  project.systems.forEach((s, i) => {
    const p = `systems.${i}`;
    if (s.parentId) ref(`${p}.parentId`, s.parentId, 'systems');
  });
  project.requirements.forEach((r, i) => {
    const p = `requirements.${i}`;
    refs(`${p}.systemIds`, r.systemIds, 'systems');
  });
  project.intents.forEach((it, i) => {
    const p = `intents.${i}.appliesTo`;
    refs(`${p}.systemIds`, it.appliesTo.systemIds, 'systems');
    refs(`${p}.requirementIds`, it.appliesTo.requirementIds, 'requirements');
    refs(`${p}.edgeIds`, it.appliesTo.edgeIds, 'edges');
  });
  project.edges.forEach((e, i) => {
    const p = `edges.${i}`;
    ref(`${p}.from`, e.from, 'systems');
    ref(`${p}.to`, e.to, 'systems');
    if (e.intentId) ref(`${p}.intentId`, e.intentId, 'intents');
  });
  return errors;
}

function checkParentCycles(project: Project): ValidationError[] {
  const parentOf = new Map(project.systems.map((s) => [s.id, s.parentId]));
  const errors: ValidationError[] = [];
  project.systems.forEach((s, i) => {
    const trail = [s.id];
    let current = parentOf.get(s.id);
    while (current !== undefined) {
      if (current === s.id) {
        errors.push({
          path: `systems.${i}.parentId`,
          message: `parent cycle: ${[...trail, s.id].join(' -> ')}`,
        });
        return;
      }
      if (trail.includes(current)) return; // cycle elsewhere; reported on its own member
      trail.push(current);
      current = parentOf.get(current);
    }
  });
  return errors;
}

/** With a `categories` list present, every `System.category` must name one of them. */
function checkCategories(project: Project, ids: IdIndex): ValidationError[] {
  if (!project.categories) return [];
  const errors: ValidationError[] = [];
  project.systems.forEach((s, i) => {
    if (s.category && !ids.categories.has(s.category)) {
      errors.push({
        path: `systems.${i}.category`,
        message: `references unknown category "${s.category}" (not in project.categories)`,
      });
    }
  });
  return errors;
}
