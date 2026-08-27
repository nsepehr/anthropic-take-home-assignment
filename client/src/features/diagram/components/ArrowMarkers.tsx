/** Marker ids: the lit one is accent, the other neutral (colours in diagram.css). */
export const ARROW_ID = { lit: 'diagram-arrow-lit', idle: 'diagram-arrow' } as const;

/** SVG arrowhead definitions referenced by every edge (one neutral, one accent). */
export function ArrowMarkers() {
  return (
    <svg className="diagram-markers" aria-hidden>
      <defs>
        {Object.values(ARROW_ID).map((id) => (
          <marker
            key={id}
            id={id}
            viewBox="0 0 8 8"
            refX="6"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path className="diagram-marker__head" d="M0,1 L7,4 L0,7 z" />
          </marker>
        ))}
      </defs>
    </svg>
  );
}
