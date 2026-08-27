import type { Placed } from '../layout/egoLayout';
import type { FocusNode, FocusView } from './focusView';
import type { FlowElements, SystemEdge, SystemNode } from './toFlow';

/**
 * Pure: a focus view plus its ego layout → React Flow elements. Nodes are flat (no nesting);
 * edges are labelled by their kind. Edge handle sides are chosen afterwards by `edgeSides`.
 */
export function focusFlowElements(view: FocusView, placed: Placed[]): FlowElements {
  const byId = new Map(placed.map((p) => [p.id, p]));
  const node = (n: FocusNode, focus = false): SystemNode | null => {
    const p = byId.get(n.system.id);
    if (!p) return null;
    return {
      id: n.system.id,
      type: 'system',
      position: p.position,
      width: p.width,
      height: p.height,
      data: {
        label: n.system.name,
        system: n.system,
        requirementCount: n.requirementCount,
        intentCount: n.intentCount,
        ...(focus && { focus }),
      },
    };
  };
  const nodes = [
    node(view.focus, true),
    ...view.inbound.map((n) => node(n)),
    ...view.outbound.map((n) => node(n)),
  ].filter((n): n is SystemNode => n !== null);

  const edges = view.edges.map<SystemEdge>((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    label: edge.label ?? edge.kind,
    data: { edge, showLabel: true },
  }));
  return { nodes, edges };
}
