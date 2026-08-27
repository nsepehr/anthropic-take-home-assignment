import { describe, expect, it } from 'vitest';
import { isSlug } from './slug.js';

describe('isSlug', () => {
  it('accepts lowercase letters, digits and dashes only', () => {
    expect(isSlug('sys-server-api')).toBe(true);
    expect(isSlug('a1-2')).toBe(true);
    expect(isSlug('Sys')).toBe(false);
    expect(isSlug('a b')).toBe(false);
    expect(isSlug('../x')).toBe(false);
    expect(isSlug('')).toBe(false);
  });
});
