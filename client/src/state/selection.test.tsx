import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { seedProject } from '../test/seed';
import { ProjectProvider } from './projectStore';
import { SelectionProvider, useSelection } from './selection';

function Probe() {
  const { selectedId, related } = useSelection();
  return <p>{`${selectedId}:${related.systemIds.join(',')}`}</p>;
}

describe('SelectionProvider', () => {
  it('exposes the selection and its related ids to consumers', () => {
    const html = renderToString(
      <ProjectProvider initialProject={seedProject}>
        <SelectionProvider initialSelectedId="edge-client-calls-server">
          <Probe />
        </SelectionProvider>
      </ProjectProvider>,
    );
    expect(html).toContain('edge-client-calls-server:sys-client-app,sys-server-api');
  });
});
