import { describe, expect, it } from 'vitest';
import { EGO, egoLayout } from './egoLayout';

describe('egoLayout', () => {
  it('centers the focus and stacks inbound left, outbound right, inside the frame', () => {
    const layout = egoLayout({ focusId: 'f', inboundIds: ['a', 'b'], outboundIds: ['c'] });
    const byId = new Map(layout.nodes.map((n) => [n.id, n]));
    const f = byId.get('f')!;
    expect(f.position.x + f.width / 2).toBe(layout.width / 2);
    expect(f.position.y + f.height / 2).toBe(layout.height / 2);
    expect(byId.get('a')!.position.x).toBeLessThan(f.position.x);
    expect(byId.get('c')!.position.x).toBeGreaterThan(f.position.x + f.width);
    expect(byId.get('a')!.position.y).toBeLessThan(byId.get('b')!.position.y);
    for (const n of layout.nodes) {
      expect(n.position.x).toBeGreaterThanOrEqual(0);
      expect(n.position.x + n.width).toBeLessThanOrEqual(layout.width);
      expect(n.position.y).toBeGreaterThanOrEqual(0);
      expect(n.position.y + n.height).toBeLessThanOrEqual(layout.height);
    }
  });

  it('grows the frame when a column is taller than the minimum height', () => {
    const many = Array.from({ length: 6 }, (_, i) => `n${i}`);
    const layout = egoLayout({ focusId: 'f', inboundIds: many, outboundIds: [] });
    expect(layout.height).toBeGreaterThan(EGO.frame.minHeight);
    const ys = layout.nodes.filter((n) => n.id !== 'f').map((n) => n.position.y);
    expect(ys[0]).toBeGreaterThanOrEqual(EGO.margin);
  });

  it('a system with no neighbours is just the focus card', () => {
    const layout = egoLayout({ focusId: 'f', inboundIds: [], outboundIds: [] });
    expect(layout.nodes.map((n) => n.id)).toEqual(['f']);
    expect(layout.height).toBe(EGO.frame.minHeight);
  });
});
