import { describe, expect, it } from 'vitest';
import { seedProject } from '../test/seed';
import { mentionById, type Mentionable } from './chatScope';
import { scriptedReply } from './chatReply';

const mention = (id: string): Mentionable => {
  const m = mentionById(seedProject, id);
  if (!m) throw new Error(`no such entity: ${id}`);
  return m;
};

describe('scriptedReply', () => {
  it('asks for a mention when nothing is in scope', () => {
    expect(scriptedReply(seedProject, [], 'make it faster')).toBe(
      'Type @ and pick a system, requirement or intent first, so I know what to change.',
    );
  });

  it('names the resolved systems, their connections and what hangs off them', () => {
    const reply = scriptedReply(seedProject, [mention('sys-client-api')], '');
    expect(reply).toMatch(/^Scoped to Client API\./);
    expect(reply).toMatch(/\d+ connections? to /);
    expect(reply).toMatch(/\d+ requirements?, \d+ intents? in play\./);
  });

  it('resolves a requirement to its systems', () => {
    const reply = scriptedReply(seedProject, [mention('req-single-focused-interaction')], '');
    expect(reply).toContain('Diagram canvas');
    expect(reply).toContain('between them and');
  });

  it('quotes the ask back so the captured context is visible', () => {
    const reply = scriptedReply(seedProject, [mention('sys-client-api')], 'retire the old route');
    expect(reply).toContain('"retire the old route"');
  });
});
