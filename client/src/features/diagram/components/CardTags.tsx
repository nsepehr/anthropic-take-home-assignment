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
      <Tag>{kind}</Tag>
      {requirementCount > 0 && <Tag>{`${requirementCount} req`}</Tag>}
      {intentCount > 0 && <Tag variant="accent">{`${intentCount} why`}</Tag>}
      <Tag variant={human ? 'accent-2' : 'outline'}>{human ? 'Verified' : 'AI'}</Tag>
    </div>
  );
}
