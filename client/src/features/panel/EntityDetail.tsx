import { connectionsFor, findEntity, intentsFor, requirementsFor } from '../../model/entities';
import { useProject } from '../../state/projectStore';
import { useSelection } from '../../state/selection';
import { ConnectedChips } from './ConnectedChips';
import { DetailCard } from './DetailCard';
import { EntityList } from './EntityList';
import { IntentCard } from './IntentCard';
import { RequirementCard } from './RequirementCard';

/** The panel with something selected: headline card, its requirements/intents, connections. */
export function EntityDetail() {
  const { project } = useProject();
  const { selectedId } = useSelection();
  if (!project || !selectedId) return null;
  const found = findEntity(project, selectedId);
  if (!found) return <div className="panel-empty">Unknown entity: {selectedId}</div>;
  const requirements = requirementsFor(project, selectedId);
  const intents = intentsFor(project, selectedId);
  return (
    <div className="panel">
      <DetailCard found={found} />
      {found.type !== 'requirement' && (
        <EntityList
          heading={found.type === 'system' ? 'Requirements' : 'Requirements it serves'}
          count={requirements.length}
        >
          {requirements.map((r) => (
            <RequirementCard key={r.id} requirement={r} />
          ))}
        </EntityList>
      )}
      {found.type !== 'intent' && (
        <EntityList
          heading={found.type === 'system' ? 'Why it is built this way' : 'Intents'}
          count={intents.length}
        >
          {intents.map((i) => (
            <IntentCard key={i.id} intent={i} />
          ))}
        </EntityList>
      )}
      <ConnectedChips connections={connectionsFor(project, selectedId)} />
    </div>
  );
}
