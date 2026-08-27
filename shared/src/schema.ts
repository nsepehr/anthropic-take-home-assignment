import { z } from 'zod';

/** Zod schemas for the architecture model. Types are inferred from these — one definition. */

export const ProvenanceSchema = z.object({
  source: z.enum(['human-verified', 'ai-inferred']),
  capturedAt: z.string().datetime({ offset: true }),
  sessionRef: z.string().optional(),
});

/** Fields every first-class entity carries: identity, two levels of language, and trust. */
const EntityBase = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  detail: z.string().min(1),
  provenance: ProvenanceSchema,
});

export const SystemKind = z.enum(['ui', 'service', 'module', 'store', 'external', 'workflow']);
export const SystemSchema = EntityBase.extend({
  name: z.string().min(1),
  kind: SystemKind,
  parentId: z.string().optional(),
  paths: z.array(z.string()),
  requirementIds: z.array(z.string()),
  intentIds: z.array(z.string()),
});

export const RequirementKind = z.enum(['functional', 'non-functional', 'constraint']);
export const RequirementStatus = z.enum(['planned', 'partial', 'implemented']);
export const RequirementSchema = EntityBase.extend({
  title: z.string().min(1),
  kind: RequirementKind,
  status: RequirementStatus,
  systemIds: z.array(z.string()),
  intentIds: z.array(z.string()),
  evidence: z.array(z.string()),
});

export const IntentSchema = EntityBase.extend({
  statement: z.string().min(1),
  rationale: z.string().min(1),
  alternativesRejected: z.array(z.string()),
  tradeoffs: z.string(),
  appliesTo: z.object({
    systemIds: z.array(z.string()),
    requirementIds: z.array(z.string()),
    edgeIds: z.array(z.string()),
  }),
});

export const EdgeKind = z.enum(['calls', 'reads', 'writes', 'emits', 'depends']);
/**
 * Edges are lightweight: `summary`/`detail` are optional and there is no provenance of their own.
 * An edge's explanation lives in the Intent it points to (`intentId`); the endpoints carry trust.
 */
export const EdgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  kind: EdgeKind,
  label: z.string().optional(),
  intentId: z.string().optional(),
  summary: z.string().optional(),
  detail: z.string().optional(),
});

export const ProjectSchema = z.object({
  name: z.string().min(1),
  mission: z.string().min(1),
  systems: z.array(SystemSchema),
  requirements: z.array(RequirementSchema),
  intents: z.array(IntentSchema),
  edges: z.array(EdgeSchema),
});

export type Provenance = z.infer<typeof ProvenanceSchema>;
export type System = z.infer<typeof SystemSchema>;
export type Requirement = z.infer<typeof RequirementSchema>;
export type Intent = z.infer<typeof IntentSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type Project = z.infer<typeof ProjectSchema>;

/** Computed by `computeGaps`, never stored: what the model cannot explain. */
export interface Gaps {
  systemsWithoutIntent: string[];
  requirementsWithoutSystem: string[];
  edgesWithoutIntent: string[];
  intentsWithoutTarget: string[];
}

/** A readable validation error: where it is and what is wrong. */
export interface ValidationError {
  path: string;
  message: string;
}
