import type { ReactNode } from 'react';

interface Props {
  heading: string;
  count: number;
  children: ReactNode;
}

/** A titled list section: heading + count, the cards, or "Nothing recorded yet." */
export function EntityList({ heading, count, children }: Props) {
  return (
    <section>
      <div className="panel-list-head">
        <h3 className="panel-list-heading">{heading}</h3>
        <span className="panel-list-count text-muted">{count}</span>
      </div>
      <div className="panel-list-items">
        {count === 0 ? <div className="panel-empty">Nothing recorded yet.</div> : children}
      </div>
    </section>
  );
}
