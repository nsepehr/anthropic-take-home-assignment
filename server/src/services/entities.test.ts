import { describe, expect, it } from 'vitest';
import { findEntity } from './entities.js';
import { loadFixture } from '../../test/fixtures/load.js';

const project = loadFixture('valid-project.json').project;

describe('findEntity', () => {
  it('tags each entity with the collection it lives in', () => {
    expect(findEntity(project, 'sys-a')?.type).toBe('system');
    expect(findEntity(project, 'req-a')?.type).toBe('requirement');
    expect(findEntity(project, 'int-a')?.type).toBe('intent');
    expect(findEntity(project, 'edge-a')?.type).toBe('edge');
  });

  it('returns undefined for an unknown id', () => {
    expect(findEntity(project, 'nope')).toBeUndefined();
  });
});
