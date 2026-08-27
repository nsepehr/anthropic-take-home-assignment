/**
 * @app/shared — the data-model contract between server and client.
 * Changes here affect every parallel agent: keep them minimal and call them out in your report.
 */

export * from './schema/index.js';
export { validateProject, type ValidateResult, type ValidationError } from './validate.js';
export { computeGaps, type Gaps } from './gaps.js';
export { computeAdvisories, type Advisory, type AdvisoryCode } from './advisories.js';
export { getSystem, relatedTo, type Related } from './related.js';

/** Response shape of `GET /api/health`. */
export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
  /** Whether the project file loaded and validated; `name` is present only when it did. */
  project?: { loaded: true; name: string } | { loaded: false };
}
