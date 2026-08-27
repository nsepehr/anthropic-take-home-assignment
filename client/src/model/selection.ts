import { relatedTo, type Project, type Related } from '@app/shared';

export const EMPTY_RELATED: Related = {
  systemIds: [],
  requirementIds: [],
  intentIds: [],
  edgeIds: [],
};

export interface SelectionView {
  selectedId: string | null;
  /** The entity under the pointer, if any; it takes over the highlight while it lasts. */
  hoveredId: string | null;
  /** Closure of the selection per `relatedTo`; empty when nothing is selected. */
  related: Related;
  /** The selected entity and everything related to it. */
  isHighlighted: (id: string) => boolean;
  /** Everything else, only while something is selected. */
  isDimmed: (id: string) => boolean;
}

/**
 * Pure: given the project, the selected id and the hovered id, derive what the UI highlights and
 * dims. A hover previews its own neighbourhood without disturbing the selection underneath.
 */
export function deriveSelection(
  project: Project | null,
  selectedId: string | null,
  hoveredId: string | null = null,
): SelectionView {
  const focusId = hoveredId ?? selectedId;
  const related = project && focusId ? relatedTo(project, focusId) : EMPTY_RELATED;
  const highlighted = new Set<string>([
    ...related.systemIds,
    ...related.requirementIds,
    ...related.intentIds,
    ...related.edgeIds,
  ]);
  if (focusId) highlighted.add(focusId);
  const isHighlighted = (id: string) => highlighted.has(id);
  return {
    selectedId: focusId,
    hoveredId,
    related,
    isHighlighted,
    isDimmed: (id) => focusId !== null && !isHighlighted(id),
  };
}
