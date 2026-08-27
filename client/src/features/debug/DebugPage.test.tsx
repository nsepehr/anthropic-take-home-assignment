import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { seedProject } from '../../test/seed';
import { ProjectProvider } from '../../state/projectStore';
import { SelectionProvider } from '../../state/selection';
import { ViewModeProvider } from '../../state/viewMode';
import { DebugPage } from './index';

describe('DebugPage', () => {
  it('renders the selection readout once the project is available', () => {
    const html = renderToString(
      <ViewModeProvider>
        <ProjectProvider initialProject={seedProject}>
          <SelectionProvider initialSelectedId="sys-client-app">
            <DebugPage />
          </SelectionProvider>
        </ProjectProvider>
      </ViewModeProvider>,
    );
    expect(html).toContain('sys-client-app');
    expect(html).toContain('edge-client-calls-server');
  });

  it('shows the loading state before the project arrives', () => {
    const html = renderToString(
      <ViewModeProvider>
        <ProjectProvider>
          <SelectionProvider>
            <DebugPage />
          </SelectionProvider>
        </ProjectProvider>
      </ViewModeProvider>,
    );
    expect(html).toContain('Loading project');
  });
});
