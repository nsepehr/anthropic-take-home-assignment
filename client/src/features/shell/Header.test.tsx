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

  it('has no global view-mode control', () => {
    const html = renderInShell(<Header />);
    expect(html).not.toContain('view-mode');
    expect(html).not.toContain('Deep dive');
  });
});
