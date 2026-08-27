import { z } from 'zod';
import { EntityBase } from './entity.js';

/** A human decision and its reasoning. First-class because one decision explains many things. */
export const IntentSchema = EntityBase.extend({
  statement: z.string().min(1),
  rationale: z.string().min(1),
  appliesTo: z.object({
    systemIds: z.array(z.string()),
    requirementIds: z.array(z.string()),
    edgeIds: z.array(z.string()),
  }),
});

export type Intent = z.infer<typeof IntentSchema>;
