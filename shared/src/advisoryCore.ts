import type { Project } from './schema/index.js';

/**
 * Computed, never stored: where the model breaks the rules in `docs/MODELING.md`.
 * Advisories are warnings — the file still validates. Gaps (missing links) are a separate report.
 */
export interface Advisory {
  code: AdvisoryCode;
  severity: 'warn' | 'info';
  targetId: string;
  message: string;
}

export type AdvisoryCode =
  | 'category-too-large'
  | 'too-many-categories'
  | 'category-internal-edges'
  | 'system-too-connected'
  | 'system-isolated'
  | 'edge-unlabeled'
  | 'summary-too-long'
  | 'detail-missing-how'
  | 'intent-is-description'
  | 'requirement-no-evidence'
  | 'ai-inferred-unreviewed';

export const LIMITS = {
  systemsPerCategory: 8,
  categories: 6,
  edgesPerSystem: 6,
  internalEdges: 3,
  summaryWords: 20,
  rationaleWords: 12,
  unreviewedDays: 7,
} as const;

const INFO_CODES = new Set<AdvisoryCode>(['ai-inferred-unreviewed']);

export const advisory = (code: AdvisoryCode, targetId: string, message: string): Advisory => ({
  code,
  severity: INFO_CODES.has(code) ? 'info' : 'warn',
  targetId,
  message,
});

/** Every first-class entity (systems, requirements, intents); edges are lighter and handled apart. */
export const entities = (p: Project) => [...p.systems, ...p.requirements, ...p.intents];
