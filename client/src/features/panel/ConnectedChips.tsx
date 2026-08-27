import type { FoundEntity } from '../../model/entities';
import { entityLabel } from '../../model/entities';
import { useSelection } from '../../state/selection';

/** Pills for every entity linked to the selection; clicking one re-centers the panel on it. */
export function ConnectedChips({ connections }: { connections: FoundEntity[] }) {
  const { select } = useSelection();
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
            onClick={() => select(c.entity.id)}
          >
            {entityLabel(c)}
          </button>
        ))}
      </div>
    </section>
  );
}
