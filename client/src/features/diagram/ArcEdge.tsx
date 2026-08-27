import { memo } from 'react';
import { BaseEdge, type EdgeProps } from '@xyflow/react';
import { arcPath } from '../../layout/columnEdges';
import type { SystemEdge as SystemEdgeType } from '../../model/toFlow';
import { useEdgeLook } from './edgeLook';

/**
 * An edge between two systems of the same column. It leaves and re-enters on the right face, so
 * it arcs through the gutter beside the column instead of cutting across the stack. Drawn at
 * reduced emphasis until the selection touches it: within a stage, the stack is the story.
 */
export const ArcEdge = memo(function ArcEdge(props: EdgeProps<SystemEdgeType>) {
  const { id, sourceX, sourceY, targetX, targetY } = props;
  const { state, lit, markerEnd } = useEdgeLook(id, props.data?.accent);
  return (
    <g className={`diagram-edge diagram-edge--arc is-${state}${lit ? ' is-lit' : ''}`}>
      <BaseEdge id={id} path={arcPath(sourceX, sourceY, targetX, targetY)} markerEnd={markerEnd} />
    </g>
  );
});
