import type { ViewMode } from '../../state/viewMode';

/** Heights ELK lays out with: what a card renders at (title + clamped body + two tag rows). */
export const CARD_HEIGHT: Record<ViewMode, number> = { overview: 152, deepDive: 264 };

/** Pure: give every leaf node the card height for the current view mode. */
export function sizeForMode<N extends { id: string; parentId?: string; height?: number }>(
  nodes: N[],
  mode: ViewMode,
): N[] {
  const parents = new Set(nodes.map((n) => n.parentId).filter(Boolean));
  return nodes.map((n) => (parents.has(n.id) ? n : { ...n, height: CARD_HEIGHT[mode] }));
}
