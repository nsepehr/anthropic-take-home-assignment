import { memo } from 'react';
import { Handle, Position, useStore, type NodeProps } from '@xyflow/react';
import type { Side } from '../../model/edgeSides';
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
      <SideHandles type="target" />
      {isParent ? (
        <GroupCard name={data.system.name} state={state} />
      ) : (
        <SystemCard
          system={data.system}
          requirementCount={data.requirementCount}
          intentCount={data.intentCount}
          state={state}
          focus={data.focus}
        />
      )}
      <SideHandles type="source" />
    </>
  );
});

const SIDES: Array<[Side, Position]> = [
  ['t', Position.Top],
  ['r', Position.Right],
  ['b', Position.Bottom],
  ['l', Position.Left],
];

/** One hidden handle per side so edges can attach wherever `edgeSides` decides. */
function SideHandles({ type }: { type: 'source' | 'target' }) {
  return SIDES.map(([id, position]) => (
    <Handle key={id} id={id} type={type} position={position} className="diagram-handle" />
  ));
}
