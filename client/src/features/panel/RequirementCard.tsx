import type { Requirement } from '@app/shared';
import { useViewMode } from '../../state/viewMode';
import { ProvenanceDot, StatusDot, Tag, type TagVariant } from '../../components';
import { useCardState } from './components/useCardState';

const STATUS_TAG: Record<Requirement['status'], TagVariant> = {
  implemented: 'accent-2',
  partial: 'accent',
  planned: 'neutral',
};

/** One requirement in a list: status, title, provenance, summary|detail per view mode, tags. */
export function RequirementCard({ requirement }: { requirement: Requirement }) {
  const { mode } = useViewMode();
  const card = useCardState(requirement.id);
  return (
    <button type="button" {...card}>
      <div className="panel-card-row">
        <StatusDot status={requirement.status} className="panel-status" />
        <span className="panel-card-title">{requirement.title}</span>
        <ProvenanceDot source={requirement.provenance.source} className="panel-dot" />
      </div>
      <div className="panel-card-body">
        {mode === 'deepDive' ? requirement.detail : requirement.summary}
      </div>
      <div className="panel-card-tags">
        <Tag variant={STATUS_TAG[requirement.status]}>{requirement.status}</Tag>
        <Tag>{requirement.kind}</Tag>
      </div>
    </button>
  );
}
