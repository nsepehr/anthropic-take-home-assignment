import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';
import type { SystemEdge as SystemEdgeType } from '../../model/toFlow';
import { useSelection } from '../../state/selection';
import { elementState } from './cardState';
import { ARROW_ID } from './components/ArrowMarkers';

/**
 * Bezier edge lit in accent when it touches the selection. The label is drawn when the view set
 * one (the focus view names edges by kind); the atlas leaves it unset to stay at one altitude.
 */
export const SystemEdge = memo(function SystemEdge(props: EdgeProps<SystemEdgeType>) {
  const { id, label, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props;
  const selection = useSelection();
  const state = elementState(id, selection);
  const lit = state === 'selected' || state === 'related';
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <g className={`diagram-edge is-${state}${lit ? ' is-lit' : ''}`}>
      <BaseEdge id={id} path={path} markerEnd={`url(#${lit ? ARROW_ID.lit : ARROW_ID.idle})`} />
      {label !== undefined && (
        <text className="diagram-edge__label" x={labelX} y={labelY} dy={-6} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
});
