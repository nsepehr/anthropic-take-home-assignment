import type { Side } from '../model/edgeSides';

/** React Flow edge type for an edge whose ends share a column; registered by `FlowCanvas`. */
export const ARC_EDGE_TYPE = 'system-arc';

interface Endpoints {
  source: string;
  target: string;
}

/** Whether both ends of an edge sit in the same column — the atlas draws those as side arcs. */
export function isIntraColumn(
  { source, target }: Endpoints,
  columns: ReadonlyMap<string, number>,
): boolean {
  const from = columns.get(source);
  return from !== undefined && from === columns.get(target);
}

/** Both ends leave from the right face, so the arc bulges into the gutter beside the column. */
const ARC_HANDLES: { sourceHandle: Side; targetHandle: Side } = {
  sourceHandle: 'r',
  targetHandle: 'r',
};

/**
 * Pure: retype the edges that stay inside one column so they render as short arcs on the right
 * of the column instead of beziers crossing over its cards. Cross-column edges are returned
 * untouched, keeping the handle sides `attachEdgeSides` chose.
 */
export function attachColumnArcs<E extends Endpoints>(
  edges: readonly E[],
  columns: ReadonlyMap<string, number>,
): E[] {
  return edges.map((edge) =>
    isIntraColumn(edge, columns) ? { ...edge, type: ARC_EDGE_TYPE, ...ARC_HANDLES } : edge,
  );
}

/** How far an arc bulges sideways: enough to clear the card, growing a little with the span. */
export function arcBulge(sourceY: number, targetY: number): number {
  return 30 + Math.min(46, Math.abs(targetY - sourceY) * 0.14);
}

/** A C-shaped cubic from one right face to the other; the span's sign gives it its direction. */
export function arcPath(sourceX: number, sourceY: number, targetX: number, targetY: number) {
  const bulge = arcBulge(sourceY, targetY);
  return `M ${sourceX},${sourceY} C ${sourceX + bulge},${sourceY} ${targetX + bulge},${targetY} ${targetX},${targetY}`;
}
