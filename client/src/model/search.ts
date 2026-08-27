import type { Intent, Project, Requirement, System } from '@app/shared';

/** The ids matching a query, by entity kind. Empty sets mean "no search is running". */
export interface SearchResults {
  systemIds: string[];
  requirementIds: string[];
  intentIds: string[];
}

export const EMPTY_SEARCH: SearchResults = { systemIds: [], requirementIds: [], intentIds: [] };

const contains = (needle: string, fields: string[]) =>
  fields.some((f) => f.toLowerCase().includes(needle));

const systemFields = (s: System) => [s.name, s.summary, s.detail, ...s.paths];
const requirementFields = (r: Requirement) => [r.title, r.summary, r.detail];
const intentFields = (i: Intent) => [i.statement, i.summary, i.detail];

/**
 * Pure: case-insensitive substring search over the words a human would look for — names, titles,
 * statements, both levels of prose, and a system's paths. A blank query matches nothing.
 * Substring is the honest floor here; see intent `int-search-should-be-semantic`.
 */
export function searchProject(project: Project | null, query: string): SearchResults {
  const needle = query.trim().toLowerCase();
  if (!project || needle === '') return EMPTY_SEARCH;
  const ids = <T extends { id: string }>(items: T[], fields: (item: T) => string[]) =>
    items.filter((item) => contains(needle, fields(item))).map((item) => item.id);
  return {
    systemIds: ids(project.systems, systemFields),
    requirementIds: ids(project.requirements, requirementFields),
    intentIds: ids(project.intents, intentFields),
  };
}

/** How many entities matched, across all three kinds. */
export function matchCount(results: SearchResults): number {
  return results.systemIds.length + results.requirementIds.length + results.intentIds.length;
}

/** Whether one entity is among the matches. */
export function isMatch(results: SearchResults, id: string): boolean {
  return (
    results.systemIds.includes(id) ||
    results.requirementIds.includes(id) ||
    results.intentIds.includes(id)
  );
}
