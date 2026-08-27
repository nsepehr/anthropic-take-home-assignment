import { useMemo } from 'react';
import { laneBounds, lanePartition, type LaneIndex, type PositionedNode } from '../model/lanes';
import { alignLaneTops, spaceLanes, UNIFORM_LANE_HEIGHT } from './alignLanes';
import type { PartitionOf } from './elk';

/** A stable `partitionOf` for `useLayout`: each lane becomes one left-to-right partition. */
export function useLanePartition(index: LaneIndex): PartitionOf {
  return useMemo(() => lanePartition(index), [index]);
}

/** Positioned nodes with lanes spaced apart and top-aligned, and the lane rectangles from them. */
export function useAlignedLanes<N extends PositionedNode>(positionedNodes: N[], index: LaneIndex) {
  const nodes = useMemo(
    () => alignLaneTops(spaceLanes(positionedNodes, index), index),
    [positionedNodes, index],
  );
  const lanes = useMemo(() => laneBounds(nodes, index, UNIFORM_LANE_HEIGHT), [nodes, index]);
  return { nodes, lanes };
}
