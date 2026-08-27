import type { Edge as ModelEdge, Project, System } from '@app/shared';
import type { Edge, Node as FlowNode } from '@xyflow/react';
import { countBy } from './countBy';

/** What a diagram node carries: the System itself plus how much intent/requirement hangs on it. */
export type SystemNodeData = {
  label: string;
  system: System;
  requirementCount: number;
  intentCount: number;
  /** The system the focus view is centered on: drawn as the large accent card. */
  focus?: boolean;
};

export type SystemNode = FlowNode<SystemNodeData, 'system'>;
/** `label` is drawn when present: the focus view names edges by kind; the atlas leaves it unset. */
export type SystemEdge = Edge<{ edge: ModelEdge }>;

export interface FlowElements {
  nodes: SystemNode[];
  edges: SystemEdge[];
}

/** Placeholder size before ELK sizes nodes; parents grow to fit their children. */
export const NODE_SIZE = { width: 210, height: 112 } as const;

/**
 * Pure: Project → React Flow elements. Nodes are ordered so every parent precedes its children
 * (a React Flow requirement); positions start at 0,0 and are relative to the parent. Edge
 * handle sides are chosen after layout by `edgeSides`.
 */
export function toFlowElements(project: Project): FlowElements {
  const requirementCounts = countBy(project.requirements.flatMap((r) => r.systemIds));
  const intentCounts = countBy(project.intents.flatMap((i) => i.appliesTo.systemIds));

  const nodes = sortParentsFirst(project.systems).map<SystemNode>((system) => ({
    id: system.id,
    type: 'system',
    position: { x: 0, y: 0 },
    ...NODE_SIZE,
    ...(system.parentId ? { parentId: system.parentId, extent: 'parent' as const } : {}),
    data: {
      label: system.name,
      system,
      requirementCount: requirementCounts.get(system.id) ?? 0,
      intentCount: intentCounts.get(system.id) ?? 0,
    },
  }));

  const edges = project.edges.map<SystemEdge>((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    data: { edge },
  }));

  return { nodes, edges };
}

function sortParentsFirst(systems: System[]): System[] {
  const parentOf = new Map(systems.map((s) => [s.id, s.parentId]));
  const depth = (id: string): number => {
    let d = 0;
    for (let p = parentOf.get(id); p && d < systems.length; p = parentOf.get(p)) d++;
    return d;
  };
  return systems
    .map((s) => ({ s, d: depth(s.id) }))
    .sort((a, b) => a.d - b.d)
    .map(({ s }) => s);
}
