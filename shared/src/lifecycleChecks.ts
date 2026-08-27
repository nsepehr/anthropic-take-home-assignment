import type { Project } from './schema/index.js';
import type { LifecycleEntry } from './lifecycle.js';
import { isCurrent } from './lifecycle.js';
import { COLLECTIONS, singular, type Collection, type ValidationError } from './validationTypes.js';

/**
 * Referential rules for the lifecycle block: `supersededBy` is present exactly when the state is
 * 'superseded', names a *different* entry of the *same* type, and the chain of replacements ends
 * at a current entry rather than looping or dead-ending in something no longer current.
 * A 'withdrawn' entry instead owes the reader a one-line `reason`.
 */
export function checkLifecycle(project: Project): ValidationError[] {
  return COLLECTIONS.flatMap((collection) => checkCollection(project, collection));
}

function checkCollection(project: Project, collection: Collection): ValidationError[] {
  const entries: LifecycleEntry[] = project[collection] ?? [];
  const byId = new Map(entries.map((e) => [e.id, e]));
  const errors: ValidationError[] = [];

  entries.forEach((entry, index) => {
    const lifecycle = entry.lifecycle;
    if (!lifecycle) return;
    const path = `${collection}.${index}.lifecycle.supersededBy`;
    const { state, supersededBy, reason } = lifecycle;

    if (state === 'withdrawn') {
      if (supersededBy) {
        errors.push({ path, message: 'only allowed when state is "superseded"' });
      } else if (!reason?.trim()) {
        errors.push({
          path: `${collection}.${index}.lifecycle.reason`,
          message: 'required when state is "withdrawn": one line saying why',
        });
      }
      return;
    }
    if (!supersededBy) {
      errors.push({ path, message: 'required when state is "superseded"' });
      return;
    }
    if (supersededBy === entry.id) {
      errors.push({ path, message: `a ${singular(collection)} cannot supersede itself` });
      return;
    }
    if (!byId.has(supersededBy)) {
      errors.push({
        path,
        message: `references unknown ${singular(collection)} "${supersededBy}"`,
      });
      return;
    }
    const chain = follow(byId, entry);
    if (chain) errors.push({ path, message: chain });
  });

  return errors;
}

/** Walks the replacement chain from `entry`; returns a message when it loops or is not current. */
function follow(byId: Map<string, LifecycleEntry>, entry: LifecycleEntry): string | null {
  const trail = [entry.id];
  let current = entry;
  while (current.lifecycle?.supersededBy) {
    const next = byId.get(current.lifecycle.supersededBy);
    if (!next) return null; // unknown target is reported on the entry that names it
    if (trail.includes(next.id)) {
      return `supersession cycle: ${[...trail, next.id].join(' -> ')}`;
    }
    trail.push(next.id);
    current = next;
  }
  return isCurrent(current)
    ? null
    : `chain ends at "${current.id}", which is ${current.lifecycle?.state}; it must end at a current entry`;
}
