import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import { ReactFlow, type EdgeMouseHandler, type NodeMouseHandler } from '@xyflow/react';
import type { Project } from '@app/shared';
import { useAlignedLanes, useLanePartition } from '../../layout/useLanes';
import { useLayout } from '../../layout/useLayout';
import { attachEdgeSides } from '../../model/edgeSides';
import { laneIndex, type LaneBounds } from '../../model/lanes';
import { toFlowElements } from '../../model/toFlow';
import { useSelection } from '../../state/selection';
import { sizeLeaves } from './cardSize';
import { ArrowMarkers } from './components/ArrowMarkers';
import { LaneLayer } from './components/LaneLayer';
import { SystemEdge } from './SystemEdge';
import { SystemNode } from './SystemNode';
import './diagram.css';

const nodeTypes = { system: SystemNode };
const edgeTypes = { system: SystemEdge };
const defaultEdgeOptions = { type: 'system' };
/** Fit the whole graph on load with a slim margin; the floor only matters for huge projects. */
const FIT_VIEW = { padding: 0.08 };
const MIN_ZOOM = 0.2;
/** Pixels the pointer may drift between mousedown/up and still count as a click. */
const CLICK_DISTANCE = 6;

interface Props {
  project: Project;
  /**
   * Layer rendered as a React Flow child with the laid-out lane bounds; defaults to `LaneLayer`.
   * The overlay owns its own `<ViewportPortal>`.
   */
  overlay?: (lanes: LaneBounds[]) => ReactNode;
}

const defaultOverlay = (lanes: LaneBounds[]) => <LaneLayer lanes={lanes} />;

/** The architecture diagram: ELK-laid-out system cards and edges, selection via click. */
export function DiagramCanvas({ project, overlay = defaultOverlay }: Props) {
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
  // Once laid out, keep the canvas mounted through re-layouts so the viewport survives.
  const laidOut = useRef(false);
  if (status === 'ready') laidOut.current = true;

  const onNodeClick = useCallback<NodeMouseHandler>((_e, node) => select(node.id), [select]);
  const onEdgeClick = useCallback<EdgeMouseHandler>((_e, edge) => select(edge.id), [select]);

  if (status === 'error') return <p className="diagram-error">Layout failed: {error}</p>;
  if (!laidOut.current) return null;
  return (
    <ReactFlow
      className="diagram"
      nodes={nodes}
      edges={edges}
      defaultEdgeOptions={defaultEdgeOptions}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onPaneClick={clear}
      nodeClickDistance={CLICK_DISTANCE}
      paneClickDistance={CLICK_DISTANCE}
      nodesDraggable={false}
      nodesConnectable={false}
      zoomOnScroll
      panOnDrag
      minZoom={MIN_ZOOM}
      fitView
      fitViewOptions={FIT_VIEW}
      proOptions={{ hideAttribution: true }}
    >
      <ArrowMarkers />
      {overlay(laneRects)}
    </ReactFlow>
  );
}
