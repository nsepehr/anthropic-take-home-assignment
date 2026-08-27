import { z } from 'zod';
import { EdgeSchema } from './edge.js';
import { IntentSchema } from './intent.js';
import { RequirementSchema } from './requirement.js';
import { SystemSchema } from './system.js';

/** The whole model of one codebase. Stores no layout coordinates; the client computes those. */
export const ProjectSchema = z.object({
  name: z.string().min(1),
  mission: z.string().min(1),
  systems: z.array(SystemSchema),
  requirements: z.array(RequirementSchema),
  intents: z.array(IntentSchema),
  edges: z.array(EdgeSchema),
});

export type Project = z.infer<typeof ProjectSchema>;
