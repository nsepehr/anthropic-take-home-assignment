import { attachEdgeSides } from '../model/edgeSides';
import { attachColumnArcs } from './columnEdges';
import type { ColumnLayout } from './columns';
import { boundsOf, type Box } from './fitViewport';

export interface ColumnElements<N, E> {
  nodes: N[];
  edges: E[];
  /** The box the cards occupy — what the canvas fits itself to. */
  bounds: Box | undefined;
}

/**
 * Pure: put a `ColumnLayout` onto React Flow elements. Nodes carry position only: React Flow
 * measures the cards from the DOM (their size is CSS, see `.diagram--atlas .diagram-card`), and
 * a node that arrives pre-sized skips that pass and loses the handle positions its edges need.
 * Nodes the layout did not place — nested systems, which belong to their parent's focus view —
 * drop out, and so do the edges that would be left dangling.
 */
export function toColumnElements<
  N extends { id: string; position: { x: number; y: number } },
  E extends { source: string; target: string },
>(nodes: readonly N[], edges: readonly E[], layout: ColumnLayout): ColumnElements<N, E> {
  const placed = new Map(layout.nodes.map((n) => [n.id, n]));
  const laidOut = nodes.flatMap((node) => {
    const card = placed.get(node.id);
    return card ? [{ ...node, position: card.position }] : [];
  });
  const connected = edges.filter((e) => placed.has(e.source) && placed.has(e.target));
  return {
    nodes: laidOut,
    edges: attachColumnArcs(attachEdgeSides(withSizes(laidOut, placed), connected), layout.columns),
    bounds: boundsOf(layout.nodes),
  };
}

/** Sides are chosen from the cards' real rectangles, which only the layout knows. */
function withSizes<N extends { id: string; position: { x: number; y: number } }>(
  nodes: N[],
  placed: Map<string, { width: number; height: number }>,
) {
  return nodes.map((n) => ({ ...n, ...placed.get(n.id)! }));
}
