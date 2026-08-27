import { describe, expect, it } from 'vitest';
import { seedProject } from '../../test/seed';
import { renderInShell } from './testRender';
import { Header } from './Header';

describe('Header', () => {
  it('renders the project name, mission and provenance legend', () => {
    const html = renderInShell(<Header />);
    expect(html).toContain(seedProject.name);
    expect(html).toContain(seedProject.mission);
    expect(html).toContain('Verified human-checked');
    expect(html).toContain('AI inferred');
  });

  it('checks the segment matching the current view mode (overview by default)', () => {
    const html = renderInShell(<Header />);
    expect(html).toMatch(/<input[^>]*checked[^>]*value="overview"/);
    expect(html).not.toMatch(/<input[^>]*checked[^>]*value="deepDive"/);
  });
});
