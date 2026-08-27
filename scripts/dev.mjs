#!/usr/bin/env node
// Runs client + server dev servers with ports from .env.local (allocating them if missing).
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULTS, envFilePath, parseEnvFile } from './env.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const portsScript = path.join(root, 'scripts', 'ports.mjs');

spawnSync(process.execPath, [portsScript], { cwd: root, stdio: 'inherit' });
const env = { ...DEFAULTS, ...process.env, ...parseEnvFile(envFilePath(root)) };

console.log(
  `\n  client → http://localhost:${env.CLIENT_PORT}\n  server → http://127.0.0.1:${env.SERVER_PORT}/api/health\n`,
);

const children = ['server', 'client'].map((ws) =>
  spawn('npm', ['run', 'dev', '-w', ws], { cwd: root, env, stdio: 'inherit' }),
);

const shutdown = () => {
  for (const c of children) c.kill('SIGTERM');
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
for (const c of children)
  c.on('exit', (code) => {
    if (code && code !== 0) {
      shutdown();
      process.exit(code);
    }
  });
