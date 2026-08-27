import type { Project } from '@app/shared';
import { entityLabel, findEntity, type FoundEntity } from './entities';

/** What an `@` mention points at: one first-class entity, with what to draw next to it. */
export interface Mentionable {
  id: string;
  kind: FoundEntity['type'];
  label: string;
  /** CSS custom property for the row/chip dot, e.g. `--kind-ui`. */
  dotVar: string;
}

/** How the chat scope touches one card: nothing in scope, in it, or dimmed out of it. */
export type ScopeState = 'none' | 'in' | 'out';

const MENU_LIMIT = 7;
const CHIP_CHARS = 26;

function dotVar(found: FoundEntity): string {
  switch (found.type) {
    case 'system':
      return `--kind-${found.entity.kind}`;
    case 'requirement':
      return `--status-${found.entity.status}`;
    case 'intent':
      return found.entity.provenance.source === 'human-verified' ? '--prov-human' : '--prov-ai';
  }
}

export function mentionOf(found: FoundEntity): Mentionable {
  return {
    id: found.entity.id,
    kind: found.type,
    label: entityLabel(found),
    dotVar: dotVar(found),
  };
}

/** Everything a user can tag, systems first, then requirements, then intents. */
export function mentionables(project: Project): Mentionable[] {
  return [
    ...project.systems.map((entity) => mentionOf({ type: 'system', entity })),
    ...project.requirements.map((entity) => mentionOf({ type: 'requirement', entity })),
    ...project.intents.map((entity) => mentionOf({ type: 'intent', entity })),
  ];
}

/** The mention for an id, or null when nothing carries it. */
export function mentionById(project: Project, id: string): Mentionable | null {
  const found = findEntity(project, id);
  return found ? mentionOf(found) : null;
}

/**
 * The systems one mention resolves to: a System is itself, a Requirement is its `systemIds`, an
 * Intent is its `appliesTo.systemIds`. This is what makes a request concrete.
 */
export function systemsOf(project: Project, mention: Mentionable): string[] {
  switch (mention.kind) {
    case 'system':
      return project.systems.some((s) => s.id === mention.id) ? [mention.id] : [];
    case 'requirement':
      return project.requirements.find((r) => r.id === mention.id)?.systemIds ?? [];
    case 'intent':
      return project.intents.find((i) => i.id === mention.id)?.appliesTo.systemIds ?? [];
  }
}

/** The union of every mention's systems, in mention order, deduped: what the canvas rings. */
export function attentionSet(project: Project, mentions: readonly Mentionable[]): string[] {
  const ids = new Set<string>();
  for (const mention of mentions) systemsOf(project, mention).forEach((id) => ids.add(id));
  return [...ids];
}

export function scopeStateOf(attention: ReadonlySet<string>, id: string): ScopeState {
  if (attention.size === 0) return 'none';
  return attention.has(id) ? 'in' : 'out';
}

/** Menu rows for what has been typed after `@`: substring match, already-tagged ids removed. */
export function filterMenu(
  project: Project,
  query: string,
  exclude: readonly string[] = [],
): Mentionable[] {
  const needle = query.trim().toLowerCase();
  const taken = new Set(exclude);
  return mentionables(project)
    .filter((m) => !taken.has(m.id) && m.label.toLowerCase().includes(needle))
    .slice(0, MENU_LIMIT);
}

/**
 * What the user is currently typing after the last `@`, or null when the menu should stay closed.
 * A long run of text is a sentence, not a name, so the menu gets out of the way.
 */
export function mentionQuery(draft: string): string | null {
  const at = draft.lastIndexOf('@');
  if (at === -1) return null;
  const query = draft.slice(at + 1);
  return query.includes('\n') || query.length > 40 ? null : query;
}

/** The draft with the half-typed `@query` removed — called when a mention is picked. */
export function stripMentionQuery(draft: string): string {
  const at = draft.lastIndexOf('@');
  return at === -1 ? draft : draft.slice(0, at);
}

/** Chip-sized label: entity statements are sentences, chips are not. */
export function shortLabel(label: string): string {
  return label.length > CHIP_CHARS ? `${label.slice(0, CHIP_CHARS - 1).trimEnd()}…` : label;
}
