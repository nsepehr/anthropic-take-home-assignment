import { ChatDrawer } from './features/chat';
import { DiagramCanvas } from './features/diagram';
import { EntityDetail, ProjectOverview } from './features/panel';
import { AppShell } from './features/shell';
import { FirstRunProvider } from './state/firstRun';
import { NavigationProvider } from './state/navigation';
import { ChatProvider } from './state/chat';
import { ProjectProvider } from './state/projectStore';
import { SelectionProvider } from './state/selection';

/** Composition root: providers + the shell with its slots. No logic here. */
export function App() {
  return (
    <ProjectProvider>
      <SelectionProvider>
        <NavigationProvider>
          <FirstRunProvider>
            <ChatProvider>
              <AppShell
                canvas={(project) => <DiagramCanvas project={project} />}
                overview={<ProjectOverview />}
                detail={<EntityDetail />}
                chat={<ChatDrawer />}
              />
            </ChatProvider>
          </FirstRunProvider>
        </NavigationProvider>
      </SelectionProvider>
    </ProjectProvider>
  );
}
