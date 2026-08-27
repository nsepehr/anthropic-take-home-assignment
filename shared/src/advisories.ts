import type { Project } from './schema/index.js';
import { categoryRules, stageRules } from './advisoryCategories.js';
import { advisory, entities, LIMITS, type Advisory } from './advisoryCore.js';
import { currentOnly } from './lifecycle.js';

export type { Advisory, AdvisoryCode } from './advisoryCore.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const wordCount = (text: string): number => text.split(/\s+/).filter(Boolean).length;

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

/** Runs on current entries only, so a system missing here is one that is no longer current. */
function lifecycleRules(project: Project): Advisory[] {
  const live = new Set(project.systems.map((s) => s.id));
  return project.requirements
    .filter((r) => r.systemIds.length > 0 && !r.systemIds.some((id) => live.has(id)))
    .map((r) =>
      advisory(
        'requirement-orphaned',
        r.id,
        'every system that served it is gone; withdraw it too',
      ),
    );
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

const RULES = [
  categoryRules,
  stageRules,
  connectivityRules,
  languageRules,
  evidenceRules,
  lifecycleRules,
  provenanceRules,
];

/**
 * Pure: applies every modeling rule to the *current* entries and returns the warnings. Superseded
 * and withdrawn entries are history, not live modeling debt. `now` is injectable for tests.
 */
export function computeAdvisories(full: Project, now: Date = new Date()): Advisory[] {
  const project = currentOnly(full);
  return RULES.flatMap((rule) => rule(project, now));
}
