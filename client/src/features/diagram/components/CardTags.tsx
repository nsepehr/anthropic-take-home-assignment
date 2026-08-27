import type { Provenance, System } from '@app/shared';

interface Props {
  kind: System['kind'];
  requirementCount: number;
  intentCount: number;
  provenance: Provenance['source'];
}

/** The `kind · N req · N why · Verified/AI` row at the foot of a system card. */
export function CardTags({ kind, requirementCount, intentCount, provenance }: Props) {
  const human = provenance === 'human-verified';
  return (
    <div className="diagram-card__tags">
      <span className="tag tag-neutral">{kind}</span>
      <span className="tag tag-neutral">{`${requirementCount} req`}</span>
      <span className="tag tag-accent">{`${intentCount} why`}</span>
      <span className={`tag ${human ? 'tag-accent-2' : 'tag-outline'}`}>
        {human ? 'Verified' : 'AI'}
      </span>
    </div>
  );
}
