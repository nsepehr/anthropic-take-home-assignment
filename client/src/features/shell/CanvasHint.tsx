import { Button } from '../../components';
import { hintFor } from '../../model/hints';
import { useFirstRun } from '../../state/firstRun';
import { useNavigation } from '../../state/navigation';

/**
 * Bottom-left of the canvas: a dismissible coach-mark the first time each level is seen, then
 * the one-line hint.
 */
export function CanvasHint() {
  const { scope } = useNavigation();
  const { done, dismiss } = useFirstRun();
  const hint = hintFor(scope.level, done);
  if (hint.kind === 'hint') return <div className="canvas-hint">{hint.text}</div>;
  return (
    <div className="canvas-coach" role="note">
      <span>{hint.text}</span>
      <Button variant="ghost" onClick={() => dismiss(scope.level)}>
        Got it
      </Button>
    </div>
  );
}
