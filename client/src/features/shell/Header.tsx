import { Tag } from '../../components';
import { SearchBox } from '../search';
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
        <SearchBox />
        <div className="shell-legend" aria-label="Provenance legend">
          <Tag variant="legend-verified">Verified</Tag>
          <span>human-checked</span>
          <Tag variant="legend-ai">AI</Tag>
          <span>inferred</span>
        </div>
      </div>
    </header>
  );
}
