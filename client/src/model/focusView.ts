import type { Edge, Project, System } from '@app/shared';
import { countBy } from './countBy';

/** A system on the focus canvas with how much requirement/intent hangs on it. */
export interface FocusNode {
  system: System;
  requirementCount: number;
  intentCount: number;
}

/** The ego graph of one system: it, the systems that point at it, the systems it points at. */
export interface FocusView {
  focus: FocusNode;
  /** Neighbours with at least one edge into the focus (they also keep any outbound edges). */
  inbound: FocusNode[];
  /** Remaining neighbours: only reached by edges leaving the focus. */
  outbound: FocusNode[];
  /** Every edge touching the focus, in project order. */
  edges: Edge[];
}

/** Pure: the ego graph of `id`; null when the id is not a system. */
export function focusView(project: Project, id: string): FocusView | null {
  const focus = project.systems.find((s) => s.id === id);
  if (!focus) return null;
  const requirementCounts = countBy(project.requirements.flatMap((r) => r.systemIds));
  const intentCounts = countBy(project.intents.flatMap((i) => i.appliesTo.systemIds));
  const node = (system: System): FocusNode => ({
    system,
    requirementCount: requirementCounts.get(system.id) ?? 0,
    intentCount: intentCounts.get(system.id) ?? 0,
  });

  const edges = project.edges.filter((e) => e.from === id || e.to === id);
  const inboundIds = new Set(edges.filter((e) => e.to === id && e.from !== id).map((e) => e.from));
  const outboundIds = new Set(
    edges.filter((e) => e.from === id && e.to !== id && !inboundIds.has(e.to)).map((e) => e.to),
  );
  const pick = (ids: Set<string>) => project.systems.filter((s) => ids.has(s.id)).map(node);
  return { focus: node(focus), inbound: pick(inboundIds), outbound: pick(outboundIds), edges };
}
