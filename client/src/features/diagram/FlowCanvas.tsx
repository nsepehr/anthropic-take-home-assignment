import type { ReactNode } from 'react';
import { ReactFlow, type EdgeMouseHandler, type NodeMouseHandler } from '@xyflow/react';
import type {
  SystemEdge as SystemEdgeType,
  SystemNode as SystemNodeType,
} from '../../model/toFlow';
import { ArrowMarkers } from './components/ArrowMarkers';
import { SystemEdge } from './SystemEdge';
import { SystemNode } from './SystemNode';

const nodeTypes = { system: SystemNode };
const edgeTypes = { system: SystemEdge };
const defaultEdgeOptions = { type: 'system' };
/** Fit the whole graph on load with a slim margin; the floor only matters for huge projects. */
const FIT_VIEW = { padding: 0.08 };
const MIN_ZOOM = 0.2;
/** Pixels the pointer may drift between mousedown/up and still count as a click. */
const CLICK_DISTANCE = 6;

export interface FlowCanvasProps {
  nodes: SystemNodeType[];
  edges: SystemEdgeType[];
  onNodeClick: NodeMouseHandler<SystemNodeType>;
  onNodeDoubleClick?: NodeMouseHandler<SystemNodeType>;
  onEdgeClick?: EdgeMouseHandler<SystemEdgeType>;
  onPaneClick: () => void;
  onNodeMouseEnter?: NodeMouseHandler<SystemNodeType>;
  onNodeMouseLeave?: NodeMouseHandler<SystemNodeType>;
  /** Overlays rendered as React Flow children (lanes, ego labels). */
  children?: ReactNode;
  /** Extra class on the React Flow root (per-view styling hooks). */
  className?: string;
}

/** The React Flow instance both views share: read-only, pannable, fitted on mount. */
export function FlowCanvas({ nodes, edges, children, className, ...handlers }: FlowCanvasProps) {
  return (
    <ReactFlow
      className={['diagram', className].filter(Boolean).join(' ')}
      nodes={nodes}
      edges={edges}
      defaultEdgeOptions={defaultEdgeOptions}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      {...handlers}
      nodeClickDistance={CLICK_DISTANCE}
      paneClickDistance={CLICK_DISTANCE}
      nodesDraggable={false}
      nodesConnectable={false}
      zoomOnScroll
      zoomOnDoubleClick={false}
      panOnDrag
      minZoom={MIN_ZOOM}
      fitView
      fitViewOptions={FIT_VIEW}
      proOptions={{ hideAttribution: true }}
    >
      <ArrowMarkers />
      {children}
    </ReactFlow>
  );
}
