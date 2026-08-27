import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { seedProject } from '../../../test/seed';
import { SystemCard } from './SystemCard';

const system = seedProject.systems.find((s) => s.id === 'sys-client-api')!;

describe('SystemCard', () => {
  it('renders name, counts, provenance tag and the one-line summary', () => {
    const html = renderToString(
      <SystemCard system={system} requirementCount={3} intentCount={2} state="idle" />,
    );
    expect(html).toContain(system.name);
    expect(html).toContain('3 req');
    expect(html).toContain('2 why');
    expect(html).toContain(system.provenance.source === 'human-verified' ? 'Verified' : 'AI');
    expect(html).toContain(system.summary);
    expect(html).not.toContain(system.detail.slice(0, 20));
    expect(html).toContain(`--kind-${system.kind}`);
  });

  it('zero counts render no tag', () => {
    const html = renderToString(
      <SystemCard system={system} requirementCount={0} intentCount={0} state="idle" />,
    );
    expect(html).not.toContain('0 req');
    expect(html).not.toContain('0 why');
    expect(html).toContain(system.kind);
  });

  it('reflects the selection state as a class', () => {
    expect(
      renderToString(
        <SystemCard system={system} requirementCount={0} intentCount={0} state="selected" />,
      ),
    ).toContain('is-selected');
    expect(
      renderToString(
        <SystemCard system={system} requirementCount={0} intentCount={0} state="dimmed" />,
      ),
    ).toContain('is-dimmed');
  });

  it('offers "Open" only when given an onOpen handler (never on the focus card)', () => {
    const base = { system, requirementCount: 0, intentCount: 0, state: 'idle' as const };
    expect(renderToString(<SystemCard {...base} onOpen={() => {}} />)).toContain(
      'diagram-card__open',
    );
    expect(renderToString(<SystemCard {...base} />)).not.toContain('diagram-card__open');
    expect(renderToString(<SystemCard {...base} focus />)).toContain('diagram-card--focus');
  });
});
