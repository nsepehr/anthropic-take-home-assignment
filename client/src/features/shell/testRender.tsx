import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import type { Project } from '@app/shared';
import { seedProject } from '../../test/seed';
import { FirstRunProvider } from '../../state/firstRun';
import { NavigationProvider } from '../../state/navigation';
import { ProjectProvider } from '../../state/projectStore';
import { SelectionProvider } from '../../state/selection';

interface Options {
  /** `null` renders the pre-load state. */
  project?: Project | null;
  selectedId?: string;
  /** Systems opened so far; empty renders the atlas. */
  trail?: string[];
}

/** Test helper: render a shell piece to HTML inside the app providers. */
export function renderInShell(
  ui: ReactNode,
  { project = seedProject, selectedId, trail }: Options = {},
) {
  return renderToString(
    <ProjectProvider initialProject={project ?? undefined}>
      <SelectionProvider initialSelectedId={selectedId}>
        <NavigationProvider initialTrail={trail}>
          <FirstRunProvider>{ui}</FirstRunProvider>
        </NavigationProvider>
      </SelectionProvider>
    </ProjectProvider>,
  );
}
