import { describe, expect, it } from 'vitest';
import type { Mentionable } from './chatScope';
import { EMPTY_CHAT, chatReducer, lastMentionId, type ChatState } from './chatThread';

const api: Mentionable = {
  id: 'sys-client-api',
  kind: 'system',
  label: 'Client API',
  dotVar: '--kind-module',
};
const shell: Mentionable = {
  id: 'sys-client-shell',
  kind: 'system',
  label: 'App shell',
  dotVar: '--kind-ui',
};

const withMentions = (...mentions: Mentionable[]): ChatState => ({ ...EMPTY_CHAT, mentions });

describe('chatReducer', () => {
  it('adds a mention, opens the drawer and asks for focus', () => {
    const next = chatReducer(EMPTY_CHAT, { type: 'addMention', mention: api });
    expect(next.mentions).toEqual([api]);
    expect(next.open).toBe(true);
    expect(next.focusNonce).toBe(1);
  });

  it('never tags the same entity twice', () => {
    const next = chatReducer(withMentions(api), { type: 'addMention', mention: api });
    expect(next.mentions).toEqual([api]);
  });

  it('clears the half-typed @query when the mention is picked', () => {
    const typing = { ...EMPTY_CHAT, draft: 'why does @cli' };
    expect(chatReducer(typing, { type: 'addMention', mention: api }).draft).toBe('why does ');
  });

  it('removes a mention by id', () => {
    const next = chatReducer(withMentions(api, shell), { type: 'removeMention', id: api.id });
    expect(next.mentions).toEqual([shell]);
  });

  it('sends the user turn and the reply as two messages, keeping the scope', () => {
    const typed = { ...withMentions(api), draft: 'what does it do?' };
    const next = chatReducer(typed, { type: 'send', reply: 'Scoped to Client API.' });
    expect(next.messages.map((m) => [m.role, m.text])).toEqual([
      ['user', 'what does it do?'],
      ['assistant', 'Scoped to Client API.'],
    ]);
    expect(next.messages[0]?.mentions).toEqual([api]);
    expect(next.draft).toBe('');
    expect(next.mentions).toEqual([api]);
  });

  it('ignores a send with nothing typed and nothing in scope', () => {
    expect(chatReducer(EMPTY_CHAT, { type: 'send', reply: 'x' })).toBe(EMPTY_CHAT);
  });

  it('reports the last chip only while the composer is empty', () => {
    expect(lastMentionId(withMentions(api, shell))).toBe(shell.id);
    expect(lastMentionId({ ...withMentions(api), draft: 'x' })).toBeNull();
  });
});
