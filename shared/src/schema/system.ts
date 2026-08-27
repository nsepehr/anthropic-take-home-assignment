import { z } from 'zod';
import { EntityBase } from './entity.js';

export const SystemKind = z.enum(['ui', 'service', 'module', 'store', 'external', 'workflow']);

/**
 * A box on the diagram: a unit of the architecture, optionally nested via `parentId`.
 * Links to requirements and intents are stored on those entities and derived by `relatedTo`.
 */
export const SystemSchema = EntityBase.extend({
  name: z.string().min(1),
  kind: SystemKind,
  parentId: z.string().optional(),
  paths: z.array(z.string()),
});

export type System = z.infer<typeof SystemSchema>;
