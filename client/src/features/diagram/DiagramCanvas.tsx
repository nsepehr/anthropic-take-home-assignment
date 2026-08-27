import type { Project } from '@app/shared';
import { scopeKey } from '../../model/scope';
import { useNavigation } from '../../state/navigation';
import { AtlasCanvas } from './AtlasCanvas';
import { FocusCanvas } from './FocusCanvas';
import './diagram.css';

/**
 * The canvas for the current scope: the atlas, or one system's focus view. Keyed by scope so
 * each level mounts fresh (fitted, faded in) instead of animating between layouts.
 */
export function DiagramCanvas({ project }: { project: Project }) {
  const { scope } = useNavigation();
  return (
    <div key={scopeKey(scope)} className="diagram-level">
      {scope.level === 'atlas' ? (
        <AtlasCanvas project={project} />
      ) : (
        <FocusCanvas project={project} systemId={scope.id} />
      )}
    </div>
  );
}
