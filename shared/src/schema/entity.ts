import { z } from 'zod';
import { ProvenanceSchema } from './provenance.js';

/** Fields every first-class entity carries: identity, two levels of language, and trust. */
export const EntityBase = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  detail: z.string().min(1),
  provenance: ProvenanceSchema,
});
