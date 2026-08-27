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

  it('a hover previews its own neighbourhood on top of the selection, then hands back', () => {
    const hovered = deriveSelection(project, 'sys-client-api', 'sys-shared-model');
    expect(hovered.hoveredId).toBe('sys-shared-model');
    expect(hovered.isHighlighted('sys-shared-model')).toBe(true);
    expect(hovered.isHighlighted('sys-server-api')).toBe(true); // a neighbour of the hovered one
    expect(hovered.isDimmed('sys-ports-allocator')).toBe(true);
    const back = deriveSelection(project, 'sys-client-api', null);
    expect(back.selectedId).toBe('sys-client-api');
    expect(back.hoveredId).toBeNull();
  });
});
