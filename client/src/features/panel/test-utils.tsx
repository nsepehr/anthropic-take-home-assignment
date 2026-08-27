import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { seedProject } from '../../test/seed';
import { NavigationProvider } from '../../state/navigation';
import { ProjectProvider } from '../../state/projectStore';
import { SelectionProvider } from '../../state/selection';

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
      <ProjectProvider initialProject={seedProject}>
        <SelectionProvider initialSelectedId={selectedId}>
          <NavigationProvider>{ui}</NavigationProvider>
        </SelectionProvider>
      </ProjectProvider>,
    ),
  );
}

function decode(html: string): string {
  return html.replace(new RegExp(Object.keys(ENTITIES).join('|'), 'g'), (m) => ENTITIES[m] ?? m);
}
