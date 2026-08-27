import type { FoundEntity } from '../../model/entities';
import { entityLabel } from '../../model/entities';
import { useSelection } from '../../state/selection';
import { useViewMode } from '../../state/viewMode';
import { DeepSection } from './components/DeepSection';
import { Button, ProvenanceDot } from '../../components';

function kicker(found: FoundEntity): string {
  switch (found.type) {
    case 'system':
      return `System · ${found.entity.kind}`;
    case 'requirement':
      return `Requirement · ${found.entity.kind} · ${found.entity.status}`;
    case 'intent':
      return 'Intent · decision';
  }
}

/** The headline card of the selected entity: what it is, how it works, who vouches for it. */
export function DetailCard({ found }: { found: FoundEntity }) {
  const { clear } = useSelection();
  const { mode } = useViewMode();
  const { provenance } = found.entity;
  const human = provenance.source === 'human-verified';
  return (
    <article className="panel-detail">
      <div className="panel-detail-head">
        <span className="card-kicker">{kicker(found)}</span>
        <Button variant="ghost" onClick={clear}>
          Close
        </Button>
      </div>
      <h2 className="panel-detail-title">{entityLabel(found)}</h2>
      <div className="panel-detail-summary">{found.entity.summary}</div>
      {mode === 'deepDive' && <DeepSection found={found} />}
      <div className="panel-provenance">
        <ProvenanceDot source={provenance.source} />
        {human ? 'Human-verified' : 'AI-inferred'} · {provenance.capturedAt.slice(0, 10)}
      </div>
      {found.type === 'system' && found.entity.paths.length > 0 && (
        <div className="panel-paths">
          {found.entity.paths.map((p) => (
            <span key={p} className="panel-path">
              {p}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
