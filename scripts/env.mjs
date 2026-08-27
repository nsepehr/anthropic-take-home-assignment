// Tiny .env.local loader shared by the dev runner and ports script. No deps.
import fs from 'node:fs';
import path from 'node:path';

export const ENV_FILE = '.env.local';
export const DEFAULTS = { CLIENT_PORT: 5173, SERVER_PORT: 3001 };

export function parseEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

export function envFilePath(dir = process.cwd()) {
  return path.join(dir, ENV_FILE);
}
