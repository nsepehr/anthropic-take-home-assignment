import { useSearch } from '../../state/search';
import './search.css';

/** The header's search pill: types into the shared query, Esc clears, "N matches" while running. */
export function SearchBox() {
  const { query, setQuery, active, count } = useSearch();
  return (
    <div className="shell-search">
      <input
        type="search"
        className="input"
        value={query}
        aria-label="Search the model"
        placeholder="Search systems, requirements, intents…"
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          // Stops here so Esc clears the search instead of walking the trail back a hop.
          if (e.key === 'Escape') {
            e.stopPropagation();
            setQuery('');
          }
        }}
      />
      {active && (
        <span className="shell-search-hint text-muted">{`${count} ${count === 1 ? 'match' : 'matches'}`}</span>
      )}
    </div>
  );
}
