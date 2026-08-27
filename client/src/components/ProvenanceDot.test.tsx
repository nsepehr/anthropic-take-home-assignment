import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ProvenanceDot } from './ProvenanceDot';

describe('ProvenanceDot', () => {
  it('human-verified is a filled --prov-human dot', () => {
    const html = renderToString(<ProvenanceDot source="human-verified" />);
    expect(html).toContain('class="dot"');
    expect(html).toContain('--dot-color:var(--prov-human)');
    expect(html).toContain('title="Human-verified"');
  });

  it('ai-inferred is an outlined --prov-ai dot', () => {
    const html = renderToString(<ProvenanceDot source="ai-inferred" />);
    expect(html).toContain('class="dot dot-outlined"');
    expect(html).toContain('--dot-color:var(--prov-ai)');
    expect(html).toContain('title="AI-inferred"');
  });
});
