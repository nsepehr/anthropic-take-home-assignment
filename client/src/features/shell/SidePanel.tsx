import type { ReactNode } from 'react';
import { useSelection } from '../../state/selection';

/** The 380px right panel of a focus view; remounts per selection so local UI state resets. */
export function SidePanel({ children }: { children: ReactNode }) {
  const { selectedId } = useSelection();
  return (
    <aside className="side-panel sb" aria-label="Details">
      <div key={selectedId ?? 'none'}>{children}</div>
    </aside>
  );
}
