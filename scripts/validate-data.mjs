#!/usr/bin/env node
// Validates data/project.json with @app/shared and prints the gaps report.
// Runs against the built package (npm run build -w shared) so it needs no TS runner.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProject } from '@app/shared';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'data', 'project.json');
const result = validateProject(JSON.parse(fs.readFileSync(file, 'utf8')));

if (!result.ok) {
  console.error(`data/project.json is invalid (${result.errors.length} error(s)):`);
  for (const e of result.errors) console.error(`  ${e.path}: ${e.message}`);
  process.exit(1);
}

const { project, gaps } = result;
console.log(
  `data/project.json OK — ${project.systems.length} systems, ${project.requirements.length} requirements, ` +
    `${project.intents.length} intents, ${project.edges.length} edges`,
);
console.log('Gaps (unexplained, shown honestly in the UI):');
for (const [key, ids] of Object.entries(gaps)) {
  console.log(`  ${key}: ${ids.length ? ids.join(', ') : '(none)'}`);
}
