import { z } from 'zod';

/** Who vouches for a claim, when, and from where. Required on every first-class entity. */
export const ProvenanceSchema = z.object({
  source: z.enum(['human-verified', 'ai-inferred']),
  capturedAt: z.string().datetime({ offset: true }),
  sessionRef: z.string().optional(),
});

export type Provenance = z.infer<typeof ProvenanceSchema>;
