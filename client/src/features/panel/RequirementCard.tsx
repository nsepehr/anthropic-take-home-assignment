import type { Requirement } from '@app/shared';
import { ProvenanceDot, StatusDot, Tag } from '../../components';
import { useCardState } from './components/useCardState';

/** One requirement in a list: status, title, provenance, one-line summary, tags. */
export function RequirementCard({ requirement }: { requirement: Requirement }) {
  const card = useCardState(requirement.id);
  return (
    <button type="button" {...card}>
      <div className="panel-card-row">
        <StatusDot status={requirement.status} className="panel-status" />
        <span className="panel-card-title">{requirement.title}</span>
        <ProvenanceDot source={requirement.provenance.source} className="panel-dot" />
      </div>
      <div className="panel-card-body">{requirement.summary}</div>
      <div className="panel-card-tags">
        <Tag className={`tag-status-${requirement.status}`}>{requirement.status}</Tag>
        <Tag className="tag-kind">{requirement.kind}</Tag>
      </div>
    </button>
  );
}
