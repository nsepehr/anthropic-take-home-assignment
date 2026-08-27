import { describe, expect, it } from 'vitest';
import type { Project, System } from '@app/shared';
import { seedProject } from '../test/seed';
import { categoryOf, laneOrder } from './lanes';

describe('categoryOf', () => {
  it('returns a top-level system’s own category', () => {
    expect(categoryOf(seedProject, 'sys-client-api')).toBe('Client core');
  });

  it('gives a nested system its ancestor’s category', () => {
    expect(categoryOf(seedProject, 'sys-client-layout')).toBe('Client core');
    expect(categoryOf(seedProject, 'sys-worktree-scripts')).toBe('Workflow');
  });

  it('is undefined for unknown ids', () => {
    expect(categoryOf(seedProject, 'nope')).toBeUndefined();
  });
});

describe('laneOrder', () => {
  it('orders the seed lanes along the dependency flow, each category once', () => {
    expect(laneOrder(seedProject)).toEqual([
      'Workflow',
      'Client UI',
      'Client core',
      'Server',
      'Model',
    ]);
  });

  it('ignores categories that only nested systems carry (they cannot form a lane)', () => {
    const base = seedProject.systems[0]!;
    const system = (id: string, extra: Partial<System>): System => ({
      ...base,
      id,
      parentId: undefined,
      ...extra,
    });
    const project: Project = {
      ...seedProject,
      systems: [
        system('a', { category: 'Top' }),
        system('a-child', { parentId: 'a', category: 'Stray' }),
      ],
    };
    expect(laneOrder(project)).toEqual(['Top']);
  });
});
