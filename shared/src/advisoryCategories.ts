import type { Project } from './schema/index.js';
import { advisory, LIMITS, type Advisory } from './advisoryCore.js';

export function categoryRules(project: Project): Advisory[] {
  const byCategory = new Map<string, number>();
  for (const s of project.systems) {
    if (s.parentId || !s.category) continue;
    byCategory.set(s.category, (byCategory.get(s.category) ?? 0) + 1);
  }
  const out: Advisory[] = [];
  for (const [category, count] of byCategory) {
    if (count > LIMITS.systemsPerCategory) {
      const msg = `${count} top-level systems (max ${LIMITS.systemsPerCategory}); nest or merge`;
      out.push(advisory('category-too-large', category, msg));
    }
  }
  if (byCategory.size > LIMITS.categories) {
    const msg = `${byCategory.size} categories (max ${LIMITS.categories}); merge lanes`;
    out.push(advisory('too-many-categories', project.name, msg));
  }
  return out;
}

/** Categories are flow stages: edges should mostly cross them, not stay inside. */
export function stageRules(project: Project): Advisory[] {
  const categoryOf = new Map(project.systems.map((s) => [s.id, s.category]));
  const counts = new Map<string, { internal: number; external: number }>();
  const bump = (category: string | undefined, key: 'internal' | 'external') => {
    if (!category) return;
    const c = counts.get(category) ?? { internal: 0, external: 0 };
    c[key] += 1;
    counts.set(category, c);
  };
  for (const e of project.edges) {
    const from = categoryOf.get(e.from);
    const to = categoryOf.get(e.to);
    if (from === to) {
      bump(from, 'internal');
    } else {
      bump(from, 'external');
      bump(to, 'external');
    }
  }
  const out: Advisory[] = [];
  for (const [category, { internal, external }] of counts) {
    if (internal >= LIMITS.internalEdges && internal >= external) {
      const msg = `Category ${category} has ${internal} internal connections vs ${external} external — consider splitting it into stages`;
      out.push(advisory('category-internal-edges', category, msg));
    }
  }
  return out;
}
