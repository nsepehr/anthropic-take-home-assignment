import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { seedProject } from '../../test/seed';
import { ProjectProvider } from '../../state/projectStore';
import { SelectionProvider } from '../../state/selection';
import { ViewModeProvider } from '../../state/viewMode';

const ENTITIES: Record<string, string> = {
  '&#x27;': "'",
  '&quot;': '"',
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
};

/** Render panel content against the seed with an optional selection; entities decoded (tests only). */
export function renderPanel(ui: ReactNode, selectedId?: string): string {
  return decode(
    renderToString(
      <ViewModeProvider>
        <ProjectProvider initialProject={seedProject}>
          <SelectionProvider initialSelectedId={selectedId}>{ui}</SelectionProvider>
        </ProjectProvider>
      </ViewModeProvider>,
    ),
  );
}

function decode(html: string): string {
  return html.replace(new RegExp(Object.keys(ENTITIES).join('|'), 'g'), (m) => ENTITIES[m] ?? m);
}
