import type { System } from '@app/shared';
import { KindDot } from '../../../components';
import type { ViewMode } from '../../../state/viewMode';
import type { ElementState } from '../cardState';
import { CardTags } from './CardTags';

interface Props {
  system: System;
  requirementCount: number;
  intentCount: number;
  mode: ViewMode;
  state: ElementState;
}

/** The designed system card: kind dot + name, summary/detail per view mode, tag row. */
export function SystemCard({ system, requirementCount, intentCount, mode, state }: Props) {
  return (
    <div className={`diagram-card is-${state}`}>
      <div className="diagram-card__title">
        <KindDot kind={system.kind} />
        <span className="diagram-card__name">{system.name}</span>
      </div>
      <div className={`diagram-card__body is-${mode}`}>
        {mode === 'deepDive' ? system.detail : system.summary}
      </div>
      <CardTags
        kind={system.kind}
        requirementCount={requirementCount}
        intentCount={intentCount}
        provenance={system.provenance.source}
      />
    </div>
  );
}
