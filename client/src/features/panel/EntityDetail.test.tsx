import { describe, expect, it } from 'vitest';
import { seedProject } from '../../test/seed';
import { intentsFor, requirementsFor } from '../../model/entities';
import { EntityDetail } from './EntityDetail';
import { renderPanel } from './test-utils';

function count(html: string, needle: string) {
  return html.split(needle).length - 1;
}

describe('EntityDetail', () => {
  it('system → both headings with the correct counts, plus connected chips', () => {
    const html = renderPanel(<EntityDetail />, 'sys-server-api');
    const reqs = requirementsFor(seedProject, 'sys-server-api');
    const ints = intentsFor(seedProject, 'sys-server-api');
    expect(html).toContain('System · service');
    expect(html).toContain('>Requirements<');
    expect(html).toContain('Why it is built this way');
    for (const r of reqs) expect(html).toContain(r.title);
    for (const i of ints) expect(html).toContain(i.statement);
    expect(count(html, 'panel-card-intent')).toBe(ints.length);
    expect(html).toContain('Connected');
    const shared = seedProject.systems.find((s) => s.id === 'sys-shared-model')!;
    expect(html).toContain(shared.name);
  });

  it("intent → 'Requirements it serves' lists exactly appliesTo.requirementIds", () => {
    const intent = seedProject.intents.find((i) => i.appliesTo.requirementIds.length > 0)!;
    const html = renderPanel(<EntityDetail />, intent.id);
    expect(html).toContain('Intent · decision');
    expect(html).toContain('Requirements it serves');
    expect(html).not.toContain('Why it is built this way');
    const served = seedProject.requirements.filter((r) =>
      intent.appliesTo.requirementIds.includes(r.id),
    );
    expect(count(html, 'panel-status')).toBe(served.length);
    for (const r of served) expect(html).toContain(r.title);
  });

  it("requirement → 'Intents' heading; 'Evidence' only once deep dive is expanded", () => {
    const html = renderPanel(<EntityDetail />, 'req-dogfood-seed');
    expect(html).toContain('Requirement · ');
    expect(html).toContain('>Intents<');
    expect(html).not.toContain('Evidence');
  });

  it('renders nothing with no selection', () => {
    expect(renderPanel(<EntityDetail />)).toBe('');
  });
});
