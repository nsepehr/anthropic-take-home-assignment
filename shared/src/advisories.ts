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
  | 'system-too-connected'
  | 'system-isolated'
  | 'edge-unlabeled'
  | 'summary-too-long'
  | 'detail-missing-how'
  | 'intent-is-description'
  | 'requirement-no-evidence'
  | 'ai-inferred-unreviewed';

const LIMITS = {
  systemsPerCategory: 8,
  categories: 6,
  edgesPerSystem: 6,
  summaryWords: 20,
  rationaleWords: 12,
  unreviewedDays: 7,
} as const;

const INFO_CODES = new Set<AdvisoryCode>(['ai-inferred-unreviewed']);
const DAY_MS = 24 * 60 * 60 * 1000;

const advisory = (code: AdvisoryCode, targetId: string, message: string): Advisory => ({
  code,
  severity: INFO_CODES.has(code) ? 'info' : 'warn',
  targetId,
  message,
});

const wordCount = (text: string): number => text.split(/\s+/).filter(Boolean).length;

/** Every first-class entity (systems, requirements, intents); edges are lighter and handled apart. */
const entities = (p: Project) => [...p.systems, ...p.requirements, ...p.intents];

function categoryRules(project: Project): Advisory[] {
  const byCategory = new Map<string, number>();
  for (const s of project.systems) {
    if (s.parentId || !s.category) continue;
    byCategory.set(s.category, (byCategory.get(s.category) ?? 0) + 1);
  }
  const out: Advisory[] = [];
  for (const [category, count] of byCategory) {
    if (count > LIMITS.systemsPerCategory) {
      const msg = `${count} top-level systems (max ${LIMITS.systemsPerCategory}); nest or merge`;
      out.push(advisory('category-too-large', category, msg));
    }
  }
  if (byCategory.size > LIMITS.categories) {
    const msg = `${byCategory.size} categories (max ${LIMITS.categories}); merge lanes`;
    out.push(advisory('too-many-categories', project.name, msg));
  }
  return out;
}

function connectivityRules(project: Project): Advisory[] {
  const degree = new Map<string, number>();
  for (const e of project.edges) {
    for (const id of [e.from, e.to]) degree.set(id, (degree.get(id) ?? 0) + 1);
  }
  const containers = new Set(project.systems.map((s) => s.parentId));
  const out: Advisory[] = [];
  for (const s of project.systems) {
    const n = degree.get(s.id) ?? 0;
    if (n > LIMITS.edgesPerSystem) {
      const msg = `${n} edges (max ${LIMITS.edgesPerSystem}); split it or drop unevidenced edges`;
      out.push(advisory('system-too-connected', s.id, msg));
    } else if (n === 0 && !s.parentId && !containers.has(s.id)) {
      out.push(advisory('system-isolated', s.id, 'no edges; add an evidenced edge or nest it'));
    }
  }
  return out;
}

function languageRules(project: Project): Advisory[] {
  const out: Advisory[] = [];
  for (const e of [...entities(project), ...project.edges]) {
    const words = wordCount(e.summary ?? '');
    if (words > LIMITS.summaryWords) {
      out.push(advisory('summary-too-long', e.id, `${words} words (max ${LIMITS.summaryWords})`));
    }
  }
  for (const e of entities(project)) {
    if (e.detail.length < e.summary.length) {
      out.push(
        advisory('detail-missing-how', e.id, 'detail shorter than summary; say how it works'),
      );
    }
  }
  for (const e of project.edges) {
    if (!e.label?.trim()) out.push(advisory('edge-unlabeled', e.id, 'add a short label'));
  }
  for (const i of project.intents) {
    const words = wordCount(i.rationale);
    if (words < LIMITS.rationaleWords) {
      const msg = `rationale is ${words} words (min ${LIMITS.rationaleWords}); say why, not what`;
      out.push(advisory('intent-is-description', i.id, msg));
    }
  }
  return out;
}

function evidenceRules(project: Project): Advisory[] {
  return project.requirements
    .filter((r) => r.status !== 'planned' && r.evidence.length === 0)
    .map((r) => advisory('requirement-no-evidence', r.id, `status ${r.status} but no evidence`));
}

function provenanceRules(project: Project, now: Date): Advisory[] {
  const cutoff = now.getTime() - LIMITS.unreviewedDays * DAY_MS;
  return entities(project)
    .filter(
      (e) => e.provenance.source === 'ai-inferred' && Date.parse(e.provenance.capturedAt) < cutoff,
    )
    .map((e) => {
      const since = e.provenance.capturedAt.slice(0, 10);
      return advisory(
        'ai-inferred-unreviewed',
        e.id,
        `ai-inferred since ${since}; have a human review it`,
      );
    });
}

const RULES = [categoryRules, connectivityRules, languageRules, evidenceRules, provenanceRules];

/** Pure: applies every modeling rule and returns the warnings. `now` is injectable for tests. */
export function computeAdvisories(project: Project, now: Date = new Date()): Advisory[] {
  return RULES.flatMap((rule) => rule(project, now));
}
