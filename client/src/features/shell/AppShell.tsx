import type { ReactNode } from 'react';
import type { Project } from '@app/shared';
import { useNavigation } from '../../state/navigation';
import { useProject } from '../../state/projectStore';
import { CanvasFrame } from './CanvasFrame';
import { Header } from './Header';
import { SidePanel } from './SidePanel';
import { Subline } from './Subline';
import './shell.css';

export interface AppShellProps {
  /** Renders the diagram once the project has loaded. */
  canvas: (project: Project) => ReactNode;
  /** The right panel's content; shown only in a system focus view. */
  detail: ReactNode;
}

/**
 * Single-screen frame: header + subline, then the canvas — full width on the atlas, with the
 * right panel beside it once a system is open. 100vh; only the panel scrolls.
 */
export function AppShell({ canvas, detail }: AppShellProps) {
  const { loading, error, project } = useProject();
  const { scope } = useNavigation();
  return (
    <div className="shell">
      <Header />
      <Subline />
      <div className="shell-body">
        {loading && <p className="shell-status">Loading project…</p>}
        {error && <p className="shell-status">Could not load project: {error}</p>}
        {project && (
          <>
            <CanvasFrame>{canvas(project)}</CanvasFrame>
            {scope.level === 'system' && <SidePanel>{detail}</SidePanel>}
          </>
        )}
      </div>
    </div>
  );
}
