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
 * the pure `egoLayout`, no ELK. Clicking any card opens it (a neighbour walks, the focus card
 * re-centres the panel on it); an edge selects it; the pane returns the panel to the focus.
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
  const { select } = useSelection();
  const { open } = useNavigation();

  // Opening the focus itself rewinds the trail to it and re-selects it (the panel returns to it).
  const onNodeClick = useCallback<NodeMouseHandler<SystemNode>>(
    (_e, node) => open(node.id),
    [open],
  );
  const onEdgeClick = useCallback<EdgeMouseHandler<SystemEdge>>(
    (_e, edge) => select(edge.id),
    [select],
  );
  const onPaneClick = useCallback(() => select(systemId), [select, systemId]);

  if (!view) return <p className="diagram-error">Unknown system: {systemId}</p>;
  return (
    <FlowCanvas
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick}
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
