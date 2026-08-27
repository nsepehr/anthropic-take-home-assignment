import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MentionButton } from './MentionButton';

describe('MentionButton', () => {
  it('offers to tag an entity', () => {
    const html = renderToString(
      <MentionButton inScope={false} title="Tag Client API into the chat" onClick={() => {}} />,
    );
    expect(html).toContain('Tag Client API into the chat');
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain('mention-btn--lg');
  });

  it('reads as pressed once the entity is in scope, and larger on the detail card', () => {
    const html = renderToString(
      <MentionButton inScope title="…is already in the chat scope" onClick={() => {}} large />,
    );
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('is-in-scope');
    expect(html).toContain('mention-btn--lg');
  });
});
