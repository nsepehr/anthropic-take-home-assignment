import type { ReactNode } from 'react';
import { useSelection } from '../../state/selection';

export interface SidePanelProps {
  /** Shown when nothing is selected. */
  overview: ReactNode;
  /** Shown when an entity is selected. */
  detail: ReactNode;
}

/** The always-visible 400px right panel: project overview or the selected entity's detail. */
export function SidePanel({ overview, detail }: SidePanelProps) {
  const { selectedId } = useSelection();
  return (
    <aside className="side-panel sb" aria-label="Details">
      <div key={selectedId ?? 'overview'}>{selectedId === null ? overview : detail}</div>
    </aside>
  );
}
