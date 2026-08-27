/** Handle ids rendered on every card: top, right, bottom, left. */
export type Side = 't' | 'r' | 'b' | 'l';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The minimum a positioned node needs to expose: parent-relative position and size. */
export interface PositionedNode {
  id: string;
  parentId?: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
}

export interface HandleSides {
  sourceHandle: Side;
  targetHandle: Side;
}

/**
 * Pure: pick the side of each rect that faces the other, by the dominant axis of the
 * center-to-center vector. Ties (|dx| === |dy|) resolve horizontally, matching the layout flow.
 */
export function chooseHandles(source: Rect, target: Rect): HandleSides {
  const dx = center(target).x - center(source).x;
  const dy = center(target).y - center(source).y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: 'r', targetHandle: 'l' }
      : { sourceHandle: 'l', targetHandle: 'r' };
  }
  return dy > 0
    ? { sourceHandle: 'b', targetHandle: 't' }
    : { sourceHandle: 't', targetHandle: 'b' };
}

/**
 * Pure: give every edge the handle ids facing its other end, using the nodes' absolute rects
 * (React Flow positions are parent-relative). Edges whose ends are missing are left untouched.
 */
export function attachEdgeSides<E extends { source: string; target: string }>(
  nodes: PositionedNode[],
  edges: E[],
): (E & Partial<HandleSides>)[] {
  const rects = absoluteRects(nodes);
  return edges.map((edge) => {
    const source = rects.get(edge.source);
    const target = rects.get(edge.target);
    return source && target ? { ...edge, ...chooseHandles(source, target) } : edge;
  });
}

function center(r: Rect) {
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}

function absoluteRects(nodes: PositionedNode[]): Map<string, Rect> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const rects = new Map<string, Rect>();
  const rectOf = (node: PositionedNode): Rect => {
    const cached = rects.get(node.id);
    if (cached) return cached;
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    const origin = parent ? rectOf(parent) : { x: 0, y: 0 };
    const rect = {
      x: origin.x + node.position.x,
      y: origin.y + node.position.y,
      width: node.width ?? 0,
      height: node.height ?? 0,
    };
    rects.set(node.id, rect);
    return rect;
  };
  for (const node of nodes) rectOf(node);
  return rects;
}
