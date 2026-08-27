import type { ReactNode } from 'react';
import { panelEntityId } from '../../model/panelAction';
import { scopeKey } from '../../model/scope';
import { useNavigation } from '../../state/navigation';
import { useSelection } from '../../state/selection';

export interface SidePanelProps {
  /** Shown on the atlas while nothing is selected. */
  overview: ReactNode;
  /** Shown for the selected entity, or the focused system in a focus view. */
  detail: ReactNode;
}

/** The always-visible 380px right panel; remounts per entity so local UI state resets. */
export function SidePanel({ overview, detail }: SidePanelProps) {
  const { scope } = useNavigation();
  const { selectedId } = useSelection();
  const entityId = panelEntityId(scope, selectedId);
  return (
    <aside className="side-panel sb" aria-label="Details">
      <div key={`${scopeKey(scope)}:${entityId ?? 'overview'}`}>
        {entityId === null ? overview : detail}
      </div>
    </aside>
  );
}
