import { describe, expect, it } from 'vitest';
import { alignLaneTops } from './alignLanes';

const index = {
  order: ['One', 'Two'],
  categoryById: new Map([
    ['a', 'One'],
    ['a-child', 'One'],
    ['b', 'One'],
    ['c', 'Two'],
  ]),
};
const nodes = [
  { id: 'a', position: { x: 0, y: 100 }, width: 10, height: 10 },
  { id: 'a-child', parentId: 'a', position: { x: 5, y: 5 }, width: 2, height: 2 },
  { id: 'b', position: { x: 0, y: 300 }, width: 10, height: 10 },
  { id: 'c', position: { x: 200, y: 40 }, width: 10, height: 10 },
  { id: 'loose', position: { x: 400, y: 500 }, width: 10, height: 10 },
];

describe('alignLaneTops', () => {
  it('moves every lane so its highest node sits at the highest lane top, keeping x', () => {
    const y = (id: string) => alignLaneTops(nodes, index).find((n) => n.id === id)!.position;
    expect(y('a')).toEqual({ x: 0, y: 40 });
    expect(y('b')).toEqual({ x: 0, y: 240 });
    expect(y('c')).toEqual({ x: 200, y: 40 });
  });

  it('leaves nested nodes (parent-relative) and nodes outside any lane untouched', () => {
    const aligned = alignLaneTops(nodes, index);
    expect(aligned.find((n) => n.id === 'a-child')!.position).toEqual({ x: 5, y: 5 });
    expect(aligned.find((n) => n.id === 'loose')!.position).toEqual({ x: 400, y: 500 });
  });

  it('is the identity when nothing belongs to a lane', () => {
    expect(alignLaneTops(nodes, { order: [], categoryById: new Map() })).toBe(nodes);
  });
});
