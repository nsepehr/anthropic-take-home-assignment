import { describe, expect, it } from 'vitest';
import { seedProject } from '../test/seed';
import { isMatch, matchCount, searchProject } from './search';

describe('searchProject', () => {
  it('returns nothing for a blank query', () => {
    expect(searchProject(seedProject, '')).toEqual({
      systemIds: [],
      requirementIds: [],
      intentIds: [],
    });
    expect(matchCount(searchProject(seedProject, '   '))).toBe(0);
    expect(matchCount(searchProject(null, 'shell'))).toBe(0);
  });

  it('matches names, titles and statements case-insensitively', () => {
    const shell = seedProject.systems.find((s) => s.id === 'sys-client-shell');
    expect(shell).toBeDefined();
    const results = searchProject(seedProject, shell!.name.toUpperCase());
    expect(results.systemIds).toContain('sys-client-shell');
    expect(isMatch(results, 'sys-client-shell')).toBe(true);
  });

  it('matches summary, detail and a system path, and misses what is absent', () => {
    const byPath = searchProject(seedProject, 'client/src/features/shell/');
    expect(byPath.systemIds).toContain('sys-client-shell');

    const [req] = seedProject.requirements;
    const [intent] = seedProject.intents;
    if (!req || !intent) throw new Error('the seed has no requirements or intents');
    expect(searchProject(seedProject, req.summary.slice(0, 20)).requirementIds).toContain(req.id);
    expect(searchProject(seedProject, intent.detail.slice(0, 20)).intentIds).toContain(intent.id);

    expect(matchCount(searchProject(seedProject, 'zzzznotinthemodel'))).toBe(0);
  });
});
