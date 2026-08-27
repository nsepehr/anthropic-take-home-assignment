import { z } from 'zod';
import { EntityBase } from './entity.js';

export const IntentStatus = z.enum(['active', 'superseded']);

/**
 * A human decision and its reasoning. First-class because one decision explains many things.
 * `lifecycle` (on every entity) tracks whether the decision still stands; `provenance` tracks
 * whether a human verified the record. They answer different questions.
 */
export const IntentSchema = EntityBase.extend({
  statement: z.string().min(1),
  rationale: z.string().min(1),
  /** @deprecated Use `lifecycle`. Still accepted; `validateProject` maps it and reports a notice. */
  status: IntentStatus.optional(),
  /** @deprecated Use `lifecycle.supersededBy`. */
  supersededBy: z.string().optional(),
  appliesTo: z.object({
    systemIds: z.array(z.string()),
    requirementIds: z.array(z.string()),
    edgeIds: z.array(z.string()),
  }),
});

export type Intent = z.infer<typeof IntentSchema>;
