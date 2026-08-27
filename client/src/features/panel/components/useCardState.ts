import { useSelection } from '../../../state/selection';

/** Class names for a list card so it dims/rings with the app-wide selection, plus its click. */
export function useCardState(id: string) {
  const { selectedId, isDimmed, select } = useSelection();
  const className = ['panel-card', selectedId === id && 'is-selected', isDimmed(id) && 'is-dimmed']
    .filter(Boolean)
    .join(' ');
  return { className, onClick: () => select(id) };
}
