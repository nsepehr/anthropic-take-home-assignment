import type { ValidateResult } from '@app/shared';
import type { ProjectStore } from '../src/projectStore.js';

/** In-memory fake of `ProjectStore` for route tests. */
export function createStaticStore(result: ValidateResult): ProjectStore {
  return { current: () => result, reload: () => result };
}
