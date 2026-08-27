import type { Provenance, System } from '@app/shared';
import { Tag } from '../../../components';

interface Props {
  kind: System['kind'];
  requirementCount: number;
  intentCount: number;
  provenance: Provenance['source'];
}

/** The `kind · N req · N why · Verified/AI` row at the foot of a system card; zero counts are omitted. */
export function CardTags({ kind, requirementCount, intentCount, provenance }: Props) {
  const human = provenance === 'human-verified';
  return (
    <div className="diagram-card__tags">
      <Tag variant="card-kind">{kind}</Tag>
      {requirementCount > 0 && <Tag variant="card-req">{`${requirementCount} req`}</Tag>}
      {intentCount > 0 && <Tag variant="card-why">{`${intentCount} why`}</Tag>}
      <Tag variant={human ? 'card-verified' : 'card-ai'}>{human ? 'Verified' : 'AI'}</Tag>
    </div>
  );
}
