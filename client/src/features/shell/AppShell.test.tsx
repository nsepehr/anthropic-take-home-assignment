import { describe, expect, it } from 'vitest';
import { seedProject } from '../../test/seed';
import { renderInShell } from './testRender';
import { AppShell } from './AppShell';

const shell = (
  <AppShell
    canvas={(p) => <p>{`CANVAS:${p.systems.length}`}</p>}
    overview={<p>OVERVIEW-SLOT</p>}
    detail={<p>DETAIL-SLOT</p>}
  />
);

describe('AppShell', () => {
  it('atlas: canvas, the mission subline, the overview panel and the first-time coach-mark', () => {
    const html = renderInShell(shell);
    expect(html).toContain(`CANVAS:${seedProject.systems.length}`);
    expect(html).toContain(seedProject.mission);
    expect(html).toContain('OVERVIEW-SLOT');
    expect(html).toContain('canvas-coach');
    expect(html).toContain('Got it');
  });

  it('atlas with a selection: the detail slot', () => {
    const html = renderInShell(shell, { selectedId: 'sys-client-api' });
    expect(html).toContain('DETAIL-SLOT');
    expect(html).not.toContain('OVERVIEW-SLOT');
  });

  it('focus: the detail slot even with nothing selected, and the subline says where you are', () => {
    const html = renderInShell(shell, { trail: ['sys-client-api'] });
    expect(html).toContain('DETAIL-SLOT');
    expect(html).toContain('you are inside one of them');
    expect(html).toContain('3 connections');
    expect(html).toContain('Double-click to walk');
  });

  it('shows a loading state before the project arrives', () => {
    const html = renderInShell(shell, { project: null });
    expect(html).toContain('Loading project');
    expect(html).not.toContain('CANVAS:');
  });
});
