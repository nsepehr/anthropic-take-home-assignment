import { describe, expect, it } from 'vitest';
import { panelAction, panelEntityId } from './panelAction';
import { ATLAS } from './scope';

const focus = { level: 'system', id: 'sys-a' } as const;

describe('panelAction', () => {
  it('atlas: Close clears; focus with a neighbour selected: Clear; focus alone: Back', () => {
    expect(panelAction(ATLAS, 'sys-a')).toEqual({ label: 'Close', kind: 'clear' });
    expect(panelAction(focus, 'sys-b')).toEqual({ label: 'Clear', kind: 'clear' });
    expect(panelAction(focus, null)).toEqual({ label: 'Back', kind: 'back' });
    expect(panelAction(focus, 'sys-a')).toEqual({ label: 'Back', kind: 'back' });
  });
});

describe('panelEntityId', () => {
  it('prefers the selection, falls back to the focused system, else nothing', () => {
    expect(panelEntityId(ATLAS, null)).toBeNull();
    expect(panelEntityId(ATLAS, 'req-x')).toBe('req-x');
    expect(panelEntityId(focus, null)).toBe('sys-a');
    expect(panelEntityId(focus, 'sys-b')).toBe('sys-b');
  });
});
