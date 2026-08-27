import { describe, expect, it } from 'vitest';
import { computeAdvisories, type AdvisoryCode } from './advisories.js';
import type { Project, System } from './schema/index.js';
import { fullyLinkedProject } from './test/fixture.js';

const NOW = new Date('2026-08-27T00:00:00Z');
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');

/** The shared fixture, tidied until it yields zero advisories; each test breaks one rule. */
function cleanProject(): Project {
  const p = fullyLinkedProject();
  for (const s of p.systems) s.category = 'Core';
  for (const i of p.intents) i.rationale = words(12);
  p.requirements[1]!.evidence = ['shared/src/gaps.ts'];
  p.edges[0]!.label = 'calls';
  p.edges.push({ id: 'edge-2', from: 'sys-parent', to: 'sys-other', kind: 'depends', label: 'x' });
  return p;
}

const TEMPLATE_SYSTEM = { ...fullyLinkedProject().systems[2]!, category: 'Core' };
const system = (id: string, extra: Partial<System> = {}): System => ({
  ...TEMPLATE_SYSTEM,
  id,
  ...extra,
});

const codes = (p: Project): AdvisoryCode[] => computeAdvisories(p, NOW).map((a) => a.code);
const targets = (p: Project, code: AdvisoryCode) =>
  computeAdvisories(p, NOW)
    .filter((a) => a.code === code)
    .map((a) => a.targetId);

describe('computeAdvisories', () => {
  it('a compact, well-written project yields no advisories', () => {
    expect(computeAdvisories(cleanProject(), NOW)).toEqual([]);
  });

  it('category-too-large: more than 8 top-level systems in one category (nested do not count)', () => {
    const p = cleanProject();
    for (let i = 0; i < 6; i++) p.systems.push(system(`sys-x${i}`, { parentId: 'sys-parent' }));
    expect(codes(p)).not.toContain('category-too-large');
    for (let i = 0; i < 7; i++) p.systems.push(system(`sys-y${i}`));
    expect(targets(p, 'category-too-large')).toEqual(['Core']);
  });

  it('too-many-categories: more than 6 distinct categories', () => {
    const p = cleanProject();
    for (let i = 0; i < 6; i++) p.systems.push(system(`sys-c${i}`, { category: `Cat${i}` }));
    expect(targets(p, 'too-many-categories')).toEqual(['Fixture']);
  });

  it('system-too-connected: more than 6 edges touching one system', () => {
    const p = cleanProject();
    for (let i = 0; i < 6; i++) {
      p.edges.push({
        id: `edge-n${i}`,
        from: 'sys-other',
        to: 'sys-parent',
        kind: 'calls',
        label: 'l',
      });
    }
    expect(targets(p, 'system-too-connected')).toEqual(['sys-parent', 'sys-other']);
  });

  it('system-isolated: a top-level system with no edges; nested systems and containers are exempt', () => {
    const p = cleanProject();
    p.edges = p.edges.filter((e) => e.from !== 'sys-parent'); // sys-parent keeps only sys-child
    p.systems.push(system('sys-lonely'), system('sys-nested', { parentId: 'sys-parent' }));
    expect(targets(p, 'system-isolated')).toEqual(['sys-lonely']);
  });

  it('edge-unlabeled: missing or blank label', () => {
    const p = cleanProject();
    p.edges[0]!.label = '  ';
    expect(targets(p, 'edge-unlabeled')).toEqual(['edge-1']);
  });

  it('summary-too-long: over 20 words, on entities and edges alike', () => {
    const p = cleanProject();
    p.systems[0]!.summary = words(20);
    expect(codes(p)).not.toContain('summary-too-long');
    p.systems[0]!.summary = words(21);
    p.edges[0]!.summary = words(21);
    expect(targets(p, 'summary-too-long')).toEqual(['sys-parent', 'edge-1']);
  });

  it('detail-missing-how: detail shorter than summary', () => {
    const p = cleanProject();
    p.requirements[0]!.summary = 'A long summary sentence.';
    p.requirements[0]!.detail = 'Short.';
    expect(targets(p, 'detail-missing-how')).toEqual(['req-a']);
  });

  it('intent-is-description: rationale under 12 words', () => {
    const p = cleanProject();
    p.intents[0]!.rationale = words(11);
    expect(targets(p, 'intent-is-description')).toEqual(['int-a']);
  });

  it('requirement-no-evidence: implemented/partial with no evidence; planned is fine', () => {
    const p = cleanProject();
    p.requirements[0]!.status = 'partial';
    expect(targets(p, 'requirement-no-evidence')).toEqual(['req-a']);
    p.requirements[0]!.status = 'planned';
    expect(codes(p)).not.toContain('requirement-no-evidence');
  });

  it('ai-inferred-unreviewed (info): ai-inferred entries older than 7 days relative to now', () => {
    const p = cleanProject();
    p.systems[0]!.provenance = { source: 'ai-inferred', capturedAt: '2026-08-19T00:00:00Z' };
    p.systems[2]!.provenance = { source: 'ai-inferred', capturedAt: '2026-08-21T00:00:00Z' };
    p.intents[0]!.provenance = { source: 'human-verified', capturedAt: '2026-01-01T00:00:00Z' };
    const found = computeAdvisories(p, NOW).filter((a) => a.code === 'ai-inferred-unreviewed');
    expect(found.map((a) => a.targetId)).toEqual(['sys-parent']);
    expect(found[0]!.severity).toBe('info');
  });
});
