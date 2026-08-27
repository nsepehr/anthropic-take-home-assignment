import { ProvenanceDot } from '../../components';
import { useProject } from '../../state/projectStore';

/** Project name + mission and the provenance legend. */
export function Header() {
  const { project } = useProject();
  return (
    <header className="shell-header">
      <div>
        <div className="shell-header-name">{project?.name}</div>
        <div className="shell-header-mission">{project?.mission}</div>
      </div>
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
