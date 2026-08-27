import { z } from 'zod';
import { LifecycleSchema } from './lifecycle.js';
import { ProvenanceSchema } from './provenance.js';

/** Fields every first-class entity carries: identity, two levels of language, and trust. */
export const EntityBase = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  detail: z.string().min(1),
  provenance: ProvenanceSchema,
  /** Absent = current. See `schema/lifecycle.ts`. */
  lifecycle: LifecycleSchema.optional(),
});
