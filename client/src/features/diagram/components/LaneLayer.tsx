import { ViewportPortal } from '@xyflow/react';
import { LANE_PADDING, type LaneBounds } from '../../../model/lanes';

const LANE_STYLE = {
  position: 'absolute',
  borderRadius: 'var(--radius-lg)',
  background: 'color-mix(in srgb, var(--color-surface) 55%, transparent)',
  pointerEvents: 'none',
  zIndex: -1,
} as const;

const LABEL_STYLE = {
  position: 'absolute',
  left: LANE_PADDING.side + 4,
  top: 8,
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-neutral-600)',
  whiteSpace: 'nowrap',
} as const;

/**
 * Translucent lane behind each category with an uppercase label. Rendered inside the React Flow
 * viewport so it pans and zooms with the graph; rendered by `AtlasCanvas`.
 */
export function LaneLayer({ lanes }: { lanes: LaneBounds[] }) {
  return (
    <ViewportPortal>
      {lanes.map((lane) => (
        <div
          key={lane.category}
          data-testid="lane"
          data-category={lane.category}
          style={{
            ...LANE_STYLE,
            transform: `translate(${lane.x}px, ${lane.y}px)`,
            width: lane.width,
            height: lane.height,
          }}
        >
          <span style={LABEL_STYLE}>{lane.category}</span>
        </div>
      ))}
    </ViewportPortal>
  );
}
