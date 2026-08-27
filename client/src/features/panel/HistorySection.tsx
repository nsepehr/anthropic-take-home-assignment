import { useMemo, useState } from 'react';
import { historyFor, type HistoryEntry } from '@app/shared';
import { useProject } from '../../state/projectStore';
import { Button } from '../../components';

/** Requirement title or intent statement — the one line that says what the entry asked for. */
function headline(entity: HistoryEntry['entity']): string {
  return 'title' in entity ? entity.title : entity.statement;
}

/** "Replaced by: …" for a superseded entry; otherwise the author's one-line reason. */
function note(entry: HistoryEntry): string | null {
  if (entry.replacedBy) return `Replaced by: ${headline(entry.replacedBy)}`;
  return entry.reason ?? null;
}

function Item({ entry }: { entry: HistoryEntry }) {
  const superseded = entry.state === 'superseded';
  const line = note(entry);
  return (
    <article className="panel-history-item">
      <div className="panel-history-head">
        <span className={`panel-history-pill is-${entry.state}`}>
          {superseded ? 'Superseded' : 'Withdrawn'}
        </span>
        <span className="panel-history-class">
          {entry.kind === 'requirement' ? 'Requirement' : 'Intent'}
        </span>
        <span className="panel-history-date">{entry.since.slice(0, 10)}</span>
      </div>
      <div className="panel-history-title">{headline(entry.entity)}</div>
      {line && <div className="panel-history-note">{line}</div>}
    </article>
  );
}

interface Props {
  systemId: string;
  /** Start open (tests); the UI always starts closed. */
  defaultOpen?: boolean;
}

/**
 * What this system used to ask for: its superseded and withdrawn requirements and intents, hidden
 * behind one control and rendered visibly old. Nothing here appears in the lists above — the store
 * hands those the current entries only — so this reads `fullProject`. Absent when there is none.
 */
export function HistorySection({ systemId, defaultOpen = false }: Props) {
  const { fullProject } = useProject();
  const [open, setOpen] = useState(defaultOpen);
  const history = useMemo(
    () => (fullProject ? historyFor(fullProject, systemId) : []),
    [fullProject, systemId],
  );
  if (history.length === 0) return null;
  return (
    <section className="panel-history">
      <Button
        variant="ghost"
        className="panel-history-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide history' : `Show history (${history.length})`}
      </Button>
      {open && (
        <div className="panel-history-list">
          {history.map((entry) => (
            <Item key={entry.entity.id} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}
