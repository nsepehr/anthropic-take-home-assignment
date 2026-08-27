import { computeGaps, type Gaps } from './gaps.js';
import { ProjectSchema, type Project } from './schema/index.js';

/** A readable validation error: where it is and what is wrong. */
export interface ValidationError {
  path: string;
  message: string;
}

export type ValidateResult =
  { ok: true; project: Project; gaps: Gaps } | { ok: false; errors: ValidationError[] };

/**
 * Shape-checks with Zod, then checks referential integrity: unique ids, references resolving to
 * the right entity type, edge endpoints existing, no `parentId` cycles, and — when the project
 * lists `categories` — every `System.category` naming one of them.
 */
export function validateProject(input: unknown): ValidateResult {
  const parsed = ProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    };
  }
  const project = parsed.data;
  const { ids, errors: duplicates } = indexIds(project);
  const errors = [
    ...duplicates,
    ...checkReferences(project, ids),
    ...checkParentCycles(project),
    ...checkSupersession(project),
    ...checkCategories(project, ids),
  ];
  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, project, gaps: computeGaps(project) };
}

type Collection = 'systems' | 'requirements' | 'intents' | 'edges' | 'categories';

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
  for (const collection of Object.keys(ids) as Collection[]) {
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
      errors.push({ path, message: `references unknown ${expected.slice(0, -1)} "${id}"` });
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
    if (it.supersededBy) ref(`intents.${i}.supersededBy`, it.supersededBy, 'intents');
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

/** `supersededBy` is set exactly when `status` is 'superseded', and never points at itself. */
function checkSupersession(project: Project): ValidationError[] {
  const errors: ValidationError[] = [];
  project.intents.forEach((it, i) => {
    const path = `intents.${i}.supersededBy`;
    if (it.status === 'superseded' && !it.supersededBy) {
      errors.push({ path, message: 'required when status is "superseded"' });
    } else if (it.status === 'active' && it.supersededBy) {
      errors.push({ path, message: 'only allowed when status is "superseded"' });
    } else if (it.supersededBy === it.id) {
      errors.push({ path, message: 'an intent cannot supersede itself' });
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
