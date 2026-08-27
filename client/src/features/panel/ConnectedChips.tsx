import type { FoundEntity } from '../../model/entities';
import { entityLabel } from '../../model/entities';
import { useNavigation } from '../../state/navigation';
import { useSelection } from '../../state/selection';

/**
 * Pills for every entity linked to the selection. A system chip opens that system (the canvas
 * walks there); a requirement or intent chip re-centers the panel on it.
 */
export function ConnectedChips({ connections }: { connections: FoundEntity[] }) {
  const { select } = useSelection();
  const { open } = useNavigation();
  if (connections.length === 0) return null;
  return (
    <section>
      <div className="panel-label">Connected</div>
      <div className="panel-chips">
        {connections.map((c) => (
          <button
            key={c.entity.id}
            type="button"
            className={`panel-chip is-${c.type}`}
            onClick={() => (c.type === 'system' ? open(c.entity.id) : select(c.entity.id))}
          >
            {entityLabel(c)}
          </button>
        ))}
      </div>
    </section>
  );
}
