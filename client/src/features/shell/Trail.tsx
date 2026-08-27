import { Fragment } from 'react';
import { scopeKey } from '../../model/scope';
import { useNavigation } from '../../state/navigation';

/** `Architecture / hop / hop / current` in the header; every crumb jumps to that scope. */
export function Trail() {
  const { breadcrumb, goTo } = useNavigation();
  const last = breadcrumb.length - 1;
  return (
    <nav className="shell-trail" aria-label="Trail">
      {breadcrumb.map((crumb, i) => (
        <Fragment key={scopeKey(crumb.scope)}>
          {i > 0 && <span className="shell-trail-sep">/</span>}
          <button
            type="button"
            className={`crumb${i === last ? ' is-current' : ''}`}
            aria-current={i === last ? 'page' : undefined}
            onClick={() => goTo(crumb.scope)}
          >
            {crumb.label}
          </button>
        </Fragment>
      ))}
    </nav>
  );
}
