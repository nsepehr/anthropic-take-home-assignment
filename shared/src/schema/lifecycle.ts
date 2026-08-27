import { z } from 'zod';

/** There is no `current` value: **absent means current**, so nothing is annotated until it changes. */
export const LifecycleState = z.enum(['superseded', 'withdrawn']);

/**
 * Why an entry is no longer the current truth. Optional on every entity and edge. Entries are
 * never deleted — a replaced one is `superseded` and points at its replacement, one that stopped
 * being wanted is `withdrawn` and says why in `reason`. The two cross-field rules (which of
 * `supersededBy`/`reason` each state owes) are checked by `validateProject`, not by this shape.
 */
export const LifecycleSchema = z.object({
  state: LifecycleState,
  /** The entry that replaced this one. Required by `superseded`, banned on `withdrawn`. */
  supersededBy: z.string().optional(),
  /** When this entry stopped being current. */
  since: z.string().datetime({ offset: true }),
  /** One line saying why. Required by `withdrawn`, optional on `superseded`. */
  reason: z.string().optional(),
});

export type Lifecycle = z.infer<typeof LifecycleSchema>;
