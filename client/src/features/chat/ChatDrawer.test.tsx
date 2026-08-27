import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ChatState } from '../../model/chatThread';
import { mentionById } from '../../model/chatScope';
import { seedProject } from '../../test/seed';
import { ChatProvider } from '../../state/chat';
import { ProjectProvider } from '../../state/projectStore';
import { ChatDrawer } from './ChatDrawer';

const api = mentionById(seedProject, 'sys-client-api');
if (!api) throw new Error('seed is missing sys-client-api');

function render(initial?: Partial<ChatState>) {
  return renderToString(
    <ProjectProvider initialProject={seedProject}>
      <ChatProvider initial={initial}>
        <ChatDrawer />
      </ChatProvider>
    </ProjectProvider>,
  );
}

describe('ChatDrawer', () => {
  it('is a closed header button with the hint and an empty scope', () => {
    const html = render();
    expect(html).toContain('Ask Claude');
    expect(html).toContain('Mention a part with @ and ask for a change');
    expect(html).toContain('nothing in scope yet');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('chat-composer');
  });

  it('opens onto the empty state, the starters and the composer', () => {
    const html = render({ open: true });
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('Type @ to point me at a system, requirement or intent');
    expect(html).toContain('chat-example');
    expect(html).toContain('@requirement or @intent, then what should change…');
  });

  it('shows what is in scope as a removable chip and counts it in the header', () => {
    const html = render({ open: true, mentions: [api] });
    expect(html).toContain('1 in scope');
    expect(html).toContain('@Client API');
    expect(html).toContain('Remove Client API from the chat scope');
  });

  it('renders a sent turn as a user bubble with chips and the assistant reply', () => {
    const html = render({
      open: true,
      messages: [
        { id: 'm0', role: 'user', text: 'what depends on this?', mentions: [api] },
        { id: 'm1', role: 'assistant', text: 'Scoped to Client API.', mentions: [] },
      ],
    });
    expect(html).toContain('chat-turn is-user');
    expect(html).toContain('what depends on this?');
    expect(html).toContain('chat-turn is-assistant');
    expect(html).toContain('Scoped to Client API.');
    expect(html).toContain('Explains a part, then changes it');
    expect(html).toContain('See what Apply would do');
  });

  it('offers the apply walkthrough only once a reply had something in scope', () => {
    const html = render({
      open: true,
      messages: [
        { id: 'm0', role: 'user', text: 'hello', mentions: [] },
        { id: 'm1', role: 'assistant', text: 'Type @ first.', mentions: [] },
      ],
    });
    expect(html).not.toContain('See what Apply would do');
  });
});
