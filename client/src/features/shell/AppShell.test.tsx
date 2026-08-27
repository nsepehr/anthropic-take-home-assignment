import { describe, expect, it } from 'vitest';
import { seedProject } from '../../test/seed';
import { renderInShell } from './testRender';
import { AppShell } from './AppShell';

const HINT = 'Click a system';
const shell = (
  <AppShell
    canvas={(p) => <p>{`CANVAS:${p.systems.length}`}</p>}
    overview={<p>o</p>}
    detail={<p>d</p>}
  />
);

describe('AppShell', () => {
  it('hands the loaded project to the canvas slot and shows the hint with no selection', () => {
    const html = renderInShell(shell);
    expect(html).toContain(`CANVAS:${seedProject.systems.length}`);
    expect(html).toContain(HINT);
  });

  it('hides the hint once something is selected', () => {
    expect(renderInShell(shell, { selectedId: 'sys-client-api' })).not.toContain(HINT);
  });

  it('shows a loading state before the project arrives', () => {
    const html = renderInShell(shell, { project: null });
    expect(html).toContain('Loading project');
    expect(html).not.toContain('CANVAS:');
  });
});
