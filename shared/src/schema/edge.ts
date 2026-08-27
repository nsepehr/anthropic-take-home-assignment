import { z } from 'zod';
import { LifecycleSchema } from './lifecycle.js';

export const EdgeKind = z.enum(['calls', 'reads', 'writes', 'emits', 'depends']);

/**
 * An arrow between two systems. Deliberately lightweight: `summary`/`detail` are optional and
 * there is no provenance of its own — the "why" lives in the Intent at `intentId`, and the
 * endpoints carry trust.
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
  /** Absent = current. See `schema/lifecycle.ts`. */
  lifecycle: LifecycleSchema.optional(),
});

export type Edge = z.infer<typeof EdgeSchema>;
