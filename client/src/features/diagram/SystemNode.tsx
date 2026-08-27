import { memo } from 'react';
import { Handle, Position, useStore, type NodeProps } from '@xyflow/react';
import type { SystemNode as SystemNodeType } from '../../model/toFlow';
import { useSelection } from '../../state/selection';
import { elementState } from './cardState';
import { GroupCard } from './components/GroupCard';
import { SystemCard } from './components/SystemCard';

/** React Flow node for a System: a card for leaves, a container frame for parents. */
export const SystemNode = memo(function SystemNode({ id, data }: NodeProps<SystemNodeType>) {
  const selection = useSelection();
  const isParent = useStore((s) => s.parentLookup.has(id));
  const state = elementState(id, selection);

  return (
    <>
      <Handle type="target" position={Position.Left} className="diagram-handle" />
      {isParent ? (
        <GroupCard name={data.system.name} state={state} />
      ) : (
        <SystemCard
          system={data.system}
          requirementCount={data.requirementCount}
          intentCount={data.intentCount}
          state={state}
        />
      )}
      <Handle type="source" position={Position.Right} className="diagram-handle" />
    </>
  );
});
