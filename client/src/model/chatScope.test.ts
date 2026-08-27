import { describe, expect, it } from 'vitest';
import { seedProject } from '../test/seed';
import {
  attentionSet,
  filterMenu,
  mentionById,
  mentionQuery,
  mentionables,
  scopeStateOf,
  shortLabel,
  stripMentionQuery,
  systemsOf,
  type Mentionable,
} from './chatScope';

const mention = (id: string): Mentionable => {
  const m = mentionById(seedProject, id);
  if (!m) throw new Error(`no such entity: ${id}`);
  return m;
};

describe('mentionables', () => {
  it('offers every system, requirement and intent with a dot token', () => {
    const all = mentionables(seedProject);
    expect(all).toHaveLength(
      seedProject.systems.length + seedProject.requirements.length + seedProject.intents.length,
    );
    expect(mention('sys-client-api')).toEqual({
      id: 'sys-client-api',
      kind: 'system',
      label: 'Client API',
      dotVar: '--kind-module',
    });
  });
});

describe('systemsOf', () => {
  it('resolves a system to itself', () => {
    expect(systemsOf(seedProject, mention('sys-client-api'))).toEqual(['sys-client-api']);
  });

  it('resolves a requirement to the systems that serve it', () => {
    expect(systemsOf(seedProject, mention('req-single-focused-interaction'))).toEqual(
      seedProject.requirements.find((r) => r.id === 'req-single-focused-interaction')?.systemIds,
    );
  });

  it('resolves an intent to what it applies to', () => {
    expect(systemsOf(seedProject, mention('int-react-flow-elk'))).toEqual(
      seedProject.intents.find((i) => i.id === 'int-react-flow-elk')?.appliesTo.systemIds,
    );
  });
});

describe('attentionSet', () => {
  it('unions every mention and dedupes overlaps', () => {
    const requirement = mention('req-single-focused-interaction');
    const ids = attentionSet(seedProject, [mention('sys-client-api'), requirement]);
    expect(ids).toContain('sys-client-api');
    for (const id of systemsOf(seedProject, requirement)) expect(ids).toContain(id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is empty with no mentions', () => {
    expect(attentionSet(seedProject, [])).toEqual([]);
  });
});

describe('scopeStateOf', () => {
  it('leaves every card alone until something is in scope', () => {
    expect(scopeStateOf(new Set(), 'sys-client-api')).toBe('none');
  });

  it('rings what is in scope and dims the rest', () => {
    const attention = new Set(['sys-client-api']);
    expect(scopeStateOf(attention, 'sys-client-api')).toBe('in');
    expect(scopeStateOf(attention, 'sys-server-api')).toBe('out');
  });
});

describe('filterMenu', () => {
  it('matches on a substring, case-insensitively', () => {
    expect(filterMenu(seedProject, 'client api').map((m) => m.id)).toContain('sys-client-api');
  });

  it('never offers more than seven rows', () => {
    expect(filterMenu(seedProject, '').length).toBeLessThanOrEqual(7);
  });

  it('drops what is already in scope', () => {
    expect(
      filterMenu(seedProject, 'client api', ['sys-client-api']).map((m) => m.id),
    ).not.toContain('sys-client-api');
  });
});

describe('mentionQuery', () => {
  it('is the text after the last @', () => {
    expect(mentionQuery('why does @cli')).toBe('cli');
    expect(mentionQuery('no mention here')).toBeNull();
  });

  it('gives up once the text is a sentence rather than a name', () => {
    expect(mentionQuery(`@${'x'.repeat(41)}`)).toBeNull();
  });

  it('removes the half-typed query when a mention is picked', () => {
    expect(stripMentionQuery('why does @cli')).toBe('why does ');
  });
});

describe('shortLabel', () => {
  it('truncates sentence-length labels for chips', () => {
    expect(shortLabel('Client API')).toBe('Client API');
    expect(shortLabel('Intent is a first-class entity, not a field on System.')).toHaveLength(26);
  });
});
