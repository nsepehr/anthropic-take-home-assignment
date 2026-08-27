import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProject, type ValidateResult } from '@app/shared';

const dir = path.dirname(fileURLToPath(import.meta.url));

export const fixturePath = (name: string) => path.join(dir, name);

/** Reads and validates a fixture that is expected to be valid. */
export function loadFixture(name: string): Extract<ValidateResult, { ok: true }> {
  const result = validateProject(JSON.parse(readFileSync(fixturePath(name), 'utf8')));
  if (!result.ok) throw new Error(`fixture ${name} is invalid: ${JSON.stringify(result.errors)}`);
  return result;
}
