import { Dot } from '../../components';
import type { Mentionable } from '../../model/chatScope';

const KIND_LABEL: Record<Mentionable['kind'], string> = {
  system: 'SYSTEM',
  requirement: 'REQUIREMENT',
  intent: 'INTENT',
};

interface Props {
  rows: Mentionable[];
  onPick: (mention: Mentionable) => void;
}

/** The `@` menu: up to seven matches, the first one being what Enter picks. */
export function MentionMenu({ rows, onPick }: Props) {
  return (
    <div className="chat-menu" role="listbox" aria-label="Mentionable parts">
      {rows.length === 0 ? (
        <p className="chat-menu-empty">Nothing by that name.</p>
      ) : (
        rows.map((mention, i) => (
          <button
            key={mention.id}
            type="button"
            role="option"
            aria-selected={i === 0}
            className={`chat-menu-row${i === 0 ? ' is-first' : ''}`}
            // mousedown, not click: the input must not lose focus before the pick lands.
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(mention);
            }}
          >
            <Dot token={mention.dotVar} />
            <span className="chat-menu-label">{mention.label}</span>
            <span className="chat-menu-kind">{KIND_LABEL[mention.kind]}</span>
          </button>
        ))
      )}
    </div>
  );
}
