import { describe, expect, it } from 'vitest';
import { currentOnly } from '@app/shared';
import { featuresFirst } from '../../model/entities';
import { seedProject } from '../../test/seed';
import { ProjectOverview } from './ProjectOverview';
import { renderPanel } from './test-utils';

describe('ProjectOverview', () => {
  it('lists the mission, the first requirements and intents with counts, and collapses the rest', () => {
    const html = renderPanel(<ProjectOverview />);
    // The store hands the panel the current entries only; the counts must match that.
    const { requirements, intents, systems } = currentOnly(seedProject);
    expect(html).toContain(seedProject.name);
    // Features sort to the top, so the first five shown are the first five of that order.
    for (const r of featuresFirst(requirements).slice(0, 5)) expect(html).toContain(r.title);
    for (const i of intents.slice(0, 5)) expect(html).toContain(i.statement);
    if (requirements.length > 5) expect(html).toContain(`Show ${requirements.length - 5} more`);
    if (intents.length > 5) expect(html).toContain(`Show ${intents.length - 5} more`);
    expect(html).toContain(
      `${systems.length} systems · ${requirements.length} requirements · ${intents.length} intents`,
    );
  });
});
