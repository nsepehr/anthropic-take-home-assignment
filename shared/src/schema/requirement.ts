import { z } from 'zod';
import { EntityBase } from './entity.js';

export const RequirementKind = z.enum(['functional', 'non-functional', 'constraint']);
export const RequirementStatus = z.enum(['planned', 'partial', 'implemented']);

/** Something the product must do or respect, with the systems serving it and proof of status. */
export const RequirementSchema = EntityBase.extend({
  title: z.string().min(1),
  kind: RequirementKind,
  status: RequirementStatus,
  systemIds: z.array(z.string()),
  evidence: z.array(z.string()),
});

export type Requirement = z.infer<typeof RequirementSchema>;
