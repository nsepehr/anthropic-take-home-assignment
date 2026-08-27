import type { Intent } from '@app/shared';
import { useViewMode } from '../../state/viewMode';
import { ProvenanceDot } from '../../components';
import { useCardState } from './components/useCardState';

/** One intent in a list: accent surface, statement, provenance, summary|rationale per view mode. */
export function IntentCard({ intent }: { intent: Intent }) {
  const { mode } = useViewMode();
  const card = useCardState(intent.id);
  return (
    <button type="button" {...card} className={`${card.className} panel-card-intent`}>
      <div className="panel-card-row">
        <span className="panel-card-title">{intent.statement}</span>
        <ProvenanceDot source={intent.provenance.source} className="panel-dot" />
      </div>
      <div className="panel-card-body">
        {mode === 'deepDive' ? intent.rationale : intent.summary}
      </div>
    </button>
  );
}
