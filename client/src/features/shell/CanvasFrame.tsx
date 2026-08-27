import type { ReactNode } from 'react';
import { useNavigation } from '../../state/navigation';

const HINT = {
  atlas:
    'Click a system to open it — you get its neighbours, what it must do, and why it is built this way.',
  system: 'Click a neighbour to walk the graph. Esc goes back.',
} as const;

/** The rounded dotted-grid region the diagram lives in, with a hint for the current level. */
export function CanvasFrame({ children }: { children: ReactNode }) {
  const { scope } = useNavigation();
  return (
    <section className="canvas-frame" aria-label="Architecture canvas">
      {children}
      <div className="canvas-hint">{HINT[scope.level]}</div>
    </section>
  );
}
