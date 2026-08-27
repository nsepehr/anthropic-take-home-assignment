import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ApplyDemo, ApplyDemoDialog } from './ApplyDemo';

describe('ApplyDemo', () => {
  it('offers the walkthrough as a ghost button, closed', () => {
    const html = renderToString(<ApplyDemo />);
    expect(html).toContain('See how the chat experience works');
    expect(html).toContain('btn-ghost');
    expect(html).not.toContain('dialog-backdrop');
  });

  it('walks the four steps of the chat experience and says it is not built', () => {
    const html = renderToString(<ApplyDemoDialog onClose={() => {}} />);
    expect(html).toContain('What happens during the chat experience');
    expect(html).toContain('think of it as the Claude Code UI');
    expect(html).toContain('You can tag features, requirements, intents and systems');
    expect(html).toContain('goes and attacks the work');
    expect(html).toContain('checks the changes against your intent');
    expect(html).toContain('verified by the user');
    expect(html).toContain('Human intent, product requirements and features all live side by side');
    expect(html).toContain('forever capture');
    expect(html).toContain('Not built in this prototype');
    expect(html).toContain('docs/ONBOARDING.md');
    expect(html).toContain('Close');
  });
});
