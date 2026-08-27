import type { Requirement } from '@app/shared';
import { MentionButton, StatusDot, Tag } from '../../components';
import { useMention } from '../../state/chat';
import { useCardState } from './components/useCardState';

function ProvenancePill({ source }: { source: Requirement['provenance']['source'] }) {
  const human = source === 'human-verified';
  return (
    <Tag className={human ? 'tag-prov-human' : 'tag-prov-ai'}>{human ? 'Verified' : 'AI'}</Tag>
  );
}

/** One requirement in a list: status, title, one-line summary, status/kind/provenance pills. */
export function RequirementCard({ requirement }: { requirement: Requirement }) {
  const card = useCardState(requirement.id);
  const mention = useMention({ type: 'requirement', entity: requirement });
  return (
    <button type="button" {...card}>
      <div className="panel-card-row">
        <StatusDot status={requirement.status} className="panel-status" />
        <span className="panel-card-title">{requirement.title}</span>
        <MentionButton {...mention} />
      </div>
      <div className="panel-card-body">{requirement.summary}</div>
      <div className="panel-card-tags">
        <Tag className={`tag-status-${requirement.status}`}>{requirement.status}</Tag>
        <Tag className={`tag-kind${requirement.kind === 'feature' ? ' tag-kind-feature' : ''}`}>
          {requirement.kind}
        </Tag>
        <ProvenancePill source={requirement.provenance.source} />
      </div>
    </button>
  );
}
