export const SLUG = /^[a-z0-9-]+$/;

/** Entity ids are slugs: lowercase letters, digits, dashes. */
export function isSlug(value: string): boolean {
  return SLUG.test(value);
}
