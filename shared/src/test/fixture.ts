import type { Project } from '../schema/index.js';

/** Test fixture: a small, fully linked project (no gaps) that tests mutate. */
const provenance = { source: 'human-verified', capturedAt: '2026-08-27T00:00:00Z' } as const;

export function fullyLinkedProject(): Project {
  return {
    name: 'Fixture',
    mission: 'Exercise the model',
    systems: [
      {
        id: 'sys-parent',
        name: 'Parent',
        kind: 'workflow',
        paths: [],
        summary: 's',
        detail: 'd',
        provenance,
      },
      {
        id: 'sys-child',
        name: 'Child',
        kind: 'module',
        parentId: 'sys-parent',
        paths: [],
        summary: 's',
        detail: 'd',
        provenance,
      },
      {
        id: 'sys-other',
        name: 'Other',
        kind: 'service',
        paths: [],
        summary: 's',
        detail: 'd',
        provenance,
      },
    ],
    requirements: [
      {
        id: 'req-a',
        title: 'A',
        kind: 'functional',
        status: 'planned',
        systemIds: ['sys-parent'],
        evidence: [],
        summary: 's',
        detail: 'd',
        provenance,
      },
      {
        id: 'req-b',
        title: 'B',
        kind: 'constraint',
        status: 'implemented',
        systemIds: ['sys-other'],
        evidence: [],
        summary: 's',
        detail: 'd',
        provenance,
      },
    ],
    intents: [
      {
        id: 'int-a',
        statement: 'A',
        rationale: 'r',
        appliesTo: {
          systemIds: ['sys-parent', 'sys-child'],
          requirementIds: ['req-a'],
          edgeIds: ['edge-1'],
        },
        summary: 's',
        detail: 'd',
        provenance,
      },
      {
        id: 'int-b',
        statement: 'B',
        rationale: 'r',
        appliesTo: { systemIds: ['sys-other'], requirementIds: [], edgeIds: [] },
        summary: 's',
        detail: 'd',
        provenance,
      },
    ],
    edges: [{ id: 'edge-1', from: 'sys-child', to: 'sys-other', kind: 'calls', intentId: 'int-a' }],
  };
}
