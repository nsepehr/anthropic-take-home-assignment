import { readFileSync } from 'node:fs';
import { validateProject, type ValidateResult } from '@app/shared';

/**
 * Holds the validated project for the life of the process. Loaded once at startup; `reload()`
 * re-reads the file. A broken file is stored as `{ ok: false, errors }` rather than thrown, so the
 * server still boots and the problem is visible on `/api/project` and `/api/health`.
 */
export interface ProjectStore {
  current(): ValidateResult;
  reload(): ValidateResult;
}

/** File-backed store (the fs edge). */
export function createProjectStore(file: string): ProjectStore {
  let state = loadProjectFile(file);
  return {
    current: () => state,
    reload: () => (state = loadProjectFile(file)),
  };
}

function loadProjectFile(file: string): ValidateResult {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, errors: [{ path: file, message }] };
  }
  return validateProject(raw);
}
