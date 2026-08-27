import { describe, expect, it } from 'vitest';
import { relatedTo } from '@app/shared';
import { seedProject as project } from '../test/seed';
import { deriveSelection, EMPTY_RELATED } from './selection';

const allIds = [
  ...project.systems,
  ...project.requirements,
  ...project.intents,
  ...project.edges,
].map((e) => e.id);

describe('deriveSelection', () => {
  it('related matches relatedTo for the selected id and highlights the closure', () => {
    const id = 'int-backend-first';
    const view = deriveSelection(project, id);
    expect(view.related).toEqual(relatedTo(project, id));
    expect(view.isHighlighted(id)).toBe(true);
    expect(view.isHighlighted('sys-client-api')).toBe(true);
    expect(view.isDimmed('sys-client-api')).toBe(false);
    expect(view.isDimmed('sys-dev-runner')).toBe(true);
  });

  it('nothing is related, highlighted, or dimmed when nothing is selected', () => {
    const view = deriveSelection(project, null);
    expect(view.related).toEqual(EMPTY_RELATED);
    expect(allIds.some((id) => view.isDimmed(id))).toBe(false);
    expect(allIds.some((id) => view.isHighlighted(id))).toBe(false);
  });
});
