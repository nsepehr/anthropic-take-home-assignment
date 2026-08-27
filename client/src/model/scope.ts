import { getSystem, type Project } from '@app/shared';

/** What the canvas shows: the whole atlas, or one system with its neighbours (system focus). */
export type Scope = { level: 'atlas' } | { level: 'system'; id: string };

export const ATLAS: Scope = { level: 'atlas' };

/** A stable string identity for a scope (React keys, memo deps). */
export function scopeKey(scope: Scope): string {
  return scope.level === 'atlas' ? 'atlas' : `system:${scope.id}`;
}

/**
 * The trail is the list of systems opened so far, last = current focus; empty = atlas. Opening a
 * system already on the trail rewinds to it, so walking in a circle never grows the trail.
 */
export function openIn(trail: string[], id: string): string[] {
  const at = trail.indexOf(id);
  return at === -1 ? [...trail, id] : trail.slice(0, at + 1);
}

export function scopeOfTrail(trail: string[]): Scope {
  const last = trail[trail.length - 1];
  return last === undefined ? ATLAS : { level: 'system', id: last };
}

/** The trail after jumping to `scope`: empty for the atlas, rewound to the system otherwise. */
export function trailTo(trail: string[], scope: Scope): string[] {
  return scope.level === 'atlas' ? [] : openIn(trail, scope.id);
}

export interface Crumb {
  label: string;
  scope: Scope;
}

/** `Architecture / hop / hop / current` — the header trail; the last crumb is the current scope. */
export function breadcrumbFor(project: Project, trail: string[]): Crumb[] {
  const name = (id: string) => getSystem(project, id)?.name ?? id;
  return [
    { label: 'Architecture', scope: ATLAS },
    ...trail.map<Crumb>((id) => ({ label: name(id), scope: { level: 'system', id } })),
  ];
}
