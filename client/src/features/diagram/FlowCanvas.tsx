import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  ReactFlow,
  type EdgeMouseHandler,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from '@xyflow/react';
import type {
  SystemEdge as SystemEdgeType,
  SystemNode as SystemNodeType,
} from '../../model/toFlow';
import { ARC_EDGE_TYPE } from '../../layout/columnEdges';
import { FIT, fitViewport, type Box } from '../../layout/fitViewport';
import { ArcEdge } from './ArcEdge';
import { ArrowMarkers } from './components/ArrowMarkers';
import { SystemEdge } from './SystemEdge';
import { SystemNode } from './SystemNode';

const nodeTypes = { system: SystemNode };
const edgeTypes = { system: SystemEdge, [ARC_EDGE_TYPE]: ArcEdge };
const defaultEdgeOptions = { type: 'system' };
/** Pixels the pointer may drift between mousedown/up and still count as a click. */
const CLICK_DISTANCE = 6;

export interface FlowCanvasProps {
  nodes: SystemNodeType[];
  edges: SystemEdgeType[];
  /** The box the view's layout occupies; the canvas keeps all of it on screen. */
  bounds: Box | undefined;
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

type Instance = ReactFlowInstance<SystemNodeType, SystemEdgeType>;

/** The React Flow instance both views share: read-only, pannable, always showing the whole graph. */
export function FlowCanvas({
  nodes,
  edges,
  bounds,
  children,
  className,
  ...handlers
}: FlowCanvasProps) {
  const host = useRef<HTMLDivElement>(null);
  const flow = useRef<Instance | null>(null);

  /**
   * Both views hand React Flow a finished layout, so the viewport comes straight from it. React
   * Flow's own `fitView` waits on a measurement pass that never runs for nodes that arrive already
   * sized, so it would leave the graph unfitted.
   */
  const fit = useCallback(() => {
    const box = host.current?.getBoundingClientRect();
    if (!flow.current || !box || !bounds || box.width <= 0 || box.height <= 0) return;
    void flow.current.setViewport(fitViewport(bounds, box.width, box.height));
  }, [bounds]);

  // Refit whenever the canvas changes size: the diagram is an overview, so it stays whole.
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fit]);

  const onInit = useCallback(
    (instance: Instance) => {
      flow.current = instance;
      fit();
    },
    [fit],
  );

  return (
    <div ref={host} className="diagram-host">
      <ReactFlow
        className={['diagram', className].filter(Boolean).join(' ')}
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        {...handlers}
        onInit={onInit}
        nodeClickDistance={CLICK_DISTANCE}
        paneClickDistance={CLICK_DISTANCE}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll
        zoomOnDoubleClick={false}
        panOnDrag
        minZoom={FIT.minZoom}
        proOptions={{ hideAttribution: true }}
      >
        <ArrowMarkers />
        {children}
      </ReactFlow>
    </div>
  );
}
