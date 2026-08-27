import { describe, expect, it } from 'vitest';
import { ARC_EDGE_TYPE, arcBulge, arcPath, attachColumnArcs, isIntraColumn } from './columnEdges';

const columns = new Map([
  ['a', 0],
  ['b', 0],
  ['c', 1],
]);

describe('isIntraColumn', () => {
  it('is true only when both ends sit in the same column', () => {
    expect(isIntraColumn({ source: 'a', target: 'b' }, columns)).toBe(true);
    expect(isIntraColumn({ source: 'a', target: 'c' }, columns)).toBe(false);
  });

  it('is false when either end was not placed', () => {
    expect(isIntraColumn({ source: 'a', target: 'gone' }, columns)).toBe(false);
    expect(isIntraColumn({ source: 'gone', target: 'a' }, columns)).toBe(false);
  });
});

describe('attachColumnArcs', () => {
  it('retypes same-column edges to arcs leaving and re-entering on the right', () => {
    const [intra, cross] = attachColumnArcs(
      [
        { id: '1', source: 'a', target: 'b', sourceHandle: 'b', targetHandle: 't' },
        { id: '2', source: 'a', target: 'c', sourceHandle: 'r', targetHandle: 'l' },
      ],
      columns,
    );
    expect(intra).toEqual({
      id: '1',
      source: 'a',
      target: 'b',
      type: ARC_EDGE_TYPE,
      sourceHandle: 'r',
      targetHandle: 'r',
    });
    // Cross-column edges keep the handle sides `attachEdgeSides` chose, and their default type.
    expect(cross).toEqual({
      id: '2',
      source: 'a',
      target: 'c',
      sourceHandle: 'r',
      targetHandle: 'l',
    });
  });
});

describe('arcPath', () => {
  it('bulges to the right of both ends, further for a longer span', () => {
    expect(arcBulge(0, 300)).toBeGreaterThan(arcBulge(0, 100));
    expect(arcBulge(0, 100_000)).toBeLessThanOrEqual(80);
    const path = arcPath(10, 0, 10, 200);
    expect(path).toBe(`M 10,0 C ${10 + arcBulge(0, 200)},0 ${10 + arcBulge(0, 200)},200 10,200`);
  });
});
