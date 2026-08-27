import { getSystem, type Project } from '@app/shared';
import { attentionSet, type Mentionable } from './chatScope';

const NO_MENTIONS =
  'Type @ and pick a system, requirement or intent first, so I know what to change.';

const UNRESOLVED =
  "Nothing on the map hangs off that yet, so there's no code for me to point at. Tag a system too.";

const ASK_LIMIT = 90;

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** `A, B and C`, with a tail count once the list gets long enough to stop being readable. */
function list(names: string[], max = 4): string {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  const joined =
    shown.length > 1 ? `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}` : shown[0];
  return rest > 0 ? `${joined} (+${rest} more)` : (joined ?? '');
}

/**
 * The phase-1 assistant turn: no model call, no edit — it reads back the context the mentions
 * resolved to, which is the claim the UI has to earn before it drafts anything.
 */
export function scriptedReply(
  project: Project,
  mentions: readonly Mentionable[],
  text: string,
): string {
  if (mentions.length === 0) return NO_MENTIONS;
  const ids = attentionSet(project, mentions);
  if (ids.length === 0) return UNRESOLVED;

  const inScope = new Set(ids);
  const names = ids.map((id) => getSystem(project, id)?.name ?? id);
  const edges = project.edges.filter((e) => inScope.has(e.from) || inScope.has(e.to));
  const neighbours = [
    ...new Set(edges.flatMap((e) => [e.from, e.to]).filter((id) => !inScope.has(id))),
  ].map((id) => getSystem(project, id)?.name ?? id);
  const requirements = project.requirements.filter((r) =>
    r.systemIds.some((id) => inScope.has(id)),
  ).length;
  const intents = project.intents.filter((i) =>
    i.appliesTo.systemIds.some((id) => inScope.has(id)),
  ).length;

  const counts = `${plural(requirements, 'requirement')}, ${plural(intents, 'intent')} in play`;
  const links =
    edges.length === 0
      ? 'No connections are recorded from there yet'
      : `${plural(edges.length, 'connection')} ${
          neighbours.length === 0
            ? 'between them'
            : `${ids.length > 1 ? 'between them and' : 'to'} ${list(neighbours)}`
        }`;

  const ask = text.trim();
  const tail = ask
    ? `\nThat's the context I'd work from for "${ask.length > ASK_LIMIT ? `${ask.slice(0, ASK_LIMIT)}…` : ask}". I can explain any of it now; writing changes back to the map comes next.`
    : '';
  return `Scoped to ${list(names)}. ${links}; ${counts}.${tail}`;
}
