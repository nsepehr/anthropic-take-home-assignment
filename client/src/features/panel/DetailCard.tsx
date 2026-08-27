import { useState } from 'react';
import type { FoundEntity } from '../../model/entities';
import { entityLabel } from '../../model/entities';
import { useNavigation } from '../../state/navigation';
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

interface Props {
  found: FoundEntity;
  /** Start expanded (tests); the UI always starts collapsed. */
  defaultExpanded?: boolean;
}

/**
 * The headline card of the selected entity: what it is, who vouches for it, and a per-item
 * "Deep dive" toggle. Expanded state is local, so it resets when SidePanel remounts on selection.
 * "Back" walks the trail one hop (to the previous system, or the atlas).
 */
export function DetailCard({ found, defaultExpanded = false }: Props) {
  const { back } = useNavigation();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { provenance } = found.entity;
  const human = provenance.source === 'human-verified';
  return (
    <article className="panel-detail">
      <div className="panel-detail-head">
        <span className="card-kicker">{kicker(found)}</span>
        <Button variant="ghost" onClick={back}>
          Back
        </Button>
      </div>
      <h2 className="panel-detail-title">{entityLabel(found)}</h2>
      <div className="panel-detail-summary">{found.entity.summary}</div>
      <Button
        className="panel-deep-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? 'Hide deep dive' : 'Deep dive'}
      </Button>
      {expanded && <DeepSection found={found} />}
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
