import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '../../components';
import { mentionQuery, type Mentionable } from '../../model/chatScope';
import { useChat } from '../../state/chat';
import { MentionMenu } from './MentionMenu';
import { ScopeChip } from './ScopeChip';

const PLACEHOLDER = '@requirement or @intent, then what should change…';

/** Scope chips, the `@` menu and the input. Enter sends, Esc closes the menu, Backspace unchips. */
export function Composer() {
  const chat = useChat();
  const { draft, mentions, matches, focusNonce, open } = chat;
  const [dismissed, setDismissed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, focusNonce]);

  const query = mentionQuery(draft);
  const rows = query === null ? [] : matches(query);
  const menuOpen = query !== null && !dismissed;

  const type = (value: string) => {
    setDismissed(false);
    chat.setDraft(value);
  };
  const pick = (mention: Mentionable) => {
    setDismissed(false);
    chat.addMention(mention);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const first = menuOpen ? rows[0] : undefined;
      if (first) pick(first);
      else chat.send();
    } else if (e.key === 'Escape') {
      e.stopPropagation(); // Esc belongs to the menu here, not to the canvas trail
      setDismissed(true);
    } else if (e.key === 'Backspace' && draft === '') {
      chat.removeLastMention();
    }
  };

  return (
    <div className="chat-composer">
      {menuOpen && <MentionMenu rows={rows} onPick={pick} />}
      {mentions.length > 0 && (
        <div className="chat-chips">
          {mentions.map((mention) => (
            <ScopeChip key={mention.id} mention={mention} onRemove={chat.removeMention} />
          ))}
        </div>
      )}
      <div className="chat-input-row">
        <input
          ref={inputRef}
          className="chat-input"
          value={draft}
          placeholder={PLACEHOLDER}
          aria-label="Ask Claude about the parts in scope"
          onChange={(e) => type(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button variant="primary" icon title="Send" aria-label="Send" onClick={chat.send}>
          <SendArrow />
        </Button>
      </div>
    </div>
  );
}

function SendArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
