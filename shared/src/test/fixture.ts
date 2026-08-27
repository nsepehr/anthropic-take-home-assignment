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
        requirementIds: ['req-a'],
        intentIds: ['int-a'],
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
        requirementIds: [],
        intentIds: ['int-a'],
        summary: 's',
        detail: 'd',
        provenance,
      },
      {
        id: 'sys-other',
        name: 'Other',
        kind: 'service',
        paths: [],
        requirementIds: ['req-b'],
        intentIds: ['int-b'],
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
        intentIds: ['int-a'],
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
        intentIds: [],
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
        alternativesRejected: [],
        tradeoffs: '',
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
        alternativesRejected: [],
        tradeoffs: '',
        appliesTo: { systemIds: ['sys-other'], requirementIds: [], edgeIds: [] },
        summary: 's',
        detail: 'd',
        provenance,
      },
    ],
    edges: [{ id: 'edge-1', from: 'sys-child', to: 'sys-other', kind: 'calls', intentId: 'int-a' }],
  };
}
