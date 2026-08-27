import { useSelection } from '../../../state/selection';
import { useViewMode } from '../../../state/viewMode';

/** Plain-text readout of the selection closure and the view-mode toggle. */
export function DebugSelectionText() {
  const { selectedId, related } = useSelection();
  const { mode, toggle } = useViewMode();
  return (
    <section style={{ fontFamily: 'monospace', fontSize: 13 }}>
      <p>
        view mode: <strong>{mode}</strong> <button onClick={toggle}>toggle</button>
      </p>
      <p>selected: {selectedId ?? '(none)'}</p>
      <ul>
        {(Object.keys(related) as (keyof typeof related)[]).map((key) => (
          <li key={key}>
            {key}: {related[key].join(', ') || '—'}
          </li>
        ))}
      </ul>
    </section>
  );
}
