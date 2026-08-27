import type { Scope } from './scope';

/** What the detail card's action button does at this scope with this selection (design rev 4). */
export type PanelAction =
  { label: 'Close' | 'Clear'; kind: 'clear' } | { label: 'Back'; kind: 'back' };

/**
 * Atlas: "Close" clears the selection (the panel returns to the project). Focus view with a
 * neighbour selected: "Clear" (the panel returns to the focused system). Focus view showing the
 * focused system itself: "Back" walks one hop.
 */
export function panelAction(scope: Scope, selectedId: string | null): PanelAction {
  if (scope.level === 'atlas') return { label: 'Close', kind: 'clear' };
  if (selectedId !== null && selectedId !== scope.id) return { label: 'Clear', kind: 'clear' };
  return { label: 'Back', kind: 'back' };
}

/** The entity the panel shows: the selection, else the focused system, else nothing (overview). */
export function panelEntityId(scope: Scope, selectedId: string | null): string | null {
  if (selectedId !== null) return selectedId;
  return scope.level === 'system' ? scope.id : null;
}
