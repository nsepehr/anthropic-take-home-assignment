import type { Intent } from '@app/shared';
import { Tag } from '../../components';
import { useCardState } from './components/useCardState';

/** One intent in a list: accent surface, statement, one-line summary, provenance + date pills. */
export function IntentCard({ intent }: { intent: Intent }) {
  const card = useCardState(intent.id);
  const human = intent.provenance.source === 'human-verified';
  return (
    <button type="button" {...card} className={`${card.className} panel-card-intent`}>
      <div className="panel-card-row">
        <span className="panel-card-title">{intent.statement}</span>
      </div>
      <div className="panel-card-body">{intent.summary}</div>
      <div className="panel-card-tags">
        <Tag variant={human ? 'accent-2' : 'outline'}>{human ? 'Verified' : 'AI'}</Tag>
        <Tag>{intent.provenance.capturedAt.slice(0, 10)}</Tag>
      </div>
    </button>
  );
}
