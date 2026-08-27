import { useCallback, useMemo } from 'react';
import type { Project } from '@app/shared';
import type { PartitionOf } from './elk';
import { laneBounds, laneIndex, type PositionedNode } from '../model/lanes';

/**
 * Lane wiring for a diagram: a stable `partitionOf` to hand `useLayout`, and the lane rectangles
 * derived from the positioned nodes it returns.
 */
export function useLanes(project: Project, positionedNodes: PositionedNode[]) {
  const index = useMemo(() => laneIndex(project), [project]);
  const partitionOf = useCallback<PartitionOf>(
    (id) => {
      const category = index.categoryById.get(id);
      return category === undefined ? undefined : index.order.indexOf(category);
    },
    [index],
  );
  const lanes = useMemo(() => laneBounds(positionedNodes, index), [positionedNodes, index]);
  return { partitionOf, lanes };
}
