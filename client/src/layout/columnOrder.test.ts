import { describe, expect, it } from 'vitest';
import { adjacency, orderColumn } from './columnOrder';

/** `a` and `b` sit in the previous column at rows 0 and 1; `x`, `y`, `z` are being ordered. */
const previousRows = new Map([
  ['a', 0],
  ['b', 1],
  ['c', 2],
]);

const order = (
  ids: string[],
  links: Record<string, string[]>,
  pinned?: ReadonlyMap<string, number>,
) => orderColumn({ ids, previousRows, neighboursOf: (id) => links[id] ?? [], pinned });

describe('orderColumn', () => {
  it('keeps seed order when there is no previous column to line up with', () => {
    expect(
      orderColumn({
        ids: ['x', 'y', 'z'],
        previousRows: new Map(),
        neighboursOf: () => ['a'],
      }),
    ).toEqual(['x', 'y', 'z']);
  });

  it('sorts by the average row of its neighbours in the previous column', () => {
    // z follows row 0, x the average of rows 1 and 2, y row 2 — so z, x, y regardless of seed.
    expect(order(['x', 'y', 'z'], { x: ['b', 'c'], y: ['c'], z: ['a'] })).toEqual(['z', 'x', 'y']);
  });

  it('breaks equal barycenters by seed order', () => {
    expect(order(['x', 'y'], { x: ['b'], y: ['b'] })).toEqual(['x', 'y']);
    expect(order(['y', 'x'], { x: ['b'], y: ['b'] })).toEqual(['y', 'x']);
  });

  it('keeps systems with no neighbour in the previous column in seed order at the bottom', () => {
    // y and z are new and unconnected: they append instead of shuffling the column.
    expect(order(['y', 'z', 'x'], { x: ['a'] })).toEqual(['x', 'y', 'z']);
  });

  it('ignores neighbours that are not in the previous column', () => {
    expect(order(['x', 'y'], { y: ['a'], x: ['elsewhere'] })).toEqual(['y', 'x']);
  });

  it('keeps a pinned system at its row and fills the rest around it', () => {
    const pinned = new Map([['y', 0]]);
    expect(order(['x', 'y', 'z'], { x: ['a'], z: ['b'] }, pinned)).toEqual(['y', 'x', 'z']);
  });

  it('ignores a pin that is out of range or already taken, placing that system freely', () => {
    expect(order(['x', 'y'], {}, new Map([['y', 9]]))).toEqual(['x', 'y']);
    expect(
      order(
        ['x', 'y'],
        {},
        new Map([
          ['x', 0],
          ['y', 0],
        ]),
      ),
    ).toEqual(['x', 'y']);
  });

  it('returns every id exactly once', () => {
    const result = order(['x', 'y', 'z'], { x: ['c'], z: ['a'] }, new Map([['y', 2]]));
    expect([...result].sort()).toEqual(['x', 'y', 'z']);
  });
});

describe('adjacency', () => {
  it('links both directions so a column can read either of its sides', () => {
    const map = adjacency([
      { from: 'a', to: 'b' },
      { from: 'c', to: 'b' },
    ]);
    expect(map.get('a')).toEqual(['b']);
    expect(map.get('b')).toEqual(['a', 'c']);
    expect(map.get('missing')).toBeUndefined();
  });
});
