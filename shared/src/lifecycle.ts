import type {
  Category,
  Edge,
  Intent,
  Lifecycle,
  Project,
  Requirement,
  System,
} from './schema/index.js';
import { COLLECTIONS } from './validationTypes.js';

/** Anything that can carry a lifecycle block: the first-class entities, categories and edges. */
export type LifecycleEntry = System | Requirement | Intent | Category | Edge;

/** No lifecycle block means current, so untouched files need no annotation. */
export function isCurrent(entry: { lifecycle?: Lifecycle }): boolean {
  return entry.lifecycle === undefined;
}

/** Every entry that can carry a lifecycle, in one list. Ids are unique across all the arrays. */
export function allEntries(project: Project): LifecycleEntry[] {
  return COLLECTIONS.flatMap((collection): LifecycleEntry[] => project[collection] ?? []);
}

/**
 * What the system *is now*: superseded and withdrawn entries dropped, plus any edge whose
 * endpoints are no longer both current (an arrow to a deleted box is not a fact about the system
 * today). References from current entries are left alone — a requirement whose systems all went
 * away stays visible and is reported by the `requirement-orphaned` advisory rather than silently
 * rewritten.
 */
export function currentOnly(project: Project): Project {
  const systems = project.systems.filter(isCurrent);
  const live = new Set(systems.map((s) => s.id));
  return {
    ...project,
    systems,
    requirements: project.requirements.filter(isCurrent),
    intents: project.intents.filter(isCurrent),
    edges: project.edges.filter((e) => isCurrent(e) && live.has(e.from) && live.has(e.to)),
    categories: project.categories?.filter(isCurrent),
  };
}

/**
 * What `id` replaced: the entries whose `supersededBy` points at it, then what *those* replaced,
 * breadth-first — so the direct predecessor comes first and the oldest ancestor comes last.
 * `id` itself is never included, and a malformed cycle terminates instead of hanging.
 */
export function historyOf(project: Project, id: string): LifecycleEntry[] {
  const predecessors = new Map<string, LifecycleEntry[]>();
  for (const entry of allEntries(project)) {
    const replaced = entry.lifecycle?.supersededBy;
    if (!replaced) continue;
    const list = predecessors.get(replaced);
    if (list) list.push(entry);
    else predecessors.set(replaced, [entry]);
  }

  const history: LifecycleEntry[] = [];
  const seen = new Set<string>([id]);
  for (let generation = [id]; generation.length > 0;) {
    const next: string[] = [];
    for (const current of generation) {
      for (const entry of predecessors.get(current) ?? []) {
        if (seen.has(entry.id)) continue;
        seen.add(entry.id);
        history.push(entry);
        next.push(entry.id);
      }
    }
    generation = next;
  }
  return history;
}
