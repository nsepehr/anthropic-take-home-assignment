import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { currentOnly } from '@app/shared';
import { seedProject } from '../test/seed';
import { ProjectProvider, useProject } from './projectStore';

function Probe() {
  const { project, fullProject } = useProject();
  return <p>{`${project?.intents.length}/${fullProject?.intents.length}`}</p>;
}

describe('ProjectProvider', () => {
  it('hands the app the current entries only, and keeps the whole file for history', () => {
    const html = renderToString(
      <ProjectProvider initialProject={seedProject}>
        <Probe />
      </ProjectProvider>,
    );
    const current = currentOnly(seedProject).intents.length;
    expect(current).toBeLessThan(seedProject.intents.length); // the seed has real history
    expect(html).toContain(`${current}/${seedProject.intents.length}`);
  });
});
