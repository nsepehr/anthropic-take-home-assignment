import { describe, expect, it } from 'vitest';
import { CARD_HEIGHT, sizeLeaves } from './cardSize';

describe('sizeLeaves', () => {
  it('sizes leaves to the card height and leaves parents to ELK', () => {
    const nodes = [
      { id: 'group', height: 1 },
      { id: 'leaf', parentId: 'group', height: 1 },
    ];
    const sized = sizeLeaves(nodes);
    expect(sized[0]!.height).toBe(1);
    expect(sized[1]!.height).toBe(CARD_HEIGHT);
  });
});
