import { useState } from 'react';
import type { FoundEntity } from '../../model/entities';
import { entityLabel } from '../../model/entities';
import { panelAction } from '../../model/panelAction';
import { useNavigation } from '../../state/navigation';
import { useMention } from '../../state/chat';
import { useSelection } from '../../state/selection';
import { DeepSection } from './components/DeepSection';
import { Button, MentionButton, ProvenanceDot } from '../../components';

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
 * The action button is Close / Clear / Back per `panelAction`; a system that is not the current
 * focus also offers "Open" into its own view. The title row keeps a trailing slot for later
 * controls (locks).
 */
export function DetailCard({ found, defaultExpanded = false }: Props) {
  const { scope, back, open } = useNavigation();
  const { selectedId, clear } = useSelection();
  const action = panelAction(scope, selectedId);
  const openable =
    found.type === 'system' && !(scope.level === 'system' && scope.id === found.entity.id);
  const mention = useMention(found);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { provenance } = found.entity;
  const human = provenance.source === 'human-verified';
  return (
    <article className="panel-detail">
      <div className="panel-detail-head">
        <span className="card-kicker">{kicker(found)}</span>
        <div className="panel-detail-actions">
          <MentionButton {...mention} large />
          {openable && (
            <Button variant="primary" onClick={() => open(found.entity.id)}>
              Open ›
            </Button>
          )}
          <Button variant="ghost" onClick={action.kind === 'back' ? back : clear}>
            {action.label}
          </Button>
        </div>
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
