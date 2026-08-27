import { useProject } from '../../state/projectStore';
import { DebugCanvas } from './components/DebugCanvas';
import { DebugSelectionText } from './components/DebugSelectionText';

/** Throwaway page proving the data → layout → selection pipeline. Replaced by the design pass. */
export function DebugPage() {
  const { loading, error, project } = useProject();
  return (
    <main style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h1>Codebase Map — debug</h1>
      {loading && <p>Loading project…</p>}
      {error && <p>Error: {error}</p>}
      {project && (
        <>
          <DebugSelectionText />
          <DebugCanvas project={project} />
        </>
      )}
    </main>
  );
}
