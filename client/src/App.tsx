import { DiagramCanvas } from './features/diagram';
import { EntityDetail } from './features/panel';
import { AppShell } from './features/shell';
import { NavigationProvider } from './state/navigation';
import { ProjectProvider } from './state/projectStore';
import { SelectionProvider } from './state/selection';

/** Composition root: providers + the shell with its slots. No logic here. */
export function App() {
  return (
    <ProjectProvider>
      <SelectionProvider>
        <NavigationProvider>
          <AppShell
            canvas={(project) => <DiagramCanvas project={project} />}
            detail={<EntityDetail />}
          />
        </NavigationProvider>
      </SelectionProvider>
    </ProjectProvider>
  );
}
