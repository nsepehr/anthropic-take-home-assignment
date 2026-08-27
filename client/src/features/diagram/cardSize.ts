/** Height ELK lays out with: what a card renders at (title + clamped summary + tag row). */
export const CARD_HEIGHT = 152;

/** Pure: give every leaf node the card height; parents are sized by ELK. */
export function sizeLeaves<N extends { id: string; parentId?: string; height?: number }>(
  nodes: N[],
): N[] {
  const parents = new Set(nodes.map((n) => n.parentId).filter(Boolean));
  return nodes.map((n) => (parents.has(n.id) ? n : { ...n, height: CARD_HEIGHT }));
}
