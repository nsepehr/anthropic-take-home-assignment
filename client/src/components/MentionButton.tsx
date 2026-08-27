import type { KeyboardEvent, MouseEvent } from 'react';

export interface MentionButtonProps {
  /** Already tagged: filled instead of outlined, and the click is a no-op repeat. */
  inScope: boolean;
  title: string;
  onClick: () => void;
  /** 30px for the detail card's title row; 24px (default) inside lists. */
  large?: boolean;
}

/**
 * The round "@" that tags an entity into the chat. Rendered as a `role="button"` span because it
 * sits inside cards that are themselves buttons, where a nested `<button>` is invalid HTML.
 */
export function MentionButton({ inScope, title, onClick, large = false }: MentionButtonProps) {
  const classes = ['mention-btn', large && 'mention-btn--lg', inScope && 'is-in-scope']
    .filter(Boolean)
    .join(' ');
  const activate = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick();
  };
  return (
    <span
      className={classes}
      role="button"
      tabIndex={0}
      aria-pressed={inScope}
      title={title}
      aria-label={title}
      onClick={activate}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && activate(e)}
    >
      @
    </span>
  );
}
