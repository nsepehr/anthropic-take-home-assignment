import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import { ReactFlow, type EdgeMouseHandler, type NodeMouseHandler } from '@xyflow/react';
import type { Project } from '@app/shared';
import type { PartitionOf } from '../../layout/elk';
import { useLayout } from '../../layout/useLayout';
import { laneBounds, laneIndex, type LaneBounds } from '../../model/lanes';
import { toFlowElements } from '../../model/toFlow';
import { useSelection } from '../../state/selection';
import { useViewMode } from '../../state/viewMode';
import { sizeForMode } from './cardSize';
import { ArrowMarkers } from './components/ArrowMarkers';
import { LaneLayer } from './components/LaneLayer';
import { SystemEdge } from './SystemEdge';
import { SystemNode } from './SystemNode';
import './diagram.css';

const nodeTypes = { system: SystemNode };
const edgeTypes = { system: SystemEdge };
const defaultEdgeOptions = { type: 'system' };

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
  const { mode } = useViewMode();
  const sizedNodes = useMemo(() => sizeForMode(elements.nodes, mode), [elements.nodes, mode]);
  // Lanes: categories partition the ELK layout; their bounds follow from the positioned nodes.
  const lanes = useMemo(() => laneIndex(project), [project]);
  const partitionOf = useCallback<PartitionOf>(
    (id) => {
      const category = lanes.categoryById.get(id);
      return category === undefined ? undefined : lanes.order.indexOf(category);
    },
    [lanes],
  );
  const { nodes, status, error } = useLayout(sizedNodes, elements.edges, undefined, partitionOf);
  const laneRects = useMemo(() => laneBounds(nodes, lanes), [nodes, lanes]);
  const { select, clear } = useSelection();
  // Once laid out, keep the canvas mounted through re-layouts (mode toggle) so the viewport survives.
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
      edges={elements.edges}
      defaultEdgeOptions={defaultEdgeOptions}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onPaneClick={clear}
      nodesDraggable={false}
      nodesConnectable={false}
      zoomOnScroll
      panOnDrag
      minZoom={0.4}
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <ArrowMarkers />
      {overlay(laneRects)}
    </ReactFlow>
  );
}
