import { useChat } from '../../state/chat';
import { ScopeChip } from './ScopeChip';

const EMPTY_TEXT =
  'Type @ to point me at a system, requirement or intent, then say what should change. I explain that part, draft the edit, and write it only when you apply.';

const EXAMPLES = [
  'Explain what this part does and what depends on it',
  'What would break if I changed it?',
];

/** The conversation: the empty-state pitch with two starters, then the bubbles. */
export function Thread() {
  const { messages, setDraft } = useChat();
  if (messages.length === 0) {
    return (
      <div className="chat-thread sb">
        <div className="chat-empty">
          <p className="chat-empty-text">{EMPTY_TEXT}</p>
          <div className="chat-examples">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className="chat-example"
                onClick={() => setDraft(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="chat-thread sb">
      {messages.map((message) => (
        <div key={message.id} className={`chat-turn is-${message.role}`}>
          {message.mentions.length > 0 && (
            <div className="chat-turn-chips">
              {message.mentions.map((mention) => (
                <ScopeChip key={mention.id} mention={mention} />
              ))}
            </div>
          )}
          {message.text && <p className="chat-bubble">{message.text}</p>}
        </div>
      ))}
    </div>
  );
}
