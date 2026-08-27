import { useChat } from '../../state/chat';
import { Composer } from './Composer';
import { Thread } from './Thread';
import './chat.css';

/** "Ask Claude": a full-width drawer under the canvas that shows what a request resolves to. */
export function ChatDrawer() {
  const { open, toggle, mentions, messages } = useChat();
  return (
    <section className="chat">
      <button type="button" className="chat-head" aria-expanded={open} onClick={toggle}>
        <span className="chat-head-dot" aria-hidden="true" />
        <span className="chat-head-title">Ask Claude</span>
        <span className="chat-head-hint">
          {messages.length > 0
            ? 'Explains a part, then changes it'
            : 'Mention a part with @ and ask for a change'}
        </span>
        <span className="chat-head-scope">
          {mentions.length > 0 ? `${mentions.length} in scope` : 'nothing in scope yet'}
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="chat-body">
          <Thread />
          <Composer />
        </div>
      )}
    </section>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`chat-chevron${open ? ' is-open' : ''}`}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
    >
      <path
        d="M3.5 5.5 7 9l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
