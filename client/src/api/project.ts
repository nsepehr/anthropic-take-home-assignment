import { validateProject, type Project } from '@app/shared';

/** API results are values, never thrown: callers branch on `ok`. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** The only module that calls `fetch`. Every response is parsed at this boundary. */
export async function fetchProject(): Promise<ApiResult<Project>> {
  const body = await getJson('/api/project');
  if (!body.ok) return body;
  const result = validateProject(body.data);
  if (!result.ok) {
    const detail = result.errors.map((e) => `${e.path}: ${e.message}`).join('; ');
    return { ok: false, error: `invalid project payload: ${detail}` };
  }
  return { ok: true, data: result.project };
}

async function getJson(url: string): Promise<ApiResult<unknown>> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    return { ok: false, error: `network error: ${(err as Error).message}` };
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { ok: false, error: `${url}: response is not JSON (${response.status})` };
  }
  if (!response.ok) return { ok: false, error: `${url}: ${response.status}${serverMessage(data)}` };
  return { ok: true, data };
}

function serverMessage(body: unknown): string {
  return body && typeof body === 'object' && 'error' in body ? ` ${String(body.error)}` : '';
}
