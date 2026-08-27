import { describe, expect, it } from 'vitest';
import { seedProject } from '../test/seed';
import { connectionsFor, featuresFirst, findEntity, intentsFor, requirementsFor } from './entities';

describe('entities', () => {
  it('findEntity tags the entity with its type, null when unknown', () => {
    expect(findEntity(seedProject, 'sys-server-api')?.type).toBe('system');
    expect(findEntity(seedProject, 'req-dogfood-seed')?.type).toBe('requirement');
    expect(findEntity(seedProject, 'int-backend-first')?.type).toBe('intent');
    expect(findEntity(seedProject, 'nope')).toBeNull();
  });

  it('requirementsFor(system) = requirements whose systemIds include it', () => {
    const expected = seedProject.requirements.filter((r) => r.systemIds.includes('sys-server-api'));
    expect(requirementsFor(seedProject, 'sys-server-api')).toEqual(expected);
    expect(expected.length).toBeGreaterThan(0);
  });

  it('requirementsFor(intent) = exactly appliesTo.requirementIds', () => {
    const intent = seedProject.intents.find((i) => i.appliesTo.requirementIds.length > 0)!;
    const ids = requirementsFor(seedProject, intent.id).map((r) => r.id);
    expect(ids.sort()).toEqual([...intent.appliesTo.requirementIds].sort());
  });

  it('intentsFor(requirement) = intents whose appliesTo.requirementIds include it', () => {
    const id = 'req-dogfood-seed';
    const expected = seedProject.intents.filter((i) => i.appliesTo.requirementIds.includes(id));
    expect(intentsFor(seedProject, id)).toEqual(expected);
    expect(expected.length).toBeGreaterThan(0);
  });

  it('featuresFirst puts features first and keeps the order within each group', () => {
    const kinds = ['functional', 'feature', 'constraint', 'feature'] as const;
    const base = seedProject.requirements[0]!;
    const input = kinds.map((kind, i) => ({ ...base, id: `r${i}`, kind }));
    expect(featuresFirst(input).map((r) => r.id)).toEqual(['r1', 'r3', 'r0', 'r2']);
    expect(input.map((r) => r.id)).toEqual(['r0', 'r1', 'r2', 'r3']);
  });

  it('connectionsFor excludes self and dedupes', () => {
    const ids = connectionsFor(seedProject, 'sys-server-api').map((c) => c.entity.id);
    expect(ids).not.toContain('sys-server-api');
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('sys-shared-model');
  });
});
