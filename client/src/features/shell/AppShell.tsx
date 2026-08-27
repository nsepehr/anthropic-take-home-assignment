import type { ReactNode } from 'react';
import type { Project } from '@app/shared';
import { useProject } from '../../state/projectStore';
import { CanvasFrame } from './CanvasFrame';
import { Header } from './Header';
import { SidePanel, type SidePanelProps } from './SidePanel';
import { Subline } from './Subline';
import './shell.css';

export interface AppShellProps extends SidePanelProps {
  /** Renders the diagram once the project has loaded. */
  canvas: (project: Project) => ReactNode;
}

/** Single-screen frame: header + subline, then canvas + right panel. 100vh; only the panel scrolls. */
export function AppShell({ canvas, overview, detail }: AppShellProps) {
  const { loading, error, project } = useProject();
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
            <SidePanel overview={overview} detail={detail} />
          </>
        )}
      </div>
    </div>
  );
}
