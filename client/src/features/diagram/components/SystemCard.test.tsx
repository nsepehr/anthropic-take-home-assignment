import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { seedProject } from '../../../test/seed';
import { SystemCard } from './SystemCard';

const system = seedProject.systems.find((s) => s.id === 'sys-client-app')!;

describe('SystemCard', () => {
  it('renders name, counts, provenance tag and the summary in overview', () => {
    const html = renderToString(
      <SystemCard
        system={system}
        requirementCount={3}
        intentCount={2}
        mode="overview"
        state="idle"
      />,
    );
    expect(html).toContain(system.name);
    expect(html).toContain('3 req');
    expect(html).toContain('2 why');
    expect(html).toContain(system.provenance.source === 'human-verified' ? 'Verified' : 'AI');
    expect(html).toContain(system.summary);
    expect(html).toContain(`--kind-${system.kind}`);
  });

  it('shows detail in deep dive and reflects the selection state as a class', () => {
    const html = renderToString(
      <SystemCard
        system={system}
        requirementCount={0}
        intentCount={0}
        mode="deepDive"
        state="selected"
      />,
    );
    expect(html).toContain('is-selected');
    expect(html).toContain(system.detail.slice(0, 20));
  });

  it('marks dimmed cards with the dimmed class', () => {
    const html = renderToString(
      <SystemCard
        system={system}
        requirementCount={0}
        intentCount={0}
        mode="overview"
        state="dimmed"
      />,
    );
    expect(html).toContain('is-dimmed');
  });
});
