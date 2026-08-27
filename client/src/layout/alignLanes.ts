import { laneOf, type LaneIndex, type PositionedNode } from '../model/lanes';

/**
 * Whether lane backgrounds all take the tallest lane's height (one even band, as in the design)
 * or hug their own cards. Cards are never stretched either way.
 */
export const UNIFORM_LANE_HEIGHT = true;

/** Extra horizontal room between neighbouring lanes, on top of ELK's layer spacing. */
export const LANE_GAP = 40;

/**
 * Pure post-process: push each lane right by `gap` per lane before it, so bands read as
 * separate columns. Nested nodes move with their parent; nodes outside any lane stay put.
 */
export function spaceLanes<N extends PositionedNode>(
  nodes: N[],
  { order, categoryById }: LaneIndex,
  gap = LANE_GAP,
): N[] {
  return nodes.map((n) => {
    const category = laneOf(n, categoryById);
    const shift = category ? Math.max(0, order.indexOf(category)) * gap : 0;
    return shift ? { ...n, position: { x: n.position.x + shift, y: n.position.y } } : n;
  });
}

/**
 * Pure post-process: shift each lane's top-level nodes vertically so every lane starts at the
 * same top (the highest lane's). Nested nodes move with their parent; nodes outside any lane are
 * left where ELK put them. Run before choosing edge sides.
 */
export function alignLaneTops<N extends PositionedNode>(
  nodes: N[],
  { categoryById }: LaneIndex,
): N[] {
  const topOf = new Map<string, number>();
  for (const n of nodes) {
    const category = laneOf(n, categoryById);
    if (!category) continue;
    topOf.set(category, Math.min(topOf.get(category) ?? Infinity, n.position.y));
  }
  if (!topOf.size) return nodes;
  const top = Math.min(...topOf.values());
  return nodes.map((n) => {
    const category = laneOf(n, categoryById);
    const shift = category ? topOf.get(category)! - top : 0;
    return shift ? { ...n, position: { x: n.position.x, y: n.position.y - shift } } : n;
  });
}
