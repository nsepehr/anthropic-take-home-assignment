import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';
import type { SystemEdge as SystemEdgeType } from '../../model/toFlow';
import { useEdgeLook } from './edgeLook';

/**
 * Bezier edge lit in accent when it touches the selection. The label is drawn when the view set
 * one (the focus view names edges by kind); the atlas leaves it unset to stay at one altitude.
 */
export const SystemEdge = memo(function SystemEdge(props: EdgeProps<SystemEdgeType>) {
  const { id, label, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props;
  const { state, lit, markerEnd } = useEdgeLook(id, props.data?.accent);
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <g className={`diagram-edge is-${state}${lit ? ' is-lit' : ''}`}>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} />
      {label !== undefined && (
        <EdgePill x={sourceX + (targetX - sourceX) * 0.5} y={sourceY + (targetY - sourceY) * 0.3}>
          {String(label)}
        </EdgePill>
      )}
    </g>
  );
});

/** Approximate glyph width of the 11px pill font, so the pill hugs its text without measuring. */
const PILL = { charWidth: 6.4, padding: 9, height: 18 } as const;

/** The edge's kind as a pill, centred on (x, y) — 30% along the vertical run, per the design. */
function EdgePill({ x, y, children }: { x: number; y: number; children: string }) {
  const width = children.length * PILL.charWidth + PILL.padding * 2;
  return (
    <g
      className="diagram-edge__pill"
      transform={`translate(${x - width / 2}, ${y - PILL.height / 2})`}
    >
      <rect width={width} height={PILL.height} rx={PILL.height / 2} />
      <text x={width / 2} y={PILL.height / 2} dominantBaseline="central" textAnchor="middle">
        {children}
      </text>
    </g>
  );
}
