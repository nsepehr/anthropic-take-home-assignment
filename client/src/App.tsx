import { DebugCanvas } from './features/debug/components/DebugCanvas';
import { AppShell, DetailPlaceholder, OverviewPlaceholder } from './features/shell';
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
            canvas={(project) => <DebugCanvas project={project} />}
            overview={<OverviewPlaceholder />}
            detail={<DetailPlaceholder />}
          />
        </SelectionProvider>
      </ProjectProvider>
    </ViewModeProvider>
  );
}
