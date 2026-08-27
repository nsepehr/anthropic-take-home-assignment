import { useCallback, useMemo, useRef } from 'react';
import type { NodeMouseHandler } from '@xyflow/react';
import type { Project } from '@app/shared';
import { useAlignedLanes, useLanePartition } from '../../layout/useLanes';
import { useLayout } from '../../layout/useLayout';
import { attachEdgeSides } from '../../model/edgeSides';
import { laneIndex } from '../../model/lanes';
import { toFlowElements, type SystemNode } from '../../model/toFlow';
import { useNavigation } from '../../state/navigation';
import { useSelection } from '../../state/selection';
import { sizeLeaves } from './cardSize';
import { LaneLayer } from './components/LaneLayer';
import { FlowCanvas } from './FlowCanvas';

/**
 * The atlas: every system in ELK-laid-out lanes. Hovering a card previews its neighbourhood;
 * clicking opens the system's focus view.
 */
export function AtlasCanvas({ project }: { project: Project }) {
  const elements = useMemo(() => toFlowElements(project), [project]);
  const sizedNodes = useMemo(() => sizeLeaves(elements.nodes), [elements.nodes]);
  // Lanes partition the ELK layout; the positioned nodes are then top-aligned per lane and
  // edge sides are chosen last, from the final positions.
  const index = useMemo(() => laneIndex(project), [project]);
  const partitionOf = useLanePartition(index);
  const {
    nodes: placed,
    status,
    error,
  } = useLayout(sizedNodes, elements.edges, undefined, partitionOf);
  const { nodes, lanes: laneRects } = useAlignedLanes(placed, index);
  const edges = useMemo(() => attachEdgeSides(nodes, elements.edges), [nodes, elements.edges]);
  const { hover, clear } = useSelection();
  const { open } = useNavigation();
  // Once laid out, keep the canvas mounted through re-layouts so the viewport survives.
  const laidOut = useRef(false);
  if (status === 'ready') laidOut.current = true;

  const onNodeClick = useCallback<NodeMouseHandler<SystemNode>>(
    (_e, node) => open(node.id),
    [open],
  );
  const onEnter = useCallback<NodeMouseHandler<SystemNode>>((_e, node) => hover(node.id), [hover]);
  const onLeave = useCallback(() => hover(null), [hover]);

  if (status === 'error') return <p className="diagram-error">Layout failed: {error}</p>;
  if (!laidOut.current) return null;
  return (
    <FlowCanvas
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick}
      onNodeMouseEnter={onEnter}
      onNodeMouseLeave={onLeave}
      onPaneClick={clear}
    >
      <LaneLayer lanes={laneRects} />
    </FlowCanvas>
  );
}
