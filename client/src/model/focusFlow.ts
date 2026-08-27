import type { Placed } from '../layout/egoLayout';
import type { FocusNode, FocusView } from './focusView';
import type { FlowElements, SystemEdge, SystemNode } from './toFlow';

/**
 * Pure: a focus view plus its ego layout (which was built from the same ids, so every node is
 * placed) → React Flow elements. Nodes are flat; edges carry their kind as the label. Edge
 * handle sides are chosen afterwards by `edgeSides`.
 */
export function focusFlowElements(view: FocusView, placed: Placed[]): FlowElements {
  const byId = new Map(placed.map((p) => [p.id, p]));
  const node = (n: FocusNode, focus?: true): SystemNode => {
    const { position, width, height } = byId.get(n.system.id)!;
    return {
      id: n.system.id,
      type: 'system',
      position,
      width,
      height,
      data: {
        label: n.system.name,
        system: n.system,
        requirementCount: n.requirementCount,
        intentCount: n.intentCount,
        focus,
      },
    };
  };
  const nodes = [
    node(view.focus, true),
    ...view.inbound.map((n) => node(n)),
    ...view.outbound.map((n) => node(n)),
  ];
  const edges = view.edges.map<SystemEdge>((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    label: edge.label ?? edge.kind,
    data: { edge },
  }));
  return { nodes, edges };
}
