import { describe, expect, it } from 'vitest';
import { renderInShell } from './testRender';
import { SidePanel } from './SidePanel';

describe('SidePanel', () => {
  it('renders its content in the scrolling aside', () => {
    const html = renderInShell(<SidePanel>DETAIL-SLOT</SidePanel>, {
      selectedId: 'sys-client-api',
    });
    expect(html).toContain('side-panel');
    expect(html).toContain('DETAIL-SLOT');
  });
});
