import { DiagramCanvas } from './features/diagram';
import { LaneLayer } from './features/lanes';
import { EntityDetail, ProjectOverview } from './features/panel';
import { AppShell } from './features/shell';
import { ProjectProvider } from './state/projectStore';
import { SelectionProvider } from './state/selection';
import { ViewModeProvider } from './state/viewMode';

/** Composition root: providers + the shell with its slots. No logic here. */
export function App() {
  return (
    <ViewModeProvider>
      <ProjectProvider>
        <SelectionProvider>
          <AppShell
            canvas={(project) => (
              <DiagramCanvas project={project} overlay={(lanes) => <LaneLayer lanes={lanes} />} />
            )}
            overview={<ProjectOverview />}
            detail={<EntityDetail />}
          />
        </SelectionProvider>
      </ProjectProvider>
    </ViewModeProvider>
  );
}
