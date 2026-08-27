import { relatedTo, type Project, type Related } from '@app/shared';

export const EMPTY_RELATED: Related = {
  systemIds: [],
  requirementIds: [],
  intentIds: [],
  edgeIds: [],
};

export interface SelectionView {
  selectedId: string | null;
  /** Closure of the selection per `relatedTo`; empty when nothing is selected. */
  related: Related;
  /** The selected entity and everything related to it. */
  isHighlighted: (id: string) => boolean;
  /** Everything else, only while something is selected. */
  isDimmed: (id: string) => boolean;
}

/** Pure: given the project and a selected id, derive what the UI highlights and dims. */
export function deriveSelection(project: Project | null, selectedId: string | null): SelectionView {
  const related = project && selectedId ? relatedTo(project, selectedId) : EMPTY_RELATED;
  const highlighted = new Set<string>([
    ...related.systemIds,
    ...related.requirementIds,
    ...related.intentIds,
    ...related.edgeIds,
  ]);
  if (selectedId) highlighted.add(selectedId);
  const isHighlighted = (id: string) => highlighted.has(id);
  return {
    selectedId,
    related,
    isHighlighted,
    isDimmed: (id) => selectedId !== null && !isHighlighted(id),
  };
}
