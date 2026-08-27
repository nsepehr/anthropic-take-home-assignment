/**
 * @app/shared — the data-model contract between server and client.
 * Changes here affect every parallel agent: keep them minimal and call them out in your report.
 */

/** Placeholder until the real architecture model lands. */
export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
}
