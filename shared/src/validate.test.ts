import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fullyLinkedProject } from './test/fixture.js';
import { validateProject } from './validate.js';

const seedPath = new URL('../../data/project.json', import.meta.url);

function errorsOf(input: unknown) {
  const result = validateProject(input);
  if (result.ok) throw new Error('expected validation to fail');
  return result.errors;
}

describe('validateProject', () => {
  it('seed file validates', () => {
    const result = validateProject(JSON.parse(readFileSync(seedPath, 'utf8')));
    expect(result.ok).toBe(true);
  });

  it('rejects malformed input with path + message, not a Zod dump', () => {
    const errors = errorsOf({ name: 'x' });
    expect(errors[0]).toEqual({ path: 'mission', message: expect.any(String) });
  });

  it('dangling systemId in a requirement → error naming the path', () => {
    const project = fullyLinkedProject();
    project.requirements[0]!.systemIds.push('sys-nope');
    expect(errorsOf(project)).toEqual([
      { path: 'requirements.0.systemIds.1', message: 'references unknown system "sys-nope"' },
    ]);
  });

  it('a reference to the wrong entity type is an error', () => {
    const project = fullyLinkedProject();
    project.intents[0]!.appliesTo.systemIds.push('req-a');
    expect(errorsOf(project)[0]?.path).toBe('intents.0.appliesTo.systemIds.2');
  });

  it('edge endpoints must exist', () => {
    const project = fullyLinkedProject();
    project.edges[0]!.to = 'sys-ghost';
    expect(errorsOf(project)).toEqual([
      { path: 'edges.0.to', message: 'references unknown system "sys-ghost"' },
    ]);
  });

  it('duplicate id across entity types → error', () => {
    const project = fullyLinkedProject();
    project.intents[1]!.id = 'sys-parent';
    const errors = errorsOf(project);
    expect(errors.some((e) => e.path === 'intents.1.id' && /duplicate id/.test(e.message))).toBe(
      true,
    );
  });

  it('parentId cycle → error', () => {
    const project = fullyLinkedProject();
    project.systems[0]!.parentId = 'sys-child';
    expect(errorsOf(project)).toEqual([
      {
        path: 'systems.0.parentId',
        message: 'parent cycle: sys-parent -> sys-child -> sys-parent',
      },
      { path: 'systems.1.parentId', message: 'parent cycle: sys-child -> sys-parent -> sys-child' },
    ]);
  });
});
