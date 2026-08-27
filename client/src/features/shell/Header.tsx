import { ProvenanceDot } from '../../components';
import { useProject } from '../../state/projectStore';
import { useViewMode, type ViewMode } from '../../state/viewMode';

const MODES: { value: ViewMode; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'deepDive', label: 'Deep dive' },
];

/** Project name + mission, the provenance legend, and the global Overview / Deep dive switch. */
export function Header() {
  const { project } = useProject();
  const { mode, setMode } = useViewMode();
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
        <div className="seg" role="radiogroup" aria-label="View mode">
          {MODES.map(({ value, label }) => (
            <label key={value} className="seg-opt">
              <input
                type="radio"
                name="view-mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </header>
  );
}
