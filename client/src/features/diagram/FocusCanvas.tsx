import { useCallback, useMemo } from 'react';
import type { EdgeMouseHandler, NodeMouseHandler } from '@xyflow/react';
import type { Project } from '@app/shared';
import { egoLayout } from '../../layout/egoLayout';
import { attachEdgeSides } from '../../model/edgeSides';
import { focusFlowElements } from '../../model/focusFlow';
import { focusView } from '../../model/focusView';
import type { SystemEdge, SystemNode } from '../../model/toFlow';
import { useNavigation } from '../../state/navigation';
import { useSelection } from '../../state/selection';
import { EgoLabels } from './components/EgoLabels';
import { FlowCanvas } from './FlowCanvas';

interface Props {
  project: Project;
  systemId: string;
}

/**
 * System focus: the ego graph of one system — inbound neighbours left, outbound right — from
 * the pure `egoLayout`, no ELK. A click selects a card or edge (panel); a double-click walks
 * to a neighbour; the pane clears the selection so the panel returns to the focused system.
 */
export function FocusCanvas({ project, systemId }: Props) {
  const view = useMemo(() => focusView(project, systemId), [project, systemId]);
  const { nodes, edges, layout } = useMemo(() => {
    if (!view) return { nodes: [], edges: [], layout: { width: 0, height: 0 } };
    const layout = egoLayout({
      focusId: view.focus.system.id,
      inboundIds: view.inbound.map((n) => n.system.id),
      outboundIds: view.outbound.map((n) => n.system.id),
    });
    const elements = focusFlowElements(view, layout.nodes);
    return {
      nodes: elements.nodes,
      edges: attachEdgeSides(elements.nodes, elements.edges),
      layout,
    };
  }, [view]);
  const { select, clear } = useSelection();
  const { open } = useNavigation();

  const onNodeClick = useCallback<NodeMouseHandler<SystemNode>>(
    (_e, node) => select(node.id),
    [select],
  );
  const onNodeDoubleClick = useCallback<NodeMouseHandler<SystemNode>>(
    (_e, node) => open(node.id),
    [open],
  );
  const onEdgeClick = useCallback<EdgeMouseHandler<SystemEdge>>(
    (_e, edge) => select(edge.id),
    [select],
  );
  const onPaneClick = clear;

  if (!view) return <p className="diagram-error">Unknown system: {systemId}</p>;
  return (
    <FlowCanvas
      nodes={nodes}
      edges={edges}
      className="diagram--focus"
      onNodeClick={onNodeClick}
      onNodeDoubleClick={onNodeDoubleClick}
      onEdgeClick={onEdgeClick}
      onPaneClick={onPaneClick}
    >
      <EgoLabels
        width={layout.width}
        inbound={view.inbound.length}
        outbound={view.outbound.length}
      />
    </FlowCanvas>
  );
}
