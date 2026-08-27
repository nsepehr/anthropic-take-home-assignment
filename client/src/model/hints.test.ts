import { describe, expect, it } from 'vitest';
import { COACH, firstRunAfter, HINT, hintFor } from './hints';

const none = { seenOpen: false, seenWalk: false };

describe('hintFor', () => {
  it('shows the coach-mark until the level has been used once, then the short hint', () => {
    expect(hintFor('atlas', none)).toEqual({ kind: 'coach', text: COACH.atlas });
    expect(hintFor('atlas', { ...none, seenOpen: true })).toEqual({
      kind: 'hint',
      text: HINT.atlas,
    });
    expect(hintFor('system', { ...none, seenOpen: true })).toEqual({
      kind: 'coach',
      text: COACH.system,
    });
    expect(hintFor('system', { seenOpen: true, seenWalk: true }).text).toBe(HINT.system);
  });
});

describe('firstRunAfter', () => {
  it('opening from the atlas retires the atlas coach-mark; walking retires the focus one', () => {
    expect(firstRunAfter(none, [], ['a'])).toEqual({ seenOpen: true, seenWalk: false });
    expect(firstRunAfter(none, ['a'], ['a', 'b'])).toEqual({ seenOpen: false, seenWalk: true });
    expect(firstRunAfter(none, ['a', 'b'], ['a'])).toEqual(none); // going back teaches nothing
  });
});
