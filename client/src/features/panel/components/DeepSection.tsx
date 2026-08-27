import type { ReactNode } from 'react';
import { entityLabel, findEntity, type FoundEntity } from '../../../model/entities';
import { useProject } from '../../../state/projectStore';
import { useSelection } from '../../../state/selection';
import { Paragraphs } from './Paragraphs';

/**
 * The deep-dive part of the headline card: "How it works" for a system, "Evidence" for a
 * requirement, "Rationale" (+ "Superseded by") for an intent.
 */
export function DeepSection({ found }: { found: FoundEntity }) {
  return <div className="panel-deep">{body(found)}</div>;
}

function body(found: FoundEntity): ReactNode {
  switch (found.type) {
    case 'system':
      return <Block label="How it works" text={found.entity.detail} />;
    case 'requirement':
      return (
        <Block label="Evidence" text={found.entity.detail}>
          {found.entity.evidence.length > 0 && (
            <ul className="panel-evidence">
              {found.entity.evidence.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </Block>
      );
    case 'intent':
      return (
        <>
          <Block label="Rationale" text={found.entity.rationale} />
          {found.entity.status === 'superseded' && found.entity.supersededBy && (
            <SupersededBy id={found.entity.supersededBy} />
          )}
        </>
      );
  }
}

function Block({ label, text, children }: { label: string; text: string; children?: ReactNode }) {
  return (
    <div>
      <div className="panel-label">{label}</div>
      <Paragraphs className="panel-text" text={text} />
      {children}
    </div>
  );
}

function SupersededBy({ id }: { id: string }) {
  const { project } = useProject();
  const { select } = useSelection();
  const target = project ? findEntity(project, id) : null;
  return (
    <div>
      <div className="panel-label">Superseded by</div>
      <button type="button" className="panel-link" onClick={() => select(id)}>
        {target ? entityLabel(target) : id}
      </button>
    </div>
  );
}
