import { useCallback, useMemo } from 'react';
import { ReactFlow, type EdgeMouseHandler, type NodeMouseHandler } from '@xyflow/react';
import type { Project } from '@app/shared';
import { useLayout } from '../../../layout/useLayout';
import { toFlowElements } from '../../../model/toFlow';
import { useSelection } from '../../../state/selection';

const DIMMED_OPACITY = 0.25;

/** Raw React Flow canvas with default node visuals; selection dims via opacity only. */
export function DebugCanvas({ project }: { project: Project }) {
  const elements = useMemo(() => toFlowElements(project), [project]);
  const { nodes, status, error } = useLayout(elements.nodes, elements.edges);
  const { select, clear, isDimmed } = useSelection();

  const dim = useCallback(
    <T extends { id: string }>(items: T[]) =>
      items.map((item) => ({
        ...item,
        style: { opacity: isDimmed(item.id) ? DIMMED_OPACITY : 1 },
      })),
    [isDimmed],
  );
  const styledNodes = useMemo(() => dim(nodes), [dim, nodes]);
  const styledEdges = useMemo(() => dim(elements.edges), [dim, elements.edges]);

  const onNodeClick = useCallback<NodeMouseHandler>((_e, node) => select(node.id), [select]);
  const onEdgeClick = useCallback<EdgeMouseHandler>((_e, edge) => select(edge.id), [select]);

  if (status === 'error') return <p>Layout failed: {error}</p>;
  return (
    <div style={{ height: '70vh', border: '1px solid #ccc' }}>
      {status === 'ready' && (
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={clear}
          nodesDraggable={false}
          nodesConnectable={false}
          fitView
        />
      )}
    </div>
  );
}
