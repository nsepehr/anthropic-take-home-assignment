import { ViewportPortal } from '@xyflow/react';

interface Props {
  /** Frame width from `egoLayout`; the outbound label hugs its right edge. */
  width: number;
  inbound: number;
  outbound: number;
}

const LABEL = {
  position: 'absolute',
  top: 12,
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-neutral-600)',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
} as const;

function count(n: number, word: string) {
  return n === 0 ? `no ${word}` : `${n} ${word}`;
}

/** "N inbound" top-left and "N outbound" top-right of the focus frame; pans with the graph. */
export function EgoLabels({ width, inbound, outbound }: Props) {
  return (
    <ViewportPortal>
      <span style={{ ...LABEL, left: 20 }}>{count(inbound, 'inbound')}</span>
      <span style={{ ...LABEL, left: width - 20, transform: 'translateX(-100%)' }}>
        {count(outbound, 'outbound')}
      </span>
    </ViewportPortal>
  );
}
