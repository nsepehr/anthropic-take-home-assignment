import type { Edge, Intent, Project, Requirement, System } from '@app/shared';

/** A single entity tagged with which collection it came from. */
export type TaggedEntity =
  | { type: 'system'; entity: System }
  | { type: 'requirement'; entity: Requirement }
  | { type: 'intent'; entity: Intent }
  | { type: 'edge'; entity: Edge };

/** Looks `id` up across all four collections. Ids are unique across types (validated). */
export function findEntity(project: Project, id: string): TaggedEntity | undefined {
  const collections = [
    ['system', project.systems],
    ['requirement', project.requirements],
    ['intent', project.intents],
    ['edge', project.edges],
  ] as const;
  for (const [type, entities] of collections) {
    const entity = entities.find((e) => e.id === id);
    if (entity) return { type, entity } as TaggedEntity;
  }
  return undefined;
}
