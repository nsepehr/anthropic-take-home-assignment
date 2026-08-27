import type { Intent, Project } from './schema/index.js';
import type { ValidationError } from './validationTypes.js';

const NOTE =
  'Intent "status"/"supersededBy" are deprecated — use ' +
  'lifecycle: { state: "superseded", supersededBy, since, reason }';

/**
 * Older project files mark a replaced decision with `Intent.status: 'superseded'` instead of the
 * generic `lifecycle` block. Rewrites those onto `lifecycle` so every downstream rule sees one
 * representation, and returns a readable note per file so `validate:data` can nudge the author.
 * A hand-written `lifecycle` always wins; the legacy pair is then dropped as noise.
 */
export function normalizeLegacyStatus(project: Project): {
  project: Project;
  notices: ValidationError[];
} {
  const notices: ValidationError[] = [];
  const intents = project.intents.map((intent, index) => {
    if (intent.status === undefined && intent.supersededBy === undefined) return intent;
    notices.push({ path: `intents.${index}`, message: NOTE });
    return migrate(intent);
  });
  return { project: { ...project, intents }, notices };
}

function migrate(intent: Intent): Intent {
  const { status, supersededBy, ...rest } = intent;
  if (rest.lifecycle) return rest;
  // `status: 'active'` was the default; it says nothing the absent lifecycle block does not.
  if (status !== 'superseded' && supersededBy === undefined) return rest;
  return {
    ...rest,
    lifecycle: {
      // Either half of the legacy pair saying "replaced" is taken at face value. One that
      // disagreed with itself (superseded with no target) still fails `checkLifecycle` — the
      // mapping must not launder an inconsistent record into a valid one.
      state: 'superseded',
      supersededBy,
      // The legacy shape carried no date of its own; the record's own capture date is the best
      // honest answer, and it keeps `since` required for everything written from now on.
      since: rest.provenance.capturedAt,
    },
  };
}
