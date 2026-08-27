import type { Requirement } from '@app/shared';
import { StatusDot, Tag } from '../../components';
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
  return (
    <button type="button" {...card}>
      <div className="panel-card-row">
        <StatusDot status={requirement.status} className="panel-status" />
        <span className="panel-card-title">{requirement.title}</span>
      </div>
      <div className="panel-card-body">{requirement.summary}</div>
      <div className="panel-card-tags">
        <Tag className={`tag-status-${requirement.status}`}>{requirement.status}</Tag>
        <Tag className="tag-kind">{requirement.kind}</Tag>
        <ProvenancePill source={requirement.provenance.source} />
      </div>
    </button>
  );
}
