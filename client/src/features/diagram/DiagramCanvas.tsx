import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import {
  ReactFlow,
  ViewportPortal,
  type EdgeMouseHandler,
  type NodeMouseHandler,
} from '@xyflow/react';
import type { Project } from '@app/shared';
import { useLayout } from '../../layout/useLayout';
import { toFlowElements } from '../../model/toFlow';
import { useSelection } from '../../state/selection';
import { useViewMode } from '../../state/viewMode';
import { sizeForMode } from './cardSize';
import { ArrowMarkers } from './components/ArrowMarkers';
import { SystemEdge } from './SystemEdge';
import { SystemNode } from './SystemNode';
import './diagram.css';

const nodeTypes = { system: SystemNode };
const edgeTypes = { system: SystemEdge };
const defaultEdgeOptions = { type: 'system' };

interface Props {
  project: Project;
  /** Rendered inside the viewport (pans/zooms with the graph) — e.g. category lanes. */
  overlay?: ReactNode;
}

/** The architecture diagram: ELK-laid-out system cards and edges, selection via click. */
export function DiagramCanvas({ project, overlay }: Props) {
  const elements = useMemo(() => toFlowElements(project), [project]);
  const { mode } = useViewMode();
  const sizedNodes = useMemo(() => sizeForMode(elements.nodes, mode), [elements.nodes, mode]);
  const { nodes, status, error } = useLayout(sizedNodes, elements.edges);
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
      {overlay && <ViewportPortal>{overlay}</ViewportPortal>}
    </ReactFlow>
  );
}
