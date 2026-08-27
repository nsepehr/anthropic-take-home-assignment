/**
 * @app/shared — the data-model contract between server and client.
 * Changes here affect every parallel agent: keep them minimal and call them out in your report.
 */

export * from './schema.js';
export { validateProject, type ValidateResult } from './validate.js';
export { computeGaps } from './gaps.js';
export { getSystem, relatedTo, type Related } from './related.js';

/** Response shape of `GET /api/health`. */
export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
}
