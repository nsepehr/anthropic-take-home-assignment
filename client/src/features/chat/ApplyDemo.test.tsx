import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ApplyDemo, ApplyDemoDialog } from './ApplyDemo';

describe('ApplyDemo', () => {
  it('offers the walkthrough as a ghost button, closed', () => {
    const html = renderToString(<ApplyDemo />);
    expect(html).toContain('See what Apply would do');
    expect(html).toContain('btn-ghost');
    expect(html).not.toContain('dialog-backdrop');
  });

  it('walks the five steps, ending at the gate, and says it is not built', () => {
    const html = renderToString(<ApplyDemoDialog onClose={() => {}} />);
    expect(html).toContain('What happens when you apply');
    expect(html).toContain('Claude drafts a change to the map');
    expect(html).toContain('nothing is written yet');
    expect(html).toContain('data/project.json');
    expect(html).toContain('Chat edit · review');
    expect(html).toContain('apply-demo-pill'); // the dashed review pill, as in the design
    expect(html).toContain('validate:data');
    expect(html).toContain('Not built in this prototype');
    expect(html).toContain('docs/ONBOARDING.md');
    expect(html).toContain('Close');
  });
});
