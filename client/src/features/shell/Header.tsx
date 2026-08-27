import { ProvenanceDot } from '../../components';
import { useProject } from '../../state/projectStore';
import { Trail } from './Trail';

/** Project name, the trail, and the provenance legend. */
export function Header() {
  const { project } = useProject();
  return (
    <header className="shell-header">
      <div className="shell-header-name">{project?.name}</div>
      {project && <Trail />}
      <div className="shell-header-tools">
        <div className="shell-legend" aria-label="Provenance legend">
          <ProvenanceDot source="human-verified" />
          <span>Verified human-checked</span>
          <ProvenanceDot source="ai-inferred" />
          <span>AI inferred</span>
        </div>
      </div>
    </header>
  );
}
