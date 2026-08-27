import { validateProject, type Project } from '@app/shared';
import seed from '../../../data/project.json';

/** The repo's own seed, validated once, as the client test fixture. */
export const seedProject: Project = (() => {
  const result = validateProject(seed);
  if (!result.ok) throw new Error('data/project.json is invalid');
  return result.project;
})();
