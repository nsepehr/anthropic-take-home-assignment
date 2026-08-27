import { DebugPage } from './features/debug';
import { ProjectProvider } from './state/projectStore';
import { SelectionProvider } from './state/selection';
import { ViewModeProvider } from './state/viewMode';

/** Composition root: providers + the current top-level feature. No logic here. */
export function App() {
  return (
    <ViewModeProvider>
      <ProjectProvider>
        <SelectionProvider>
          <DebugPage />
        </SelectionProvider>
      </ProjectProvider>
    </ViewModeProvider>
  );
}
