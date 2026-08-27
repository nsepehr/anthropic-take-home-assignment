import { Dot } from '../../components';
import { shortLabel, type Mentionable } from '../../model/chatScope';

interface Props {
  mention: Mentionable;
  /** Omitted on the chips above a sent message: those are a record, not a control. */
  onRemove?: (id: string) => void;
}

/** One thing in scope: `@label` with a dot, and an × while it can still be dropped. */
export function ScopeChip({ mention, onRemove }: Props) {
  return (
    <span className="chat-chip" title={mention.label}>
      <Dot token={mention.dotVar} className="chat-chip-dot" />
      {`@${shortLabel(mention.label)}`}
      {onRemove && (
        <button
          type="button"
          className="chat-chip-x"
          aria-label={`Remove ${mention.label} from the chat scope`}
          onClick={() => onRemove(mention.id)}
        >
          ×
        </button>
      )}
    </span>
  );
}
