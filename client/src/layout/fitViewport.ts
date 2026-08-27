export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** React Flow's viewport: pan in screen pixels plus a scale. */
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Fit settings. The margin is a fraction of the graph's own size, so it scales with the diagram.
 * Fitting never zooms past 1: cards are drawn at their design size and blowing them up looks
 * broken — the reader can still zoom in by hand.
 */
export const FIT = { padding: 0.08, minZoom: 0.2, maxZoom: 1 } as const;

/** Pure: the box enclosing positioned, sized cards; `undefined` when there are none. */
export function boundsOf(
  nodes: readonly { position: { x: number; y: number }; width: number; height: number }[],
): Box | undefined {
  if (!nodes.length) return undefined;
  const x = Math.min(...nodes.map((n) => n.position.x));
  const y = Math.min(...nodes.map((n) => n.position.y));
  const right = Math.max(...nodes.map((n) => n.position.x + n.width));
  const bottom = Math.max(...nodes.map((n) => n.position.y + n.height));
  return { x, y, width: right - x, height: bottom - y };
}

/**
 * Pure: the viewport that centres `bounds` in a `width`×`height` canvas with `FIT.padding` around
 * it. This is the layout's own answer to "show me everything" — React Flow's `fitView` waits for
 * it to measure the cards, which never happens for nodes that arrive already sized.
 */
export function fitViewport(bounds: Box, width: number, height: number): Viewport {
  const scale = (available: number, extent: number) =>
    extent > 0 ? available / (extent * (1 + FIT.padding)) : FIT.maxZoom;
  const zoom = clamp(
    Math.min(scale(width, bounds.width), scale(height, bounds.height)),
    FIT.minZoom,
    FIT.maxZoom,
  );
  return {
    x: width / 2 - (bounds.x + bounds.width / 2) * zoom,
    y: height / 2 - (bounds.y + bounds.height / 2) * zoom,
    zoom,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
