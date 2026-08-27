import { DiagramCanvas } from './features/diagram';
import { EntityDetail, ProjectOverview } from './features/panel';
import { AppShell } from './features/shell';
import { ProjectProvider } from './state/projectStore';
import { SelectionProvider } from './state/selection';

/** Composition root: providers + the shell with its slots. No logic here. */
export function App() {
  return (
    <ProjectProvider>
      <SelectionProvider>
        <AppShell
          canvas={(project) => <DiagramCanvas project={project} />}
          overview={<ProjectOverview />}
          detail={<EntityDetail />}
        />
      </SelectionProvider>
    </ProjectProvider>
  );
}
