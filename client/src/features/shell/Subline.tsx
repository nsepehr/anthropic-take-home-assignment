import { focusView } from '../../model/focusView';
import { useNavigation } from '../../state/navigation';
import { useProject } from '../../state/projectStore';

/** Under the header: the mission on the atlas; where you are in the graph in a focus view. */
export function Subline() {
  const { project } = useProject();
  const { scope } = useNavigation();
  if (!project) return null;
  if (scope.level === 'atlas') return <p className="shell-subline">{project.mission}</p>;
  const connections = focusView(project, scope.id)?.edges.length ?? 0;
  const systems = project.systems.length;
  return (
    <p className="shell-subline">
      {`${systems} systems · ${connections} connections · you are inside one of them`}
    </p>
  );
}
