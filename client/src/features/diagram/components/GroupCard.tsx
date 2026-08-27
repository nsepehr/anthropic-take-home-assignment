import type { ElementState } from '../cardState';

/** Container for a system that has children: a translucent frame with the name top-left. */
export function GroupCard({ name, state }: { name: string; state: ElementState }) {
  return (
    <div className={`diagram-group is-${state}`}>
      <span className="diagram-group__label">{name}</span>
    </div>
  );
}
