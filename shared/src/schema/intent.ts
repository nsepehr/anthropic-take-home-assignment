import { z } from 'zod';
import { EntityBase } from './entity.js';

export const IntentStatus = z.enum(['active', 'superseded']);

/**
 * A human decision and its reasoning. First-class because one decision explains many things.
 * `status`/`supersededBy` track whether the decision still stands; `provenance` (on every entity)
 * tracks whether a human verified the record. They answer different questions.
 */
export const IntentSchema = EntityBase.extend({
  statement: z.string().min(1),
  rationale: z.string().min(1),
  status: IntentStatus,
  supersededBy: z.string().optional(),
  appliesTo: z.object({
    systemIds: z.array(z.string()),
    requirementIds: z.array(z.string()),
    edgeIds: z.array(z.string()),
  }),
});

export type Intent = z.infer<typeof IntentSchema>;
