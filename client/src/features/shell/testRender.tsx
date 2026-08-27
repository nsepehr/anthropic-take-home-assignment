import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import type { Project } from '@app/shared';
import { seedProject } from '../../test/seed';
import { ProjectProvider } from '../../state/projectStore';
import { SelectionProvider } from '../../state/selection';
import { ViewModeProvider } from '../../state/viewMode';

interface Options {
  /** `null` renders the pre-load state. */
  project?: Project | null;
  selectedId?: string;
}

/** Test helper: render a shell piece to HTML inside the three app providers. */
export function renderInShell(ui: ReactNode, { project = seedProject, selectedId }: Options = {}) {
  return renderToString(
    <ViewModeProvider>
      <ProjectProvider initialProject={project ?? undefined}>
        <SelectionProvider initialSelectedId={selectedId}>{ui}</SelectionProvider>
      </ProjectProvider>
    </ViewModeProvider>,
  );
}
