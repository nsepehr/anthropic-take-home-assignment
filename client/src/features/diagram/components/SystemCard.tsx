import type { System } from '@app/shared';
import { KindDot } from '../../../components';
import type { ElementState } from '../cardState';
import { CardTags } from './CardTags';

interface Props {
  system: System;
  requirementCount: number;
  intentCount: number;
  state: ElementState;
}

/** The designed system card: kind dot + name, one-line summary, tag row. */
export function SystemCard({ system, requirementCount, intentCount, state }: Props) {
  return (
    <div className={`diagram-card is-${state}`}>
      <div className="diagram-card__title">
        <KindDot kind={system.kind} />
        <span className="diagram-card__name">{system.name}</span>
      </div>
      <div className="diagram-card__body">{system.summary}</div>
      <CardTags
        kind={system.kind}
        requirementCount={requirementCount}
        intentCount={intentCount}
        provenance={system.provenance.source}
      />
    </div>
  );
}
