/** The vocabulary the validation rules share: where an entry lives and how a finding is reported. */

/** A readable validation finding: where it is and what is wrong. */
export interface ValidationError {
  path: string;
  message: string;
}

/** Every array of identified entries in a Project. `categories` is optional on the file. */
export const COLLECTIONS = ['systems', 'requirements', 'intents', 'edges', 'categories'] as const;

export type Collection = (typeof COLLECTIONS)[number];

const SINGULAR: Record<Collection, string> = {
  systems: 'system',
  requirements: 'requirement',
  intents: 'intent',
  edges: 'edge',
  categories: 'category',
};

/** `'systems'` → `'system'`, for error messages that name one entry. */
export const singular = (collection: Collection): string => SINGULAR[collection];
