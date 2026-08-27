import { describe, expect, it } from 'vitest';
import { seedProject } from '../../test/seed';
import { renderInShell } from './testRender';
import { Header } from './Header';

describe('Header', () => {
  it('renders the project name, the Architecture crumb and the provenance legend', () => {
    const html = renderInShell(<Header />);
    expect(html).toContain(seedProject.name);
    expect(html).toContain('>Architecture<');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('tag-legend-verified');
    expect(html).toContain('human-checked');
    expect(html).toContain('tag-legend-ai');
    expect(html).toContain('inferred');
  });

  it('shows each hop of the trail, the current one last', () => {
    const html = renderInShell(<Header />, { trail: ['sys-client-shell', 'sys-client-diagram'] });
    expect(html.indexOf('App shell')).toBeLessThan(html.indexOf('Diagram canvas'));
    expect(html).toContain('is-current" aria-current="page">Diagram canvas<');
    expect(html.match(/shell-trail-sep/g)).toHaveLength(2);
  });

  it('has no global view-mode control', () => {
    const html = renderInShell(<Header />);
    expect(html).not.toContain('view-mode');
    expect(html).not.toContain('Deep dive');
  });
});
