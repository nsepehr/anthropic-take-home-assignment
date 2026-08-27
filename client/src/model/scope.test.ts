import { describe, expect, it } from 'vitest';
import { seedProject } from '../test/seed';
import { ATLAS, breadcrumbFor, openIn, scopeKey, scopeOfTrail, trailTo } from './scope';

const project = seedProject;

describe('trail', () => {
  it('opening appends; reopening a system on the trail rewinds to it', () => {
    expect(openIn([], 'a')).toEqual(['a']);
    expect(openIn(['a', 'b', 'c'], 'd')).toEqual(['a', 'b', 'c', 'd']);
    expect(openIn(['a', 'b', 'c'], 'a')).toEqual(['a']);
    expect(openIn(['a', 'b', 'c'], 'c')).toEqual(['a', 'b', 'c']);
  });

  it('the last hop is the scope; no hops is the atlas', () => {
    expect(scopeOfTrail([])).toEqual(ATLAS);
    expect(scopeOfTrail(['a', 'b'])).toEqual({ level: 'system', id: 'b' });
  });

  it('trailTo the atlas empties; to a system rewinds or appends', () => {
    expect(trailTo(['a', 'b'], ATLAS)).toEqual([]);
    expect(trailTo(['a', 'b'], { level: 'system', id: 'a' })).toEqual(['a']);
    expect(trailTo(['a'], { level: 'system', id: 'z' })).toEqual(['a', 'z']);
  });
});

describe('breadcrumbFor', () => {
  it('starts at Architecture and names each hop', () => {
    const crumbs = breadcrumbFor(project, ['sys-client-shell', 'sys-client-diagram']);
    expect(crumbs.map((c) => c.label)).toEqual(['Architecture', 'App shell', 'Diagram canvas']);
    expect(crumbs[0]!.scope).toEqual(ATLAS);
    expect(crumbs[2]!.scope).toEqual({ level: 'system', id: 'sys-client-diagram' });
    expect(breadcrumbFor(project, [])).toEqual([{ label: 'Architecture', scope: ATLAS }]);
  });
});

describe('scopeKey', () => {
  it('is stable and distinct per scope', () => {
    expect(scopeKey(ATLAS)).toBe('atlas');
    expect(scopeKey({ level: 'system', id: 'a' })).not.toBe(scopeKey({ level: 'system', id: 'b' }));
  });
});
