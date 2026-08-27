import { useEffect, useState } from 'react';
import { layoutWithElk, type ElkOptions, type LayoutEdge, type LayoutNode } from './elk';

export type LayoutStatus = 'idle' | 'layouting' | 'ready' | 'error';

export interface LayoutResult<N extends LayoutNode> {
  /** Positioned nodes once `status === 'ready'`; the last positioned (or input) nodes before. */
  nodes: N[];
  status: LayoutStatus;
  error: string | null;
}

/** Resolves ELK layout for the given elements. Pass memoized inputs: a new array re-runs layout. */
export function useLayout<N extends LayoutNode>(
  nodes: N[],
  edges: LayoutEdge[],
  options?: ElkOptions,
): LayoutResult<N> {
  const [state, setState] = useState<LayoutResult<N>>({ nodes, status: 'idle', error: null });

  useEffect(() => {
    if (!nodes.length) return setState({ nodes, status: 'idle', error: null });
    let cancelled = false;
    setState((s) => ({ ...s, status: 'layouting' }));
    layoutWithElk(nodes, edges, options).then(
      (placed) => !cancelled && setState({ nodes: placed, status: 'ready', error: null }),
      (err: unknown) => !cancelled && setState({ nodes, status: 'error', error: String(err) }),
    );
    return () => {
      cancelled = true;
    };
  }, [nodes, edges, options]);

  return state;
}
