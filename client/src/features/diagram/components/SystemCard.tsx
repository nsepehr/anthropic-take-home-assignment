import type { System } from '@app/shared';
import { KindDot } from '../../../components';
import type { ElementState } from '../cardState';
import { CardTags } from './CardTags';

interface Props {
  system: System;
  requirementCount: number;
  intentCount: number;
  state: ElementState;
  /** The focus view's centre card: larger, on the accent surface. */
  focus?: boolean;
}

/** The designed system card: kind dot + name, one-line summary, tag row. */
export function SystemCard({ system, requirementCount, intentCount, state, focus }: Props) {
  return (
    <div className={`diagram-card is-${state}${focus ? ' diagram-card--focus' : ''}`}>
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
