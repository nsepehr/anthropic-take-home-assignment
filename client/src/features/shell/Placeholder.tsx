import { useSelection } from '../../state/selection';

/** Stand-ins for the panel slots until the panel content tasks land. */
export function OverviewPlaceholder() {
  return <p>overview</p>;
}

export function DetailPlaceholder() {
  const { selectedId } = useSelection();
  return <p>detail: {selectedId}</p>;
}
