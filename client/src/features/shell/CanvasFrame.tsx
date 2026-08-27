import type { ReactNode } from 'react';
import { useSelection } from '../../state/selection';

const HINT = 'Click a system to read what it does, what it must do, and why it was built this way.';

/** The rounded dotted-grid region the diagram lives in; shows a hint while nothing is selected. */
export function CanvasFrame({ children }: { children: ReactNode }) {
  const { selectedId } = useSelection();
  return (
    <section className="canvas-frame" aria-label="Architecture canvas">
      {children}
      {selectedId === null && <div className="canvas-hint">{HINT}</div>}
    </section>
  );
}
