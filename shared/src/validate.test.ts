import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fullyLinkedProject } from './test/fixture.js';
import { validateProject } from './validate.js';

const seedPath = new URL('../../data/project.json', import.meta.url);
const SINCE = '2026-08-27T00:00:00Z';

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

  it('seed file carries no notices: nothing still uses the deprecated Intent.status', () => {
    const result = validateProject(JSON.parse(readFileSync(seedPath, 'utf8')));
    expect(result.ok && result.notices).toEqual([]);
  });

  it('a file still on Intent.status validates, migrates to lifecycle, and gets a notice', () => {
    const project = fullyLinkedProject();
    project.intents[0]!.status = 'superseded';
    project.intents[0]!.supersededBy = 'int-b';
    const result = validateProject(project);
    if (!result.ok) throw new Error('expected the deprecated shape to still validate');
    expect(result.project.intents[0]!.lifecycle?.state).toBe('superseded');
    expect(result.notices).toEqual([
      { path: 'intents.0', message: expect.stringMatching(/lifecycle/) },
    ]);
  });

  it('supersededBy is required by, and only allowed on, state "superseded"', () => {
    const project = fullyLinkedProject();
    project.intents[0]!.lifecycle = {
      state: 'withdrawn',
      supersededBy: 'int-b',
      since: SINCE,
      reason: 'code removed',
    };
    expect(errorsOf(project)).toEqual([
      {
        path: 'intents.0.lifecycle.supersededBy',
        message: 'only allowed when state is "superseded"',
      },
    ]);
    project.intents[0]!.lifecycle = { state: 'superseded', since: SINCE };
    expect(errorsOf(project)).toEqual([
      { path: 'intents.0.lifecycle.supersededBy', message: 'required when state is "superseded"' },
    ]);
  });

  it('a withdrawn entry owes the reader a reason', () => {
    const project = fullyLinkedProject();
    project.intents[0]!.lifecycle = { state: 'withdrawn', since: SINCE };
    expect(errorsOf(project)).toEqual([
      {
        path: 'intents.0.lifecycle.reason',
        message: 'required when state is "withdrawn": one line saying why',
      },
    ]);
    project.intents[0]!.lifecycle.reason = 'the code it described is gone';
    expect(validateProject(project).ok).toBe(true);
  });

  it('supersededBy must name another entry of the same type', () => {
    const project = fullyLinkedProject();
    project.intents[0]!.lifecycle = {
      state: 'superseded',
      supersededBy: 'sys-parent',
      since: SINCE,
    };
    expect(errorsOf(project)).toEqual([
      {
        path: 'intents.0.lifecycle.supersededBy',
        message: 'references unknown intent "sys-parent"',
      },
    ]);
    project.intents[0]!.lifecycle.supersededBy = 'int-a';
    expect(errorsOf(project)[0]?.message).toMatch(/cannot supersede itself/);
    project.intents[0]!.lifecycle.supersededBy = 'int-b';
    expect(validateProject(project).ok).toBe(true);
  });

  it('a supersession chain must end at a current entry, and must not loop', () => {
    const project = fullyLinkedProject();
    project.intents[0]!.lifecycle = { state: 'superseded', supersededBy: 'int-b', since: SINCE };
    project.intents[1]!.lifecycle = { state: 'withdrawn', since: SINCE, reason: 'code removed' };
    expect(errorsOf(project)[0]?.message).toMatch(/chain ends at "int-b", which is withdrawn/);
    project.intents[1]!.lifecycle = { state: 'superseded', supersededBy: 'int-a', since: SINCE };
    expect(errorsOf(project).map((e) => e.message)).toContain(
      'supersession cycle: int-a -> int-b -> int-a',
    );
  });

  it('edges carry a lifecycle too', () => {
    const project = fullyLinkedProject();
    project.edges[0]!.lifecycle = { state: 'superseded', supersededBy: 'edge-nope', since: SINCE };
    expect(errorsOf(project)).toEqual([
      { path: 'edges.0.lifecycle.supersededBy', message: 'references unknown edge "edge-nope"' },
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

  it('System.category must name a listed category when the list is present', () => {
    const project = fullyLinkedProject();
    project.systems[0]!.category = 'Client';
    expect(validateProject(project).ok).toBe(true); // no list: any string is fine
    const provenance = project.systems[0]!.provenance;
    project.categories = [{ id: 'Server', name: 'Server', summary: 's', detail: 'd', provenance }];
    expect(errorsOf(project)).toEqual([
      {
        path: 'systems.0.category',
        message: 'references unknown category "Client" (not in project.categories)',
      },
    ]);
    project.categories.push({
      id: 'Client',
      name: 'Client',
      summary: 's',
      detail: 'd',
      provenance,
    });
    expect(validateProject(project).ok).toBe(true);
  });
});
