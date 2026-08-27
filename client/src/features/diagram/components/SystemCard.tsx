import type { System } from '@app/shared';
import type { ScopeState } from '../../../model/chatScope';
import { KindDot } from '../../../components';
import { useSearch } from '../../../state/search';
import type { ElementState } from '../cardState';
import { CardTags } from './CardTags';

interface Props {
  system: System;
  requirementCount: number;
  intentCount: number;
  state: ElementState;
  /** Whether the chat scope resolves to this system; rings it and dims everything else. */
  scope?: ScopeState;
  /** The focus view's centre card: larger, on the accent surface. */
  focus?: boolean;
  /** Shows the hover-revealed "Open" affordance; clicking it never selects the card. */
  onOpen?: () => void;
}

/** The designed system card: kind dot + name, one-line summary, tag row. */
export function SystemCard({
  system,
  requirementCount,
  intentCount,
  state,
  scope = 'none',
  focus,
  onOpen,
}: Props) {
  const scopeClass = scope === 'none' ? '' : ` is-${scope === 'in' ? 'in' : 'out-of'}-scope`;
  const search = useSearch().matchClass(system.id);
  return (
    <div
      className={`diagram-card is-${state}${focus ? ' diagram-card--focus' : ''}${scopeClass}${search}`}
    >
      <div className="diagram-card__title">
        <KindDot kind={system.kind} />
        <span className="diagram-card__name">{system.name}</span>
        {onOpen && (
          <button
            type="button"
            className="diagram-card__open"
            title="Open this system's own view"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            Open ›
          </button>
        )}
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
