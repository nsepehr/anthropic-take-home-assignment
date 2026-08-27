import { z } from 'zod';
import { EntityBase } from './entity.js';

/**
 * A classification of top-level systems (a lane in the flat view, a card at the overview level
 * of the drill-down). `System.category` values are category ids; the list is optional so a
 * project with plain category strings stays valid.
 */
export const CategorySchema = EntityBase.extend({
  name: z.string().min(1),
});

export type Category = z.infer<typeof CategorySchema>;
