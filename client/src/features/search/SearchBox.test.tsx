import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { seedProject } from '../../test/seed';
import { ProjectProvider } from '../../state/projectStore';
import { SearchProvider } from '../../state/search';
import { SearchBox } from './SearchBox';

const render = (initialQuery?: string) =>
  renderToString(
    <ProjectProvider initialProject={seedProject}>
      <SearchProvider initialQuery={initialQuery}>
        <SearchBox />
      </SearchProvider>
    </ProjectProvider>,
  );

describe('SearchBox', () => {
  it('is an empty pill with the placeholder until a query is typed', () => {
    const html = render();
    expect(html).toContain('Search systems, requirements, intents');
    expect(html).toContain('class="input"');
    expect(html).not.toContain('shell-search-hint');
  });

  it('shows how many entities matched', () => {
    expect(render('shell')).toMatch(/shell-search-hint[^>]*>\d+ match(es)?</);
  });
});
