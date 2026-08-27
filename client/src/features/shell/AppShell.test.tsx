import { describe, expect, it } from 'vitest';
import { seedProject } from '../../test/seed';
import { renderInShell } from './testRender';
import { AppShell } from './AppShell';

const shell = <AppShell canvas={(p) => <p>{`CANVAS:${p.systems.length}`}</p>} detail={<p>d</p>} />;

describe('AppShell', () => {
  it('atlas: full-width canvas, the mission subline, the atlas hint and no panel', () => {
    const html = renderInShell(shell);
    expect(html).toContain(`CANVAS:${seedProject.systems.length}`);
    expect(html).toContain(seedProject.mission);
    expect(html).toContain('Click a system to open it');
    expect(html).not.toContain('side-panel');
  });

  it('focus: the panel appears with the detail slot and the subline says where you are', () => {
    const html = renderInShell(shell, { trail: ['sys-client-api'], selectedId: 'sys-client-api' });
    expect(html).toContain('side-panel');
    expect(html).toContain('<p>d</p>');
    expect(html).toContain('you are inside one of them');
    expect(html).toContain('3 connections');
    expect(html).toContain('Click a neighbour');
  });

  it('shows a loading state before the project arrives', () => {
    const html = renderInShell(shell, { project: null });
    expect(html).toContain('Loading project');
    expect(html).not.toContain('CANVAS:');
  });
});
