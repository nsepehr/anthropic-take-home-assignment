import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { seedProject } from '../test/seed';
import { ProjectProvider } from './projectStore';
import { SearchProvider, useSearch } from './search';

function Probe() {
  const { active, count, matchClass, filter } = useSearch();
  return (
    <span>
      {`${active}|${count}|${matchClass('sys-client-shell')}|${filter(seedProject.systems).length === seedProject.systems.length}`}
    </span>
  );
}

const render = (initialQuery?: string) =>
  renderToString(
    <ProjectProvider initialProject={seedProject}>
      <SearchProvider initialQuery={initialQuery}>
        <Probe />
      </SearchProvider>
    </ProjectProvider>,
  );

describe('SearchProvider', () => {
  it('is inert with no query and marks matches and non-matches once one is typed', () => {
    expect(render()).toContain('false|0||true'); // inactive: nothing marked, nothing filtered out

    const html = render('App shell');
    expect(html).toMatch(/true\|\d+\| is-match\|false/);
    expect(renderToString(<Probe />)).toContain('false|0||true'); // inert outside the provider
  });
});
