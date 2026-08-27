import { useSelection } from '../../state/selection';
import { elementState, type ElementState } from './cardState';
import { ARROW_ID } from './components/ArrowMarkers';

export interface EdgeLook {
  state: ElementState;
  /** Lit edges are drawn in accent: the selection touches them, or the view always accents them. */
  lit: boolean;
  markerEnd: string;
}

/**
 * How one edge should look right now. Shared by both edge renderers so the bezier and the arc
 * answer to the selection identically.
 */
export function useEdgeLook(id: string, accent?: boolean): EdgeLook {
  const state = elementState(id, useSelection());
  const lit =
    state === 'selected' || state === 'related' || (accent === true && state !== 'dimmed');
  return { state, lit, markerEnd: `url(#${lit ? ARROW_ID.lit : ARROW_ID.idle})` };
}
