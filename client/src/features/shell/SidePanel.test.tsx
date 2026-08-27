import { describe, expect, it } from 'vitest';
import { renderInShell } from './testRender';
import { SidePanel } from './SidePanel';

const panel = <SidePanel overview={<p>OVERVIEW-SLOT</p>} detail={<p>DETAIL-SLOT</p>} />;

describe('SidePanel', () => {
  it('atlas: overview when nothing is selected, detail when something is', () => {
    expect(renderInShell(panel)).toContain('OVERVIEW-SLOT');
    expect(renderInShell(panel, { selectedId: 'sys-client-api' })).toContain('DETAIL-SLOT');
  });

  it('focus view: detail even with nothing selected (the focused system)', () => {
    const html = renderInShell(panel, { trail: ['sys-client-api'] });
    expect(html).toContain('DETAIL-SLOT');
    expect(html).not.toContain('OVERVIEW-SLOT');
  });
});
