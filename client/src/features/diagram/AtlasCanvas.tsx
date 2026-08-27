import { useCallback, useMemo } from 'react';
import type { NodeMouseHandler } from '@xyflow/react';
import type { Project } from '@app/shared';
import { toColumnElements } from '../../layout/columnFlow';
import { columnLayout } from '../../layout/columns';
import { laneOrder } from '../../model/lanes';
import { toFlowElements, type SystemNode } from '../../model/toFlow';
import { useNavigation } from '../../state/navigation';
import { useSelection } from '../../state/selection';
import { LaneLayer } from './components/LaneLayer';
import { FlowCanvas } from './FlowCanvas';

/** Locks land with task 19; until then nothing is pinned and the layout is free to re-flow. */
const NO_LOCKS: ReadonlySet<string> = new Set();

/**
 * The atlas: one column per category in flow order, systems stacked inside. The layout is pure
 * and synchronous, so the whole diagram is on screen on the first paint. Hovering a card previews
 * its neighbourhood, a click selects it (panel), a double-click opens its focus view.
 */
export function AtlasCanvas({ project }: { project: Project }) {
  const { nodes, edges, bounds, lanes } = useMemo(() => {
    const elements = toFlowElements(project);
    const layout = columnLayout(project, { order: laneOrder(project), lockedIds: NO_LOCKS });
    return { ...toColumnElements(elements.nodes, elements.edges, layout), lanes: layout.lanes };
  }, [project]);
  const { select, hover, clear } = useSelection();
  const { open } = useNavigation();

  const onNodeClick = useCallback<NodeMouseHandler<SystemNode>>(
    (_e, node) => select(node.id),
    [select],
  );
  const onNodeDoubleClick = useCallback<NodeMouseHandler<SystemNode>>(
    (_e, node) => open(node.id),
    [open],
  );
  const onEnter = useCallback<NodeMouseHandler<SystemNode>>((_e, node) => hover(node.id), [hover]);
  const onLeave = useCallback(() => hover(null), [hover]);

  return (
    <FlowCanvas
      nodes={nodes}
      edges={edges}
      bounds={bounds}
      className="diagram--atlas"
      onNodeClick={onNodeClick}
      onNodeDoubleClick={onNodeDoubleClick}
      onNodeMouseEnter={onEnter}
      onNodeMouseLeave={onLeave}
      onPaneClick={clear}
    >
      <LaneLayer lanes={lanes} />
    </FlowCanvas>
  );
}
