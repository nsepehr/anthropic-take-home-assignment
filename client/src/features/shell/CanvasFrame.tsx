import type { ReactNode } from 'react';
import { CanvasHint } from './CanvasHint';

/** The rounded dotted-grid region the diagram lives in, with the hint or coach-mark for the level. */
export function CanvasFrame({ children }: { children: ReactNode }) {
  return (
    <section className="canvas-frame" aria-label="Architecture canvas">
      {children}
      <CanvasHint />
    </section>
  );
}
