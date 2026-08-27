#!/usr/bin/env node
// Validates data/project.json with @app/shared and prints the gaps and advisories reports.
// Runs against the built package (npm run build -w shared) so it needs no TS runner.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeAdvisories, validateProject } from '@app/shared';

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

// Advisories are warnings against docs/MODELING.md; they never fail the run.
const advisories = computeAdvisories(project);
console.log(`Advisories (${advisories.length}, see docs/MODELING.md):`);
if (advisories.length === 0) console.log('  (none)');
const byCode = new Map();
for (const a of advisories) {
  const list = byCode.get(a.code);
  if (list) list.push(a);
  else byCode.set(a.code, [a]);
}
for (const [code, list] of byCode) {
  const targets = list.slice(0, 3).map((a) => `${a.targetId} (${a.message})`);
  const more = list.length > 3 ? `, +${list.length - 3} more` : '';
  console.log(`  [${list[0].severity}] ${code} ×${list.length}: ${targets.join('; ')}${more}`);
}
