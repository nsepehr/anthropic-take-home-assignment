import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** The only place `process.env` is read. */
export interface Config {
  port: number;
  host: string;
  projectFile: string;
  isProduction: boolean;
  isTest: boolean;
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.SERVER_PORT ?? 3001),
    host: '127.0.0.1',
    projectFile: path.resolve(env.PROJECT_FILE ?? path.join(repoRoot, 'data', 'project.json')),
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  };
}
