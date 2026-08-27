import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { mentionById } from '../model/chatScope';
import { seedProject } from '../test/seed';
import { ProjectProvider } from './projectStore';
import { ChatProvider, useChat, useMention } from './chat';

const api = mentionById(seedProject, 'sys-client-api')!;
const hero = mentionById(seedProject, 'req-single-focused-interaction')!;

function Probe() {
  const { open, mentions, attention, matches } = useChat();
  const mention = useMention({
    type: 'system',
    entity: seedProject.systems.find((s) => s.id === 'sys-client-api')!,
  });
  return (
    <p>{`open=${open} scope=${mentions.length} attention=${[...attention].sort().join(',')} menu=${matches('client api').length} title=${mention.title}`}</p>
  );
}

function render(initial?: Parameters<typeof ChatProvider>[0]['initial']) {
  return renderToString(
    <ProjectProvider initialProject={seedProject}>
      <ChatProvider initial={initial}>
        <Probe />
      </ChatProvider>
    </ProjectProvider>,
  );
}

describe('ChatProvider', () => {
  it('starts closed with nothing in scope and nothing lit on the canvas', () => {
    const html = render();
    expect(html).toContain('open=false');
    expect(html).toContain('scope=0');
    expect(html).toContain('attention=');
    expect(html).toContain('menu=1');
  });

  it('resolves the mentions in scope to the systems the canvas rings', () => {
    const html = render({ open: true, mentions: [api, hero] });
    const expected = [
      'sys-client-api',
      ...(seedProject.requirements.find((r) => r.id === hero.id)?.systemIds ?? []),
    ].sort();
    expect(html).toContain(`attention=${[...new Set(expected)].join(',')}`);
    expect(html).toContain('open=true');
  });

  it('keeps a tagged entity out of the mention menu and says so on its button', () => {
    const html = render({ mentions: [api] });
    expect(html).toContain('menu=0');
    expect(html).toContain('Client API is already in the chat scope');
  });

  it('offers to tag an untagged entity', () => {
    expect(render()).toContain('Tag Client API into the chat');
  });
});
