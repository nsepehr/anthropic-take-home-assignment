import { Children, useState, type ReactNode } from 'react';
import { Button } from '../../components';

interface Props {
  heading: string;
  count: number;
  children: ReactNode;
  /** Show at most this many items until "Show N more" is clicked. */
  collapseAfter?: number;
  /** Start expanded (tests); the UI always starts collapsed. */
  defaultExpanded?: boolean;
}

/** A titled list section: heading + count, the cards, or "Nothing recorded yet." */
export function EntityList({
  heading,
  count,
  children,
  collapseAfter = 5,
  defaultExpanded = false,
}: Props) {
  return (
    <section>
      <div className="panel-list-head">
        <h3 className="panel-list-heading">{heading}</h3>
        <span className="panel-list-count text-muted">{count}</span>
      </div>
      <div className="panel-list-items">
        {count === 0 ? (
          <div className="panel-empty">Nothing recorded yet.</div>
        ) : (
          // Keyed so the expanded state resets when the list's identity changes.
          <CollapsibleItems
            key={`${heading}:${count}`}
            collapseAfter={collapseAfter}
            defaultExpanded={defaultExpanded}
          >
            {children}
          </CollapsibleItems>
        )}
      </div>
    </section>
  );
}

type ItemsProps = Required<Pick<Props, 'children' | 'collapseAfter' | 'defaultExpanded'>>;

function CollapsibleItems({ children, collapseAfter, defaultExpanded }: ItemsProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const items = Children.toArray(children);
  const hidden = items.length - collapseAfter;
  if (hidden <= 0) return <>{items}</>;
  return (
    <>
      {expanded ? items : items.slice(0, collapseAfter)}
      <Button
        variant="ghost"
        className="panel-list-more"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? 'Show less' : `Show ${hidden} more`}
      </Button>
    </>
  );
}
