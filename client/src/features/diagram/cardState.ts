import type { SelectionView } from '../../model/selection';

/** How the selection touches one diagram element. Pure; shared by cards and edges. */
export type ElementState = 'selected' | 'related' | 'dimmed' | 'idle';

export function elementState(
  id: string,
  selection: Pick<SelectionView, 'selectedId' | 'isHighlighted' | 'isDimmed'>,
): ElementState {
  if (selection.selectedId === id) return 'selected';
  if (selection.isDimmed(id)) return 'dimmed';
  if (selection.isHighlighted(id)) return 'related';
  return 'idle';
}
