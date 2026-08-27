import { describe, expect, it } from 'vitest';
import { seedProject } from '../../test/seed';
import { ProjectOverview } from './ProjectOverview';
import { renderPanel } from './test-utils';

describe('ProjectOverview', () => {
  it('lists the mission, all requirements and all intents with counts', () => {
    const html = renderPanel(<ProjectOverview />);
    expect(html).toContain(seedProject.name);
    for (const r of seedProject.requirements) expect(html).toContain(r.title);
    for (const i of seedProject.intents) expect(html).toContain(i.statement);
    expect(html).toContain(
      `${seedProject.systems.length} systems · ${seedProject.requirements.length} requirements · ${seedProject.intents.length} intents`,
    );
  });
});
