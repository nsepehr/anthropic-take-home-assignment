import { describe, expect, it } from 'vitest';
import { CARD_HEIGHT, sizeForMode } from './cardSize';

describe('sizeForMode', () => {
  it('sizes leaves per view mode and leaves parents to ELK', () => {
    const nodes = [
      { id: 'group', height: 1 },
      { id: 'leaf', parentId: 'group', height: 1 },
    ];
    const sized = sizeForMode(nodes, 'deepDive');
    expect(sized[0]!.height).toBe(1);
    expect(sized[1]!.height).toBe(CARD_HEIGHT.deepDive);
  });
});
