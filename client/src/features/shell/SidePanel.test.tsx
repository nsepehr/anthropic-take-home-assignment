import { describe, expect, it } from 'vitest';
import { renderInShell } from './testRender';
import { SidePanel } from './SidePanel';

const panel = <SidePanel overview={<p>OVERVIEW-SLOT</p>} detail={<p>DETAIL-SLOT</p>} />;

describe('SidePanel', () => {
  it('shows the overview slot when nothing is selected', () => {
    const html = renderInShell(panel);
    expect(html).toContain('OVERVIEW-SLOT');
    expect(html).not.toContain('DETAIL-SLOT');
  });

  it('shows the detail slot when something is selected', () => {
    const html = renderInShell(panel, { selectedId: 'sys-client-api' });
    expect(html).toContain('DETAIL-SLOT');
    expect(html).not.toContain('OVERVIEW-SLOT');
  });
});
