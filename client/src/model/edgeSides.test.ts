import { describe, expect, it } from 'vitest';
import { attachEdgeSides, chooseHandles, type Rect } from './edgeSides';

const box = (x: number, y: number): Rect => ({ x, y, width: 100, height: 50 });

describe('chooseHandles', () => {
  it('target to the right: leaves right, enters left', () => {
    expect(chooseHandles(box(0, 0), box(300, 10))).toEqual({
      sourceHandle: 'r',
      targetHandle: 'l',
    });
  });
  it('target to the left: leaves left, enters right', () => {
    expect(chooseHandles(box(300, 10), box(0, 0))).toEqual({
      sourceHandle: 'l',
      targetHandle: 'r',
    });
  });
  it('target below: leaves bottom, enters top', () => {
    expect(chooseHandles(box(0, 0), box(10, 300))).toEqual({
      sourceHandle: 'b',
      targetHandle: 't',
    });
  });
  it('target above: leaves top, enters bottom', () => {
    expect(chooseHandles(box(10, 300), box(0, 0))).toEqual({
      sourceHandle: 't',
      targetHandle: 'b',
    });
  });
  it('ties resolve horizontally, in the layout direction', () => {
    expect(chooseHandles(box(0, 0), box(200, 200))).toEqual({
      sourceHandle: 'r',
      targetHandle: 'l',
    });
    expect(chooseHandles(box(0, 0), box(0, 0))).toEqual({ sourceHandle: 'r', targetHandle: 'l' });
  });
});

describe('attachEdgeSides', () => {
  const nodes = [
    { id: 'group', position: { x: 500, y: 0 }, width: 400, height: 300 },
    { id: 'child', parentId: 'group', position: { x: 20, y: 200 }, width: 100, height: 50 },
    { id: 'lone', position: { x: 0, y: 0 }, width: 100, height: 50 },
  ];

  it('uses absolute positions for nested nodes', () => {
    const [edge] = attachEdgeSides(nodes, [{ id: 'e', source: 'child', target: 'lone' }]);
    // child is at (520,200) absolute — left of it, not below-left as its relative position suggests
    expect(edge).toMatchObject({ sourceHandle: 'l', targetHandle: 'r' });
  });

  it('attaches edges to a container by its nearest side', () => {
    const [edge] = attachEdgeSides(nodes, [{ id: 'e', source: 'lone', target: 'group' }]);
    expect(edge).toMatchObject({ sourceHandle: 'r', targetHandle: 'l' });
  });

  it('leaves edges with unknown ends untouched', () => {
    const [edge] = attachEdgeSides(nodes, [{ id: 'e', source: 'lone', target: 'ghost' }]);
    expect(edge).toEqual({ id: 'e', source: 'lone', target: 'ghost' });
  });
});
