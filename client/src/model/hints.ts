import type { Scope } from './scope';

/** The one-line hint under the canvas once the reader knows how to open things (design rev 4). */
export const HINT: Record<Scope['level'], string> = {
  atlas: 'Click a system to inspect it — double-click to open its own view.',
  system: 'Click a neighbour to inspect it — double-click to walk into it.',
};

/** The first-time coach-mark, shown in place of the hint until the reader has done it once. */
export const COACH: Record<Scope['level'], string> = {
  atlas:
    'Click a system to read about it · Double-click (or Open ›) to step inside and see its neighbours',
  system: 'Click a neighbour to select it · Double-click to walk the graph',
};

/** What the reader has already done; each level's coach-mark retires after its own first use. */
export interface FirstRun {
  seenOpen: boolean;
  seenWalk: boolean;
}

export type Hint = { kind: 'coach' | 'hint'; text: string };

export function hintFor(level: Scope['level'], done: FirstRun): Hint {
  const seen = level === 'atlas' ? done.seenOpen : done.seenWalk;
  return seen ? { kind: 'hint', text: HINT[level] } : { kind: 'coach', text: COACH[level] };
}

/** Pure: what a trail change means for the first-run flags (opening from the atlas vs walking). */
export function firstRunAfter(done: FirstRun, previousTrail: string[], trail: string[]): FirstRun {
  if (trail.length <= previousTrail.length) return done;
  return previousTrail.length === 0 ? { ...done, seenOpen: true } : { ...done, seenWalk: true };
}
