import { featuresFirst } from '../../model/entities';
import { useProject } from '../../state/projectStore';
import { useSearch } from '../../state/search';
import { Paragraphs } from './components/Paragraphs';
import { EntityList } from './EntityList';
import { IntentCard } from './IntentCard';
import { RequirementCard } from './RequirementCard';

/** The panel with nothing selected: the whole project — mission, every requirement, every intent. */
export function ProjectOverview() {
  const { project } = useProject();
  const { filter } = useSearch();
  if (!project) return null;
  const { systems, requirements, intents } = project;
  const [shownRequirements, shownIntents] = [filter(requirements), filter(intents)];
  return (
    <div className="panel">
      <article className="panel-detail">
        <span className="card-kicker">Project</span>
        <h2 className="panel-detail-title">{project.name}</h2>
        <Paragraphs className="panel-detail-summary" text={project.mission} />
        <div className="panel-counts">
          {`${systems.length} systems · ${requirements.length} requirements · ${intents.length} intents`}
        </div>
      </article>
      <EntityList heading="Requirements" count={shownRequirements.length}>
        {featuresFirst(shownRequirements).map((r) => (
          <RequirementCard key={r.id} requirement={r} />
        ))}
      </EntityList>
      <EntityList heading="Intents" count={shownIntents.length}>
        {shownIntents.map((i) => (
          <IntentCard key={i.id} intent={i} />
        ))}
      </EntityList>
    </div>
  );
}
