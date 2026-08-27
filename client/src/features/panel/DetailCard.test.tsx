import { describe, expect, it } from 'vitest';
import { seedProject } from '../../test/seed';
import { findEntity } from '../../model/entities';
import { DetailCard } from './DetailCard';
import { renderPanel } from './test-utils';

const CASES = [
  { id: 'sys-server-api', label: 'How it works' },
  { id: 'req-dogfood-seed', label: 'Evidence' },
  { id: seedProject.intents[0]!.id, label: 'Rationale' },
];

describe('DetailCard', () => {
  it.each(CASES)('$id: collapsed by default with a "Deep dive" button', ({ id, label }) => {
    const html = renderPanel(<DetailCard found={findEntity(seedProject, id)!} />, id);
    expect(html).toContain('>Deep dive<');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain(label);
  });

  it.each(CASES)('$id: expanded shows "$label" and "Hide deep dive"', ({ id, label }) => {
    const html = renderPanel(
      <DetailCard found={findEntity(seedProject, id)!} defaultExpanded />,
      id,
    );
    expect(html).toContain(label);
    expect(html).toContain('>Hide deep dive<');
    expect(html).toContain('aria-expanded="true"');
  });

  it('requirement deep dive lists the evidence', () => {
    const req = seedProject.requirements.find((r) => r.evidence.length > 0)!;
    const html = renderPanel(
      <DetailCard found={findEntity(seedProject, req.id)!} defaultExpanded />,
      req.id,
    );
    expect(html).toContain('panel-evidence');
    expect(html).toContain(req.evidence[0]);
  });

  it('action label follows the level: Close on the atlas, Clear for a selected neighbour, Back for the focus', () => {
    const found = findEntity(seedProject, 'sys-server-api')!;
    expect(renderPanel(<DetailCard found={found} />, 'sys-server-api')).toContain('>Close<');
    expect(
      renderPanel(<DetailCard found={found} />, 'sys-server-api', ['sys-client-api']),
    ).toContain('>Clear<');
    expect(renderPanel(<DetailCard found={found} />, undefined, ['sys-server-api'])).toContain(
      '>Back<',
    );
  });

  it('a system that is not the current focus offers "Open"', () => {
    const found = findEntity(seedProject, 'sys-server-api')!;
    expect(renderPanel(<DetailCard found={found} />, 'sys-server-api')).toContain('Open');
    expect(renderPanel(<DetailCard found={found} />, undefined, ['sys-server-api'])).not.toContain(
      'Open',
    );
  });
});
