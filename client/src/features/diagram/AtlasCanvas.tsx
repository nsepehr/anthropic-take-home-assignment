import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import type { NodeMouseHandler } from '@xyflow/react';
import type { Project } from '@app/shared';
import { useAlignedLanes, useLanePartition } from '../../layout/useLanes';
import { useLayout } from '../../layout/useLayout';
import { attachEdgeSides } from '../../model/edgeSides';
import { laneIndex, type LaneBounds } from '../../model/lanes';
import { toFlowElements, type SystemNode } from '../../model/toFlow';
import { useNavigation } from '../../state/navigation';
import { useSelection } from '../../state/selection';
import { sizeLeaves } from './cardSize';
import { LaneLayer } from './components/LaneLayer';
import { FlowCanvas } from './FlowCanvas';

interface Props {
  project: Project;
  /**
   * Layer rendered as a React Flow child with the laid-out lane bounds; defaults to `LaneLayer`.
   * The overlay owns its own `<ViewportPortal>`.
   */
  overlay?: (lanes: LaneBounds[]) => ReactNode;
}

const defaultOverlay = (lanes: LaneBounds[]) => <LaneLayer lanes={lanes} />;

/**
 * The atlas: every system in ELK-laid-out lanes. Hovering a card lights its neighbours (through
 * the selection, so cards and edges reuse their states); clicking opens the system's focus view.
 */
export function AtlasCanvas({ project, overlay = defaultOverlay }: Props) {
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
  const { select, clear } = useSelection();
  const { open } = useNavigation();
  // Once laid out, keep the canvas mounted through re-layouts so the viewport survives.
  const laidOut = useRef(false);
  if (status === 'ready') laidOut.current = true;

  const onNodeClick = useCallback<NodeMouseHandler<SystemNode>>(
    (_e, node) => open(node.id),
    [open],
  );
  const onEnter = useCallback<NodeMouseHandler<SystemNode>>(
    (_e, node) => select(node.id),
    [select],
  );

  if (status === 'error') return <p className="diagram-error">Layout failed: {error}</p>;
  if (!laidOut.current) return null;
  return (
    <FlowCanvas
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick}
      onNodeMouseEnter={onEnter}
      onNodeMouseLeave={clear}
      onPaneClick={clear}
    >
      {overlay(laneRects)}
    </FlowCanvas>
  );
}
