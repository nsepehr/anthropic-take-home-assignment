import { describe, expect, it } from 'vitest';
import { seedProject } from '../test/seed';
import { focusView } from './focusView';

const project = seedProject;
const ids = (nodes: { system: { id: string } }[]) => nodes.map((n) => n.system.id).sort();

describe('focusView', () => {
  it('splits neighbours into inbound (they point at the focus) and outbound (it points at them)', () => {
    const view = focusView(project, 'sys-client-state')!;
    expect(view.focus.system.id).toBe('sys-client-state');
    expect(ids(view.inbound)).toEqual([
      'sys-client-diagram',
      'sys-client-panel',
      'sys-client-shell',
    ]);
    expect(ids(view.outbound)).toEqual(['sys-client-api', 'sys-shared-model']);
    expect(
      view.edges.every((e) => e.from === 'sys-client-state' || e.to === 'sys-client-state'),
    ).toBe(true);
    expect(view.edges).toHaveLength(5);
  });

  it('a neighbour connected both ways appears once, on the inbound side', () => {
    const edges = [
      ...project.edges,
      { id: 'edge-back', from: 'sys-client-api', to: 'sys-client-state', kind: 'emits' as const },
    ];
    const view = focusView({ ...project, edges }, 'sys-client-state')!;
    expect(ids(view.inbound)).toContain('sys-client-api');
    expect(ids(view.outbound)).not.toContain('sys-client-api');
    expect(view.edges.map((e) => e.id)).toContain('edge-back');
  });

  it('carries requirement and intent counts; unknown ids give null', () => {
    const view = focusView(project, 'sys-shared-model')!;
    expect(view.focus.requirementCount).toBe(
      project.requirements.filter((r) => r.systemIds.includes('sys-shared-model')).length,
    );
    expect(view.focus.intentCount).toBeGreaterThan(0);
    expect(focusView(project, 'req-dogfood-seed')).toBeNull();
  });
});
